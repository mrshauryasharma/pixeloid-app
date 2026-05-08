'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [totalChats, setTotalChats] = useState(0);
  const [userPlan, setUserPlan] = useState('free');
  const [userCredits, setUserCredits] = useState(20);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchCredits(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCredits = async (uid: string) => {
    try {
      const res = await fetch('/api/credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid }),
      });
      const data = await res.json();
      setUserCredits(data.credits || 20);
      setUserPlan(data.plan || 'free');
      setTotalChats(data.totalChats || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const planLimits: Record<string, { chats: string; color: string }> = {
    free: { chats: '20/day', color: '#667eea' },
    weekly: { chats: '100/week', color: '#4facfe' },
    monthly: { chats: '200/month', color: '#f093fb' },
    yearly: { chats: 'Unlimited', color: '#f5576c' },
  };

  const currentPlan = planLimits[userPlan] || planLimits.free;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: 'clamp(20px, 4vw, 40px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'clamp(16px, 3vw, 28px)',
            padding: 'clamp(20px, 4vw, 40px)',
            marginBottom: 'clamp(20px, 3vw, 40px)',
            boxShadow: '0 12px 40px rgba(102,126,234,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ flex: '1 1 300px' }}>
            <h1 style={{
              fontSize: 'clamp(24px, 5vw, 42px)',
              fontWeight: '900',
              background: 'linear-gradient(to right, #f093fb, #667eea, #4facfe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0 0 8px 0',
              letterSpacing: '-1px',
            }}>
              Welcome Back, {user?.displayName || user?.email?.split('@')[0] || 'User'}! 👋
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'clamp(14px, 2vw, 18px)',
              margin: 0,
              fontWeight: '300',
            }}>
              Here's your Pixeloid dashboard overview
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: 'clamp(12px, 2vw, 16px) clamp(16px, 3vw, 28px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{
              width: 'clamp(36px, 5vw, 48px)',
              height: 'clamp(36px, 5vw, 48px)',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(18px, 3vw, 24px)',
              flexShrink: 0,
            }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" style={{
                  width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                }} />
              ) : '👤'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                color: 'white', fontWeight: '700', margin: 0,
                fontSize: 'clamp(13px, 2vw, 16px)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p style={{
                color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0',
                fontSize: 'clamp(11px, 1.5vw, 13px)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user?.email || ''}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'clamp(12px, 2vw, 24px)',
          marginBottom: 'clamp(20px, 3vw, 40px)',
        }}>
          {[
            {
              icon: '💬',
              title: 'Total Chats',
              value: totalChats,
              color: '#667eea',
              gradient: 'linear-gradient(135deg, rgba(102,126,234,0.2), rgba(102,126,234,0.05))',
            },
            {
              icon: '⭐',
              title: 'Current Plan',
              value: userPlan.charAt(0).toUpperCase() + userPlan.slice(1),
              subtitle: currentPlan.chats,
              color: '#f093fb',
              gradient: 'linear-gradient(135deg, rgba(240,147,251,0.2), rgba(240,147,251,0.05))',
            },
            {
              icon: '🎯',
              title: 'Credits Left',
              value: userPlan === 'yearly' ? '∞' : userCredits,
              subtitle: userPlan === 'yearly' ? 'Unlimited' : 'Resets daily',
              color: userCredits <= 5 ? '#f5576c' : '#4facfe',
              gradient: userCredits <= 5 
                ? 'linear-gradient(135deg, rgba(245,87,108,0.2), rgba(245,87,108,0.05))'
                : 'linear-gradient(135deg, rgba(79,172,254,0.2), rgba(79,172,254,0.05))',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ 
                y: -6,
                boxShadow: `0 16px 48px ${stat.color}15`,
              }}
              style={{
                background: stat.gradient,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${stat.color}20`,
                borderRadius: 'clamp(16px, 3vw, 24px)',
                padding: 'clamp(20px, 3vw, 32px)',
                transition: 'all 0.3s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: 'clamp(60px, 10vw, 100px)',
                opacity: 0.05,
                color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: 'clamp(30px, 5vw, 40px)', marginBottom: '12px' }}>{stat.icon}</div>
              <h3 style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 'clamp(11px, 1.5vw, 13px)',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '8px',
                fontWeight: '600',
              }}>
                {stat.title}
              </h3>
              <p style={{
                color: stat.color,
                fontSize: 'clamp(28px, 5vw, 42px)',
                fontWeight: '900',
                margin: '0 0 4px 0',
                lineHeight: '1',
              }}>
                {stat.value}
              </p>
              {stat.subtitle && (
                <p style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 'clamp(11px, 1.5vw, 13px)',
                  margin: 0,
                }}>
                  {stat.subtitle}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Quick Actions + Upgrade */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'clamp(16px, 2vw, 24px)',
        }}>
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'clamp(16px, 3vw, 24px)',
              padding: 'clamp(20px, 3vw, 36px)',
            }}
          >
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: '700',
              color: 'white',
              marginBottom: 'clamp(16px, 2vw, 28px)',
            }}>
              ⚡ Quick Actions
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'clamp(10px, 1.5vw, 16px)',
            }}>
              {[
                { icon: '🤖', label: 'AI Chat', href: '/chat', color: '#667eea' },
                { icon: '💎', label: 'Upgrade', href: '/pricing', color: '#f093fb' },
                { icon: '📊', label: 'Analytics', href: '#', color: '#4facfe', disabled: true },
                { icon: '⚙️', label: 'Settings', href: '#', color: '#f5576c', disabled: true },
              ].map((action, i) => (
                <motion.a
                  key={i}
                  href={action.disabled ? '#' : action.href}
                  whileHover={action.disabled ? {} : { scale: 1.03 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${action.color}30`,
                    borderRadius: 'clamp(12px, 2vw, 16px)',
                    padding: 'clamp(16px, 2vw, 24px)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: action.disabled ? 'default' : 'pointer',
                    opacity: action.disabled ? 0.4 : 1,
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: 'clamp(24px, 4vw, 32px)', flexShrink: 0 }}>{action.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      color: 'white', fontWeight: '600',
                      fontSize: 'clamp(13px, 2vw, 16px)',
                      margin: '0 0 4px 0',
                    }}>
                      {action.label}
                    </p>
                    <p style={{
                      color: 'rgba(255,255,255,0.4)',
                      fontSize: 'clamp(10px, 1.5vw, 12px)',
                      margin: 0,
                    }}>
                      {action.disabled ? 'Coming soon' : 'Click to open'}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Upgrade Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{
              background: 'linear-gradient(135deg, rgba(240,147,251,0.15), rgba(102,126,234,0.15))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(240,147,251,0.3)',
              borderRadius: 'clamp(16px, 3vw, 24px)',
              padding: 'clamp(20px, 3vw, 36px)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 'clamp(40px, 8vw, 60px)', marginBottom: '16px' }}>👑</div>
            <h3 style={{
              color: 'white',
              fontSize: 'clamp(20px, 3vw, 24px)',
              fontWeight: '700',
              marginBottom: '8px',
            }}>
              Go Premium
            </h3>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 'clamp(12px, 1.8vw, 14px)',
              marginBottom: 'clamp(16px, 2vw, 24px)',
              lineHeight: '1.6',
              padding: '0 8px',
            }}>
              Unlock unlimited AI chats, priority support, and more!
            </p>
            
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: 'clamp(14px, 2vw, 20px)',
              marginBottom: 'clamp(16px, 2vw, 24px)',
              width: '100%',
              boxSizing: 'border-box',
            }}>
              {[
                { plan: 'Weekly', price: '₹15', chats: '100 chats' },
                { plan: 'Monthly', price: '₹60', chats: '200 chats' },
                { plan: 'Yearly', price: '₹499', chats: 'Unlimited' },
              ].map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'clamp(8px, 1.5vw, 10px) 0',
                  borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  fontSize: 'clamp(12px, 1.8vw, 13px)',
                  flexWrap: 'wrap',
                  gap: '4px',
                }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{p.plan}</span>
                  <span style={{ color: 'white', fontWeight: '600' }}>{p.price}</span>
                </div>
              ))}
            </div>

            <motion.a
              href="/pricing"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: 'linear-gradient(135deg, #667eea, #f093fb)',
                color: 'white',
                padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
                borderRadius: '16px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: 'clamp(14px, 2vw, 16px)',
                width: '100%',
                boxSizing: 'border-box',
                boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
                display: 'inline-block',
              }}
            >
              Upgrade Now 🚀
            </motion.a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}