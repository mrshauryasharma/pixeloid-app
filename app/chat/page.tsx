'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { Canvas } from '@react-three/fiber';
import { RobotModel } from '@/components/3d/RobotModel';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(20);
  const [plan, setPlan] = useState('free');
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatLoadedRef = useRef(false);
  const currentChatUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setMessages([{ role: 'assistant', content: '👋 Please login to use AI chat!', timestamp: new Date() }]);
        setCredits(0);
        setChatSessions([]);
        chatLoadedRef.current = false;
      } else {
        fetchUserCredits(currentUser.uid);
        if (!chatLoadedRef.current) {
          loadChatSessions(currentUser.uid);
          chatLoadedRef.current = true;
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserCredits = async (uid: string) => {
    try {
      const res = await fetch('/api/credits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: uid }) });
      const data = await res.json();
      setCredits(data.credits || 20);
      setPlan(data.plan || 'free');
    } catch (error) {}
  };

  const loadChatSessions = (uid: string) => {
    const chatsRef = collection(db, 'users', uid, 'chats');
    const q = query(chatsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const sessions: ChatSession[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        sessions.push({ id: document.id, title: data.title || 'New Chat', lastMessage: data.lastMessage || '', createdAt: data.createdAt?.toDate() || new Date() });
      });
      setChatSessions(sessions);
    });
  };

  const createNewChat = () => {
    if (currentChatUnsubscribe.current) {
      currentChatUnsubscribe.current();
    }
    setCurrentChatId('');
    setMessages([{ role: 'assistant', content: `Hello ${user?.displayName || user?.email?.split('@')[0] || 'User'}! How can I help you today? ✨`, timestamp: new Date() }]);
  };

  const loadChat = (chatId: string) => {
    if (currentChatUnsubscribe.current) {
      currentChatUnsubscribe.current();
    }
    setCurrentChatId(chatId);
    const messagesRef = collection(db, 'users', user!.uid, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        msgs.push({ id: document.id, role: data.role, content: data.content, timestamp: data.timestamp?.toDate() || new Date() });
      });
      setMessages(msgs.length > 0 ? msgs : [{ role: 'assistant', content: 'Start chatting! ✨', timestamp: new Date() }]);
    });
    currentChatUnsubscribe.current = unsub;
  };

  const startEdit = (msg: Message) => {
    if (!msg.id) return;
    setEditingMsgId(msg.id);
    setEditText(msg.content);
  };

  const cancelEdit = () => { setEditingMsgId(null); setEditText(''); };

  const saveEdit = async () => {
    if (!editText.trim() || !editingMsgId || !currentChatId || !user) return;
    try {
      const msgRef = doc(db, 'users', user.uid, 'chats', currentChatId, 'messages', editingMsgId);
      await updateDoc(msgRef, { content: editText.trim() });
      setEditingMsgId(null);
      setEditText('');
    } catch (error) {}
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat?')) return;
    try {
      const messagesRef = collection(db, 'users', user!.uid, 'chats', chatId, 'messages');
      const snapshot = await getDocs(query(messagesRef));
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      await deleteDoc(doc(db, 'users', user!.uid, 'chats', chatId));
      if (currentChatId === chatId) createNewChat();
    } catch (error) {}
  };

  const deleteAllChats = async () => {
    if (!confirm('Delete ALL chats?')) return;
    try {
      const snapshot = await getDocs(collection(db, 'users', user!.uid, 'chats'));
      const batch = writeBatch(db);
      for (const chatDoc of snapshot.docs) {
        const messagesSnapshot = await getDocs(collection(db, 'users', user!.uid, 'chats', chatDoc.id, 'messages'));
        messagesSnapshot.docs.forEach((msgDoc) => batch.delete(msgDoc.ref));
        batch.delete(chatDoc.ref);
      }
      await batch.commit();
      setChatSessions([]);
      createNewChat();
    } catch (error) {}
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!user) { alert('Please login!'); return; }
    
    const msgText = input.trim();
    const userMsg: Message = { role: 'user', content: msgText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      // Save user message to Firestore
      if (currentChatId) {
        const messagesRef = collection(db, 'users', user.uid, 'chats', currentChatId, 'messages');
        await addDoc(messagesRef, { role: 'user', content: msgText, timestamp: Timestamp.now() });
        await updateDoc(doc(db, 'users', user.uid, 'chats', currentChatId), { lastMessage: msgText.substring(0, 100) });
      }

      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, userId: user.uid, email: user.email, chatId: currentChatId }),
      });
      const data = await res.json();
      
      if (data.error === 'limit_reached') {
        const reply = `⚠️ ${data.reply}\n\n💎 Upgrade: Weekly ₹15 | Monthly ₹60 | Yearly ₹499`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
        if (currentChatId) {
          const messagesRef = collection(db, 'users', user.uid, 'chats', currentChatId, 'messages');
          await addDoc(messagesRef, { role: 'assistant', content: reply, timestamp: Timestamp.now() });
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
        if (!currentChatId && data.reply) {
          const chatRef = await addDoc(collection(db, 'users', user.uid, 'chats'), {
            title: msgText.substring(0, 50), lastMessage: data.reply.substring(0, 100), createdAt: Timestamp.now(),
          });
          setCurrentChatId(chatRef.id);
          const messagesRef = collection(db, 'users', user.uid, 'chats', chatRef.id, 'messages');
          await addDoc(messagesRef, { role: 'user', content: msgText, timestamp: Timestamp.now() });
          await addDoc(messagesRef, { role: 'assistant', content: data.reply, timestamp: Timestamp.now() });
        } else if (currentChatId) {
          const messagesRef = collection(db, 'users', user.uid, 'chats', currentChatId, 'messages');
          await addDoc(messagesRef, { role: 'assistant', content: data.reply, timestamp: Timestamp.now() });
          await updateDoc(doc(db, 'users', user.uid, 'chats', currentChatId), { lastMessage: data.reply.substring(0, 100) });
        }
        if (data.remaining !== undefined) setCredits(data.remaining);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error. Try again.', timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0c29', overflow: 'hidden', width: '100%' }}>
      
      {/* SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ width: isMobile ? '85%' : 280, maxWidth: 320, height: '100vh', background: 'rgba(15,12,41,0.98)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', zIndex: isMobile ? 50 : 1, left: 0, top: 0 }}>
          {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer', width: 30, height: 30, borderRadius: '50%', zIndex: 2 }}>✕</button>}
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: 'white', fontSize: 16, fontWeight: 700, margin: '0 0 12px 0' }}>💬 Chats</h3>
            <button onClick={createNewChat} style={{ width: '100%', padding: 12, borderRadius: 12, background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, textAlign: 'left', marginBottom: 8 }}>+ New Chat</button>
            {chatSessions.length > 0 && <button onClick={deleteAllChats} style={{ width: '100%', padding: 8, borderRadius: 8, background: 'rgba(245,87,108,0.15)', border: '1px solid rgba(245,87,108,0.25)', color: '#f5576c', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>🗑️ Delete All</button>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
            {chatSessions.length === 0 ? <div style={{ textAlign: 'center', padding: 40 }}><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No chats</p></div> : chatSessions.map(chat => (
              <div key={chat.id} onClick={() => loadChat(chat.id)} style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4, background: currentChatId === chat.id ? 'rgba(102,126,234,0.15)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title || 'New Chat'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: 0 }}>{chat.lastMessage || ''}</p>
                </div>
                <button onClick={(e) => deleteChat(chat.id, e)} style={{ background: 'none', border: 'none', color: 'rgba(245,87,108,0.6)', fontSize: 14, cursor: 'pointer', padding: 4 }}>🗑️</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />}

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.08 }}>
          <Canvas camera={{ position: [0, 1, 12], fov: 55 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={0.5} />
              <RobotModel />
            </Suspense>
          </Canvas>
        </div>

        <div style={{ background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '8px 12px' : '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>☰</button>}
            <h2 style={{ color: 'white', fontSize: isMobile ? 15 : 18, fontWeight: 700, margin: 0 }}>🤖 Pixeloid AI</h2>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ background: 'rgba(102,126,234,0.2)', color: '#667eea', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{plan.toUpperCase()}</span>
              <span style={{ color: credits <= 5 ? '#f5576c' : '#4facfe', fontSize: 18, fontWeight: 800 }}>{plan === 'yearly' ? '∞' : credits}</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 14px' : '20px 60px', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
          {messages.map((msg, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {editingMsgId === msg.id ? (
                <div style={{ display: 'flex', gap: 8, padding: 4 }}>
                  <input value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '2px solid #667eea', color: 'white', fontSize: 14, outline: 'none' }} autoFocus />
                  <button onClick={saveEdit} style={{ background: '#667eea', border: 'none', color: 'white', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✓</button>
                  <button onClick={cancelEdit} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '8px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>✕</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ maxWidth: isMobile ? '90%' : '70%' }}>
                    <div style={{ padding: isMobile ? '10px 14px' : '14px 18px', borderRadius: 18, color: 'white', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)' }}>{msg.content}</div>
                  </div>
                  {msg.role === 'user' && msg.id && <button onClick={() => startEdit(msg)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 12, padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>✏️</button>}
                </div>
              )}
            </motion.div>
          ))}
          {loading && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, padding: 8 }}>● Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: isMobile ? '10px 12px' : '14px 60px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, position: 'relative', zIndex: 2, background: 'rgba(15,12,41,0.9)' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: '4px 6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } }} placeholder="Message Pixeloid AI..." disabled={!user} style={{ flex: 1, padding: '12px 8px', background: 'transparent', border: 'none', color: 'white', fontSize: 14, outline: 'none', opacity: user ? 1 : 0.5 }} />
            <button onClick={sendMessage} disabled={!user || !input.trim() || loading} style={{ background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '50%', width: 38, height: 38, cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize: 16, flexShrink: 0, opacity: input.trim() ? 1 : 0.4 }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}