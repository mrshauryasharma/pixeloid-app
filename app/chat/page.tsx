'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, doc, updateDoc } from 'firebase/firestore';

type Message = {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
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
  const [image, setImage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatLoadedRef = useRef(false);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auth state
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

  // Fetch credits
  const fetchUserCredits = async (uid: string) => {
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      });
      const data = await res.json();
      setCredits(data.credits || 20);
      setPlan(data.plan || 'free');
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  // Load chat sessions from Firestore
  const loadChatSessions = (uid: string) => {
    const chatsRef = collection(db, 'users', uid, 'chats');
    const q = query(chatsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const sessions: ChatSession[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        sessions.push({
          id: document.id,
          title: data.title || 'New Chat',
          lastMessage: data.lastMessage || '',
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      });
      setChatSessions(sessions);
    }, (error) => {
      console.error('Error loading sessions:', error);
    });
  };

  // Create new chat
  const createNewChat = () => {
    setCurrentChatId('');
    setMessages([{ 
      role: 'assistant', 
      content: `Hello ${user?.displayName || user?.email?.split('@')[0] || 'User'}! How can I help you today? ✨`, 
      timestamp: new Date() 
    }]);
    if (isMobile) setSidebarOpen(false);
  };

  // Load specific chat
  const loadChat = (chatId: string) => {
    setCurrentChatId(chatId);
    const messagesRef = collection(db, 'users', user!.uid, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        msgs.push({
          id: document.id,
          role: data.role,
          content: data.content,
          image: data.image || undefined,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      });
      
      if (msgs.length === 0) {
        setMessages([{ role: 'assistant', content: 'Start chatting! ✨', timestamp: new Date() }]);
      } else {
        setMessages(msgs);
      }
    }, (error) => {
      console.error('Error loading messages:', error);
      setMessages([{ role: 'assistant', content: 'Error loading chat. Please try again.', timestamp: new Date() }]);
    });
  };

  // Save chat to Firestore
  const saveChatToFirestore = async (userMsg: Message, aiReply: string) => {
    if (!user) return;

    let chatId = currentChatId;

    try {
      if (!chatId) {
        // Create new chat document
        const chatRef = await addDoc(collection(db, 'users', user.uid, 'chats'), {
          title: userMsg.content.substring(0, 50) || 'New Chat',
          lastMessage: aiReply.substring(0, 100),
          createdAt: Timestamp.now(),
        });
        chatId = chatRef.id;
        setCurrentChatId(chatId);
      } else {
        // Update existing chat
        const chatRef = doc(db, 'users', user.uid, 'chats', chatId);
        await updateDoc(chatRef, {
          lastMessage: aiReply.substring(0, 100),
        });
      }

      // Save user message
      const messagesRef = collection(db, 'users', user.uid, 'chats', chatId, 'messages');
      await addDoc(messagesRef, {
        role: 'user',
        content: userMsg.content,
        image: userMsg.image || null,
        timestamp: Timestamp.now(),
      });

      // Save AI response
      await addDoc(messagesRef, {
        role: 'assistant',
        content: aiReply,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => setImage(event.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Send message
  const sendMessage = async () => {
    if (!input.trim() && !image) return;
    if (!user) {
      alert('Please login to chat!');
      return;
    }

    const msgText = input.trim() || '🖼️ Image';
    const userMsg: Message = { role: 'user', content: msgText, image: image || undefined, timestamp: new Date() };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, userId: user.uid }),
      });
      
      const data = await res.json();

      if (data.error === 'limit_reached') {
        const reply = `⚠️ ${data.reply}\n\n💎 Upgrade your plan:\n• Weekly ₹15 — 100 chats\n• Monthly ₹60 — 200 chats\n• Yearly ₹499 — Unlimited`;
        setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
        await saveChatToFirestore(userMsg, reply);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
        await saveChatToFirestore(userMsg, data.reply);
        if (data.remaining !== undefined) {
          setCredits(data.remaining);
        }
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Something went wrong. Please try again.', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0f0c29', overflow: 'hidden', width: '100%' }}>
      
      {/* ---- SIDEBAR ---- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay for mobile */}
            {isMobile && (
              <div
                onClick={() => setSidebarOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0,0,0,0.6)',
                  zIndex: 40,
                }}
              />
            )}
            
            <motion.div
              initial={{ x: isMobile ? -300 : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: isMobile ? 'fixed' : 'relative',
                left: 0,
                top: 0,
                width: isMobile ? '85%' : 280,
                maxWidth: 320,
                height: '100vh',
                background: 'rgba(15,12,41,0.98)',
                backdropFilter: 'blur(30px)',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                zIndex: 50,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Sidebar Header */}
              <div style={{ padding: '16px', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>💬 Chats</h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                      fontSize: '18px', cursor: 'pointer', padding: '4px',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <button
                  onClick={createNewChat}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'rgba(102,126,234,0.2)',
                    border: '1px solid rgba(102,126,234,0.3)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102,126,234,0.2)'}
                >
                  + New Chat
                </button>
              </div>

              {/* Chat List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
                {chatSessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 8px 0' }}>
                      📭 No conversations yet
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px', margin: 0 }}>
                      Start a new chat to begin!
                    </p>
                  </div>
                ) : (
                  chatSessions.map((chat) => (
                    <motion.div
                      key={chat.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { loadChat(chat.id); if (isMobile) setSidebarOpen(false); }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        background: currentChatId === chat.id ? 'rgba(102,126,234,0.15)' : 'transparent',
                        border: currentChatId === chat.id ? '1px solid rgba(102,126,234,0.2)' : '1px solid transparent',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (currentChatId !== chat.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      }}
                      onMouseLeave={(e) => {
                        if (currentChatId !== chat.id) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <p style={{
                        color: 'white', fontSize: '13px', fontWeight: '600',
                        margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {chat.title || 'New Chat'}
                      </p>
                      <p style={{
                        color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {chat.lastMessage || 'Empty chat'}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Sidebar Footer */}
              <div style={{
                padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'center',
              }}>
                <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px', margin: 0 }}>
                  Pixeloid AI v1.0
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---- MAIN CHAT AREA ---- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', minWidth: 0, width: '100%' }}>
        
        {/* Top Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: isMobile ? '8px 12px' : '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px', minWidth: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none', border: 'none', color: 'white',
                fontSize: isMobile ? '18px' : '20px', cursor: 'pointer', padding: '4px',
                flexShrink: 0,
              }}
            >
              ☰
            </button>
            <h2 style={{
              color: 'white', fontSize: isMobile ? '15px' : '18px', fontWeight: '700',
              margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              🤖 Pixeloid AI
            </h2>
          </div>

          {user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px',
              flexShrink: 0,
            }}>
              <span style={{
                background: 'rgba(102,126,234,0.2)',
                color: '#667eea',
                padding: isMobile ? '2px 8px' : '4px 12px',
                borderRadius: '12px',
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: '600',
              }}>
                {plan.toUpperCase()}
              </span>
              <span style={{
                color: credits <= 5 ? '#f5576c' : '#4facfe',
                fontSize: isMobile ? '16px' : '20px',
                fontWeight: '800',
              }}>
                {plan === 'yearly' ? '∞' : credits}
              </span>
              {!isMobile && (
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>credits</span>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: isMobile ? '12px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {messages.length === 0 && (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              textAlign: 'center',
              padding: '20px',
            }}>
              <div style={{ fontSize: isMobile ? '50px' : '70px' }}>🤖</div>
              <h1 style={{ color: 'white', fontSize: isMobile ? '22px' : '28px', fontWeight: '700', margin: 0 }}>
                Pixeloid AI
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? '13px' : '15px', margin: 0, maxWidth: '300px' }}>
                Your AI-powered assistant for daily life
              </p>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div style={{
                  maxWidth: isMobile ? '88%' : '72%',
                  padding: isMobile ? '10px 14px' : '14px 18px',
                  borderRadius: '18px',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #667eea, #764ba2)'
                    : 'rgba(255,255,255,0.06)',
                  border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  color: 'white',
                  fontSize: isMobile ? '13px' : '14.5px',
                  lineHeight: '1.65',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="uploaded"
                      style={{
                        maxWidth: isMobile ? '160px' : '240px',
                        maxHeight: isMobile ? '160px' : '240px',
                        borderRadius: '12px',
                        marginBottom: '8px',
                        display: 'block',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.4)',
                animation: 'bounce 0.6s infinite',
              }} />
              AI is thinking...
              <style>{`@keyframes bounce { 0%,100% { opacity:0.2; } 50% { opacity:1; } }`}</style>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Image Preview */}
        {image && (
          <div style={{ padding: isMobile ? '0 12px 6px' : '0 20px 8px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={image}
                alt="preview"
                style={{
                  maxHeight: isMobile ? '60px' : '80px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              />
              <button
                onClick={() => setImage(null)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#f5576c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: isMobile ? '18px' : '22px',
                  height: isMobile ? '18px' : '22px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '10px' : '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div style={{
          padding: isMobile ? '8px 10px' : '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '20px',
            padding: isMobile ? '3px 4px' : '4px 6px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={!user}
              title="Upload image"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: isMobile ? '16px' : '18px',
                cursor: user ? 'pointer' : 'not-allowed',
                padding: isMobile ? '6px' : '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: user ? 1 : 0.3,
              }}
            >
              🖼️
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {/* Microphone Button (UI only) */}
            <button
              disabled={!user}
              title="Voice input (coming soon)"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: isMobile ? '16px' : '18px',
                cursor: user ? 'pointer' : 'not-allowed',
                padding: isMobile ? '6px' : '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: user ? 0.6 : 0.3,
              }}
            >
              🎤
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={user ? "Message Pixeloid AI..." : "Login to chat..."}
              disabled={!user}
              style={{
                flex: 1,
                padding: isMobile ? '10px 6px' : '12px 6px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: isMobile ? '13px' : '14.5px',
                outline: 'none',
                minWidth: 0,
                opacity: user ? 1 : 0.4,
              }}
            />

            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={!user || (!input.trim() && !image) || loading}
              style={{
                background: (input.trim() || image)
                  ? 'linear-gradient(135deg, #667eea, #764ba2)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'white',
                width: isMobile ? '32px' : '38px',
                height: isMobile ? '32px' : '38px',
                borderRadius: '50%',
                fontSize: isMobile ? '14px' : '16px',
                cursor: (input.trim() || image) ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: (input.trim() || image) ? 1 : 0.4,
                transition: 'all 0.2s',
                boxShadow: (input.trim() || image) ? '0 4px 12px rgba(102,126,234,0.3)' : 'none',
              }}
            >
              ↑
            </button>
          </div>
          
          {/* Disclaimer */}
          <p style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '10px',
            textAlign: 'center',
            marginTop: '6px',
            userSelect: 'none',
          }}>
            Pixeloid AI can make mistakes. Verify important info.
          </p>
        </div>
      </div>
    </div>
  );
}