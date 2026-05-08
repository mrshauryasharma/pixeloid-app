'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, duration: 0.8 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '32px',
          padding: '48px',
          width: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: 'center', marginBottom: '36px' }}
        >
          <div style={{ fontSize: '60px', marginBottom: '16px' }}>🚀</div>
          <h2 style={{
            fontSize: '36px',
            fontWeight: '900',
            background: 'linear-gradient(to right, #f093fb, #667eea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 8px 0',
          }}>
            Welcome Back
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
            Sign in to continue to Pixeloid
          </p>
        </motion.div>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(245,87,108,0.2)',
              border: '1px solid rgba(245,87,108,0.3)',
              color: '#f5576c',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '13px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {error}
          </motion.div>
        )}
        
        <motion.button
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(102,126,234,0.3)' }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '16px',
            borderRadius: '16px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '24px',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>G</span>
          Continue with Google
        </motion.button>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>
        
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '15px',
              outline: 'none',
              marginBottom: '12px',
              boxSizing: 'border-box',
              transition: 'all 0.3s',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '15px',
              outline: 'none',
              marginBottom: '20px',
              boxSizing: 'border-box',
              transition: 'all 0.3s',
            }}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(102,126,234,0.4)' }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              padding: '16px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
              transition: 'all 0.3s',
            }}
          >
            Sign In
          </motion.button>
        </form>
        
        <p style={{
          textAlign: 'center',
          marginTop: '20px',
          color: 'rgba(255,255,255,0.5)',
          fontSize: '14px',
        }}>
          Don't have an account?{' '}
          <a href="/signup" style={{
            color: '#667eea',
            fontWeight: '600',
            textDecoration: 'none',
          }}>
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}