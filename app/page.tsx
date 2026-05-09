'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RobotModel, OrbitingParticles, Particles3D } from '@/components/3d/RobotModel';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', position: 'relative', overflow: 'hidden' }}>
      {/* 3D Robot Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 1, 10], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={0.8} />
            <pointLight position={[-5, -3, -5]} intensity={0.4} color="#f093fb" />
            <RobotModel />
            <OrbitingParticles />
            <Particles3D />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)' }}>
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, type: "spring" }} style={{ textAlign: 'center' }}>
          <motion.h1 style={{ fontSize: 'clamp(36px, 10vw, 80px)', fontWeight: '900', background: 'linear-gradient(to right, #f093fb, #667eea, #f5576c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '16px', letterSpacing: '-2px', lineHeight: '1.1' }} animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            Welcome to Pixeloid
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ fontSize: 'clamp(16px, 3vw, 26px)', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', fontWeight: '300' }}>
            Your AI-Powered Daily Life Assistant
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ fontSize: 'clamp(14px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.6)', marginBottom: 'clamp(30px, 5vw, 48px)', fontWeight: '300' }}>
            Chat • Create • Automate — All with Simple AI Tools
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: 'clamp(10px, 2vw, 20px)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={user ? '/chat' : '/signup'} style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: 'clamp(14px, 2vw, 18px) clamp(28px, 5vw, 48px)', borderRadius: '50px', textDecoration: 'none', fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: '700', boxShadow: '0 8px 32px rgba(102,126,234,0.4)', border: '2px solid rgba(255,255,255,0.2)' }}>
              {user ? '🤖 Start Chatting' : '🚀 Get Started Free'}
            </Link>
            <Link href={user ? '/chat' : '/pricing'} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', color: 'white', padding: 'clamp(14px, 2vw, 18px) clamp(28px, 5vw, 48px)', borderRadius: '50px', textDecoration: 'none', fontSize: 'clamp(15px, 2vw, 20px)', fontWeight: '600', border: '2px solid rgba(255,255,255,0.3)' }}>
              {user ? '💬 Go to Chat' : '💎 View Plans'}
            </Link>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'clamp(16px, 3vw, 32px)', marginTop: 'clamp(50px, 8vw, 100px)' }}>
          {[{ icon: '🤖', title: 'AI Chat', desc: '24/7 intelligent conversations' }, { icon: '⚡', title: 'Fast & Easy', desc: 'Lightning quick responses' }, { icon: '🔒', title: '100% Secure', desc: 'Your data is protected' }].map((feature, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 + index * 0.2 }} whileHover={{ scale: 1.03 }} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'clamp(16px, 3vw, 24px)', padding: 'clamp(24px, 4vw, 40px)', textAlign: 'center', transition: 'all 0.4s', cursor: 'default' }}>
              <div style={{ fontSize: 'clamp(40px, 8vw, 60px)', marginBottom: '16px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{feature.title}</h3>
              <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}