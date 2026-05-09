'use client';
import "./globals.css";
import Script from "next/script";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { User } from "firebase/auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

        {/* FOOTER - Har Page Pe Dikhega */}
        <Footer />
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

// Footer Component - Har Page Pe Dikhega
function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f0c29, #1a1040)',
      borderTop: '2px solid rgba(102,126,234,0.3)',
      padding: 'clamp(16px, 2vw, 24px) clamp(12px, 2vw, 16px)',
      width: '100%',
      flexShrink: 0,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
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
          <a href="https://github.com/mrshauryasharma" target="_blank" rel="noopener noreferrer" style={{
            color: '#667eea',
            fontWeight: '700',
            textDecoration: 'none',
          }}>
            Shaurya Sharma
          </a>
        </p>
      </div>
    </footer>
  );
}