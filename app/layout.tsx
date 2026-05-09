'use client';
import "./globals.css";
import Script from "next/script";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { User } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Pixeloid AI" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Pixeloid" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#667eea" />
        <meta name="description" content="AI-Powered Daily Life Assistant by Shaurya Sharma. Chat, generate images, and automate tasks!" />
        <meta name="author" content="Shaurya Sharma" />
        <meta name="keywords" content="AI, chatbot, image generator, daily assistant, Pixeloid, Shaurya Sharma" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Pixeloid AI - Your Daily Life Assistant" />
        <meta property="og:description" content="AI-powered assistant with chat, image generation, and smart tools. Created by Shaurya Sharma." />
        <meta property="og:type" content="website" />
        
        {/* Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#667eea" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        
        <title>Pixeloid AI - Your Daily Life Assistant</title>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) { console.log('SW registered'); },
                    function(err) { console.log('SW failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, overflowX: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f0c29' }}>
        {/* NAVBAR */}
        <nav style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          boxShadow: '0 4px 20px rgba(102,126,234,0.3)',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          width: '100%',
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '10px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <a href="/" style={{
              fontSize: '22px',
              fontWeight: '800',
              color: 'white',
              textDecoration: 'none',
              letterSpacing: '-0.5px',
            }}>
              🚀 Pixeloid
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: isMobile ? 'block' : 'none',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '20px',
                cursor: 'pointer',
                lineHeight: '1',
              }}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>

            <div style={{
              display: isMobile ? 'none' : 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
            }}>
              <NavLinks user={user} loading={loading} handleLogout={handleLogout} />
            </div>
          </div>

          {isMobile && mobileMenuOpen && (
            <div style={{
              background: 'rgba(102,126,234,0.95)',
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}>
              <NavLinks user={user} loading={loading} handleLogout={handleLogout} closeMenu={closeMenu} isMobile />
            </div>
          )}
        </nav>

        {/* MAIN CONTENT */}
        <main style={{ flex: 1, width: '100%', overflowX: 'hidden' }}>
          {children}
        </main>

        {/* FOOTER */}
        <Footer onNameClick={() => setShowPortfolio(true)} />

        {/* PORTFOLIO MODAL */}
        <AnimatePresence>
          {showPortfolio && (
            <PortfolioModal onClose={() => setShowPortfolio(false)} />
          )}
        </AnimatePresence>
      </body>
    </html>
  );
}

// NavLinks Component
function NavLinks({ user, loading, handleLogout, closeMenu, isMobile }: {
  user: User | null;
  loading: boolean;
  handleLogout: () => void;
  closeMenu?: () => void;
  isMobile?: boolean;
}) {
  const linkStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.9)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    padding: isMobile ? '10px 0' : '6px 12px',
    borderRadius: '8px',
    display: 'block',
    borderBottom: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
  };

  const btnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #f093fb, #f5576c)',
    color: 'white',
    padding: isMobile ? '10px 16px' : '8px 20px',
    borderRadius: '20px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    display: isMobile ? 'block' : 'inline-block',
    textAlign: 'center',
  };

  const outlineBtnStyle: React.CSSProperties = {
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.5)',
    padding: isMobile ? '10px 16px' : '8px 20px',
    borderRadius: '20px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: isMobile ? 'block' : 'inline-block',
    textAlign: 'center',
  };

  return (
    <>
      <a href="/" style={linkStyle} onClick={closeMenu}>🏠 Home</a>
      <a href="/dashboard" style={linkStyle} onClick={closeMenu}>📊 Dashboard</a>
      <a href="/pricing" style={linkStyle} onClick={closeMenu}>💎 Pricing</a>
      <a href="/chat" style={linkStyle} onClick={closeMenu}>🤖 AI Chat</a>
      
      {!loading && (
        user ? (
          <>
            <span style={{
              color: 'white',
              fontSize: '13px',
              background: 'rgba(255,255,255,0.2)',
              padding: '5px 14px',
              borderRadius: '20px',
              display: isMobile ? 'block' : 'inline-block',
              textAlign: 'center',
              margin: isMobile ? '8px 0' : '0',
            }}>
              👤 {user.displayName || user.email?.split('@')[0]}
            </span>
            <button onClick={() => { handleLogout(); closeMenu?.(); }} style={outlineBtnStyle}>
              🚪 Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={outlineBtnStyle} onClick={closeMenu}>🔑 Login</a>
            <a href="/signup" style={btnStyle} onClick={closeMenu}>✨ Sign Up</a>
          </>
        )
      )}
    </>
  );
}

// Footer Component
function Footer({ onNameClick }: { onNameClick: () => void }) {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f0c29, #1a1040)',
      borderTop: '2px solid rgba(102,126,234,0.3)',
      padding: 'clamp(16px, 2vw, 24px) clamp(12px, 2vw, 16px)',
      width: '100%',
      flexShrink: 0,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 'clamp(11px, 1.5vw, 13px)',
          margin: '0 0 6px 0',
          fontWeight: '500',
        }}>
          © {new Date().getFullYear()} <span style={{ color: '#f093fb', fontWeight: '700' }}>Pixeloid</span>. All rights reserved.
        </p>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: 'clamp(10px, 1.3vw, 12px)',
          margin: 0,
        }}>
          Designed & Developed by{' '}
          <span onClick={onNameClick} style={{
            color: '#667eea', fontWeight: '700', textDecoration: 'underline',
            cursor: 'pointer', transition: 'color 0.3s',
          }}>
            Shaurya Sharma
          </span>
        </p>
      </div>
    </footer>
  );
}

// Portfolio Modal Component
function PortfolioModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #1a1040, #0f0c29)',
          border: '1px solid rgba(102,126,234,0.4)', borderRadius: '24px',
          padding: 'clamp(24px, 4vw, 40px)', maxWidth: '400px', width: '100%',
          textAlign: 'center', boxShadow: '0 20px 60px rgba(102,126,234,0.3)', position: 'relative',
        }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '12px', right: '16px',
          background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
          fontSize: '20px', cursor: 'pointer', width: '32px', height: '32px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        <div style={{
          width: '120px', height: '154px', borderRadius: '16px', overflow: 'hidden',
          margin: '0 auto 16px', border: '3px solid rgba(102,126,234,0.5)',
          boxShadow: '0 8px 24px rgba(102,126,234,0.3)',
        }}>
          <img src="/shaurya.jpg" alt="Shaurya Sharma" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h2 style={{ color: 'white', fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: '800', margin: '0 0 4px 0' }}>Shaurya Sharma</h2>
        <p style={{ color: '#667eea', fontSize: '14px', fontWeight: '600', margin: '0 0 20px 0' }}>Full Stack Developer</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          {['UI / UX', 'Frontend Development', 'HTML', 'CSS', 'JavaScript', 'PHP', 'Java'].map((skill, i) => (
            <span key={i} style={{
              background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.25)',
              color: '#667eea', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
            }}>{skill}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a href="https://www.linkedin.com/in/shaurya-sharma200" target="_blank" rel="noopener noreferrer" style={{
            background: 'linear-gradient(135deg, #0077B5, #00A0DC)', color: 'white',
            padding: '10px 20px', borderRadius: '12px', textDecoration: 'none',
            fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
          }}>🔗 LinkedIn</a>
          <a href="https://github.com/mrshauryasharma" target="_blank" rel="noopener noreferrer" style={{
            background: 'linear-gradient(135deg, #333, #555)', color: 'white',
            padding: '10px 20px', borderRadius: '12px', textDecoration: 'none',
            fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px',
          }}>💻 GitHub</a>
        </div>
      </motion.div>
    </motion.div>
  );
}