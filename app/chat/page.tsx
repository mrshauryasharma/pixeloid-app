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
  imageUrl?: string;
  imagePrompt?: string;
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
  const [imageLoading, setImageLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatLoadedRef = useRef(false);

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
    setCurrentChatId('');
    setMessages([{ role: 'assistant', content: `Hello ${user?.displayName || user?.email?.split('@')[0] || 'User'}! How can I help you today? ✨\n\n💡 Try: "Generate an image of a sunset over mountains"`, timestamp: new Date() }]);
  };

  const loadChat = (chatId: string) => {
    setCurrentChatId(chatId);
    const messagesRef = collection(db, 'users', user!.uid, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        msgs.push({
          id: document.id, role: data.role, content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
          imageUrl: data.imageUrl, imagePrompt: data.imagePrompt,
        });
      });
      setMessages(msgs.length > 0 ? msgs : [{ role: 'assistant', content: 'Start chatting! ✨', timestamp: new Date() }]);
    });
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.open(imageUrl, '_blank');
    }
  };

  const startEdit = (msg: Message) => { setEditingMsgId(msg.id || null); setEditText(msg.content); };
  const cancelEdit = () => { setEditingMsgId(null); setEditText(''); };

  const saveEdit = async () => {
    if (!editText.trim() || !editingMsgId || !currentChatId || !user) return;
    try {
      const msgRef = doc(db, 'users', user.uid, 'chats', currentChatId, 'messages', editingMsgId);
      await updateDoc(msgRef, { content: editText.trim() });
      setLoading(true);
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: editText.trim(), userId: user.uid, email: user.email, chatId: currentChatId }) });
      const data = await res.json();
      if (data.reply) {
        const messagesRef = collection(db, 'users', user.uid, 'chats', currentChatId, 'messages');
        await addDoc(messagesRef, { role: 'assistant', content: data.reply, imageUrl: data.imageUrl || null, imagePrompt: data.imagePrompt || null, timestamp: Timestamp.now() });
        if (data.remaining !== undefined) setCredits(data.remaining);
      }
    } catch (error) {} finally { setEditingMsgId(null); setEditText(''); setLoading(false); }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat permanently?')) return;
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
    if (!confirm('⚠️ Delete ALL chat history?')) return;
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

  const saveChatToFirestore = async (userMsg: Message, aiReply: string, imageUrl?: string, imagePrompt?: string) => {
    if (!user) return;
    let chatId = currentChatId;
    try {
      if (!chatId) {
        const chatRef = await addDoc(collection(db, 'users', user.uid, 'chats'), { title: userMsg.content.substring(0, 50) || 'New Chat', lastMessage: aiReply.substring(0, 100), createdAt: Timestamp.now() });
        chatId = chatRef.id;
        setCurrentChatId(chatId);
      } else {
        await updateDoc(doc(db, 'users', user.uid, 'chats', chatId), { lastMessage: aiReply.substring(0, 100) });
      }
      const messagesRef = collection(db, 'users', user.uid, 'chats', chatId, 'messages');
      await addDoc(messagesRef, { role: 'user', content: userMsg.content, timestamp: Timestamp.now() });
      await addDoc(messagesRef, { role: 'assistant', content: aiReply, imageUrl: imageUrl || null, imagePrompt: imagePrompt || null, timestamp: Timestamp.now() });
    } catch (error) {}
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!user) { alert('Please login to chat!'); return; }
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setImageLoading(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: input.trim(), userId: user.uid, email: user.email, chatId: currentChatId }) });
      const data = await res.json();
      if (data.error === 'limit_reached') {
        const reply = `⚠️ ${data.reply}\n\n💎 Upgrade: Weekly ₹15 | Monthly ₹60 | Yearly ₹499`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
        await saveChatToFirestore(userMsg, reply);
      } else {
        const aiMsg: Message = { role: 'assistant', content: data.reply, timestamp: new Date(), imageUrl: data.imageUrl, imagePrompt: data.imagePrompt };
        setMessages(prev => [...prev, aiMsg]);
        await saveChatToFirestore(userMsg, data.reply, data.imageUrl, data.imagePrompt);
        if (data.remaining !== undefined) setCredits(data.remaining);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error. Try again.', timestamp: new Date() }]);
    } finally { setLoading(false); setImageLoading(false); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0c29', overflow: 'hidden', width: '100%' }}>
      
      {/* LEFT SIDEBAR */}
      {(!isMobile || sidebarOpen) && (
        <div style={{ width: isMobile ? '85%' : 280, maxWidth: isMobile ? '85%' : 320, height: '100vh', background: 'rgba(15,12,41,0.98)', backdropFilter: 'blur(30px)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: isMobile ? 'fixed' : 'relative', zIndex: isMobile ? 50 : 1, left: 0, top: 0 }}>
          {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', width: '30px', height: '30px', borderRadius: '50%', zIndex: 2 }}>✕</button>}
          <div style={{ padding: '16px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: '0 0 12px 0' }}>💬 Chats</h3>
            <button onClick={createNewChat} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(102,126,234,0.2)', border: '1px solid rgba(102,126,234,0.3)', color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', textAlign: 'left', marginBottom: '8px' }}>+ New Chat</button>
            {chatSessions.length > 0 && <button onClick={deleteAllChats} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: 'rgba(245,87,108,0.15)', border: '1px solid rgba(245,87,108,0.25)', color: '#f5576c', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>🗑️ Delete All</button>}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
            {chatSessions.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 16px' }}><p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>No conversations yet</p></div> : chatSessions.map((chat) => (
              <motion.div key={chat.id} whileTap={{ scale: 0.98 }} onClick={() => { loadChat(chat.id); if (isMobile) setSidebarOpen(false); }} style={{ padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px', background: currentChatId === chat.id ? 'rgba(102,126,234,0.15)' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'white', fontSize: '13px', fontWeight: '600', margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title || 'New Chat'}</p>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.lastMessage || 'Empty chat'}</p>
                </div>
                <button onClick={(e) => deleteChat(chat.id, e)} style={{ background: 'none', border: 'none', color: 'rgba(245,87,108,0.6)', fontSize: '14px', cursor: 'pointer', padding: '4px', flexShrink: 0, marginLeft: '8px' }}>🗑️</button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />}

      {/* MAIN CHAT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.1 }}>
          <Canvas camera={{ position: [0, 1, 12], fov: 55 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={0.5} />
              <RobotModel />
            </Suspense>
          </Canvas>
        </div>

        <div style={{ background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: isMobile ? '8px 12px' : '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', minWidth: 0 }}>
            {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>☰</button>}
            <h2 style={{ color: 'white', fontSize: isMobile ? '15px' : '18px', fontWeight: '700', margin: 0 }}>🤖 Pixeloid AI</h2>
          </div>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flexShrink: 0 }}>
              <span style={{ background: 'rgba(102,126,234,0.2)', color: '#667eea', padding: isMobile ? '2px 8px' : '4px 12px', borderRadius: '12px', fontSize: isMobile ? '10px' : '12px', fontWeight: '600' }}>{plan.toUpperCase()}</span>
              <span style={{ color: credits <= 5 ? '#f5576c' : '#4facfe', fontSize: isMobile ? '16px' : '20px', fontWeight: '800' }}>{plan === 'yearly' ? '∞' : credits}</span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 14px' : '20px 60px', display: 'flex', flexDirection: 'column', gap: '10px', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 1 }}>
          {messages.map((msg, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              {editingMsgId === msg.id ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '4px 0' }}>
                  <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') cancelEdit(); }} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.08)', border: '2px solid #667eea', color: 'white', fontSize: '14px', outline: 'none' }} autoFocus />
                  <button onClick={saveEdit} style={{ background: '#667eea', border: 'none', color: 'white', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>✓ Save</button>
                  <button onClick={cancelEdit} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}>✕ Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ maxWidth: isMobile ? '90%' : '70%' }}>
                    {msg.role === 'assistant' && msg.imageUrl && (
                      <div style={{ marginBottom: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={msg.imageUrl} alt={msg.imagePrompt || 'Generated'} style={{ width: '100%', borderRadius: '12px', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', gap: '8px' }}>
                          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🎨 {msg.imagePrompt || 'AI Generated'}</span>
                          <button onClick={() => downloadImage(msg.imageUrl!, msg.imagePrompt || 'pixeloid_image')} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>⬇️ Download</button>
                        </div>
                      </div>
                    )}
                    <div style={{ padding: isMobile ? '10px 14px' : '14px 18px', borderRadius: '18px', color: 'white', fontSize: isMobile ? '13px' : '14.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: msg.role === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.06)', border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none', backdropFilter: 'blur(10px)' }}>{msg.content}</div>
                  </div>
                  {msg.role === 'user' && <button onClick={(e) => { e.stopPropagation(); startEdit(msg); }} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '12px', padding: '4px 8px', borderRadius: '6px', flexShrink: 0 }}>✏️</button>}
                </div>
              )}
            </motion.div>
          ))}
          {(loading || imageLoading) && <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', padding: '8px' }}>● {imageLoading ? 'Generating image...' : 'Thinking...'}</div>}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: isMobile ? '10px 12px' : '14px 60px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, position: 'relative', zIndex: 2, background: 'rgba(15,12,41,0.9)', backdropFilter: 'blur(20px)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '24px', padding: '4px 6px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder={user ? "Message or 'Generate image of...'" : "Login to chat"} disabled={!user} style={{ flex: 1, padding: isMobile ? '12px 8px' : '14px 10px', background: 'transparent', border: 'none', color: 'white', fontSize: isMobile ? '13px' : '15px', outline: 'none', minWidth: 0, opacity: user ? 1 : 0.5 }} />
            <button onClick={sendMessage} disabled={!user || !input.trim() || loading} style={{ background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)', border: 'none', color: 'white', borderRadius: '50%', width: isMobile ? '36px' : '42px', height: isMobile ? '36px' : '42px', cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize: isMobile ? '16px' : '18px', flexShrink: 0, opacity: input.trim() ? 1 : 0.4, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>↑</button>
          </div>
        </div>
      </div>
    </div>
  );
}