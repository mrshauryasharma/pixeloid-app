'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setError(data.error || 'Failed to send. Please try again.');
      }
    } catch (err) {
      setError('Failed to send. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: 'clamp(20px, 5vw, 60px) clamp(16px, 4vw, 24px)',
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(30px, 5vw, 50px)' }}
        >
          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 48px)',
            fontWeight: '900',
            background: 'linear-gradient(to right, #f093fb, #667eea, #f5576c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}>
            📬 Contact Us
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(14px, 2vw, 18px)',
            fontWeight: '300',
          }}>
            Have questions? We'd love to hear from you!
          </p>
        </motion.div>

        {/* Contact Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: 'clamp(30px, 4vw, 40px)',
        }}>
          <motion.a
            href="mailto:contact.pixeloidpro@gmail.com"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -4 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s',
            }}
          >
            <span style={{ fontSize: '40px' }}>📧</span>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>Email Us</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0, wordBreak: 'break-all' }}>
              contact.pixeloidpro@gmail.com
            </p>
          </motion.a>

          <motion.a
            href="https://t.me/pixeloidpro_support_bot"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -4 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s',
            }}
          >
            <span style={{ fontSize: '40px' }}>💬</span>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '700', margin: 0 }}>Telegram Bot</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
              @pixeloidpro_support_bot
            </p>
          </motion.a>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: 'clamp(24px, 4vw, 40px)',
          }}
        >
          <h2 style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            ✉️ Send a Message
          </h2>

          {sent ? (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              style={{ textAlign: 'center', padding: '40px 20px' }}
            >
              <div style={{ fontSize: '60px', marginBottom: '16px' }}>✅</div>
              <h3 style={{ color: 'white', fontSize: '22px', marginBottom: '8px' }}>Message Sent!</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                We'll get back to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  background: 'rgba(245,87,108,0.2)',
                  border: '1px solid rgba(245,87,108,0.3)',
                  color: '#f5576c',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  textAlign: 'center',
                }}>
                  {error}
                </div>
              )}
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={inputStyle}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
              <textarea
                placeholder="Your Message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
                  transition: 'all 0.3s',
                }}
              >
                {loading ? 'Sending...' : 'Send Message 🚀'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: 'white',
  fontSize: '15px',
  outline: 'none',
  marginBottom: '14px',
  boxSizing: 'border-box',
};