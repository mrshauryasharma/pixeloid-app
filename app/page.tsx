'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number; y: number; size: number; speedX: number; speedY: number;
      color: string; opacity: number;
    }> = [];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#f5576c'][Math.floor(Math.random() * 5)],
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    const lines: Array<{ from: number; to: number }> = [];
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        lines.push({ from: i, to: j });
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      
      particles.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > canvas!.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.speedY *= -1;
        
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = p.opacity;
        ctx!.fill();
        
        lines.forEach(line => {
          if (line.from === i || line.to === i) {
            const other = line.from === i ? particles[line.to] : particles[line.from];
            const dist = Math.hypot(p.x - other.x, p.y - other.y);
            if (dist < 120) {
              ctx!.beginPath();
              ctx!.moveTo(p.x, p.y);
              ctx!.lineTo(other.x, other.y);
              ctx!.strokeStyle = p.color;
              ctx!.globalAlpha = 0.06;
              ctx!.lineWidth = 0.5;
              ctx!.stroke();
            }
          }
        });
      });
      
      ctx!.globalAlpha = 1;
      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}

export default function Home() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <ParticleBackground />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 24px)',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, type: "spring" }}
            style={{ textAlign: 'center' }}
          >
            <motion.h1
              style={{
                fontSize: 'clamp(36px, 10vw, 80px)',
                fontWeight: '900',
                background: 'linear-gradient(to right, #f093fb, #667eea, #f5576c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
                letterSpacing: '-2px',
                lineHeight: '1.1',
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Welcome to Pixeloid
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                fontSize: 'clamp(16px, 3vw, 26px)',
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '8px',
                fontWeight: '300',
              }}
            >
              Your AI-Powered Daily Life Assistant
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{
                fontSize: 'clamp(14px, 2.5vw, 20px)',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: 'clamp(30px, 5vw, 48px)',
                fontWeight: '300',
              }}
            >
              Chat • Create • Automate — All with Simple AI Tools
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                display: 'flex',
                gap: 'clamp(10px, 2vw, 20px)',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link href="/signup" style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: 'clamp(14px, 2vw, 18px) clamp(28px, 5vw, 48px)',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: 'clamp(15px, 2vw, 20px)',
                fontWeight: '700',
                boxShadow: '0 8px 32px rgba(102,126,234,0.4)',
                transition: 'all 0.3s',
                border: '2px solid rgba(255,255,255,0.2)',
              }}>
                🚀 Get Started Free
              </Link>
              <Link href="/pricing" style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                padding: 'clamp(14px, 2vw, 18px) clamp(28px, 5vw, 48px)',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: 'clamp(15px, 2vw, 20px)',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s',
              }}>
                💎 View Plans
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Cards */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'clamp(16px, 3vw, 32px)',
              marginTop: 'clamp(50px, 8vw, 100px)',
            }}
          >
            {[
              { icon: '🤖', title: 'AI Chat', desc: '24/7 intelligent conversations' },
              { icon: '⚡', title: 'Fast & Easy', desc: 'Lightning quick responses' },
              { icon: '🔒', title: '100% Secure', desc: 'Your data is protected' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.2 }}
                whileHover={{ scale: 1.03 }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 'clamp(16px, 3vw, 24px)',
                  padding: 'clamp(24px, 4vw, 40px)',
                  textAlign: 'center',
                  transition: 'all 0.4s',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: 'clamp(40px, 8vw, 60px)', marginBottom: '16px' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: 'clamp(20px, 3vw, 28px)',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '8px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: 'clamp(13px, 2vw, 16px)',
                  color: 'rgba(255,255,255,0.6)',
                  lineHeight: '1.6',
                }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}