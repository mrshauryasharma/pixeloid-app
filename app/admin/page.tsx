'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        router.push('/login?redirect=admin');
        setChecking(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: currentUser.email }),
        });
        const data = await res.json();
        
        if (!data.isAdmin) {
          alert('⛔ Access Denied! You are not an admin.');
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(true);
        fetchAllUsers();
      } catch (error) {
        router.push('/dashboard');
      }
      
      setChecking(false);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    const creditsMap: Record<string, number> = {
      free: 20,
      weekly: 100,
      monthly: 200,
      yearly: 999999,
    };
    
    // Immediately update UI
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, plan: newPlan, credits: creditsMap[newPlan] } : u
    ));
    
    // Save to backend
    await fetch('/api/admin/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan: newPlan }),
    });
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('⚠️ Are you sure you want to PERMANENTLY delete this user?')) return;
    
    // Remove from UI immediately
    setUsers(prev => prev.filter(u => u.id !== userId));
    
    await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  };

  if (checking || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '50px', marginBottom: '20px' }}>🔐</div>
          <h1 style={{ color: 'white', fontSize: '24px' }}>Verifying admin access...</h1>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', padding: 'clamp(12px, 2vw, 20px)' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: 'clamp(14px, 2vw, 20px)',
          }}
        >
          <div>
            <h1 style={{ 
              color: 'white', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '900', margin: 0,
              background: 'linear-gradient(to right, #f5576c, #f093fb)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              🔐 Admin Panel
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', margin: '2px 0 0 0', fontSize: '13px' }}>
              Logged in as: {user?.email}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(245,87,108,0.2)', color: '#f5576c', padding: '5px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: '700', border: '1px solid rgba(245,87,108,0.3)' }}>
              🔥 ADMIN
            </span>
            <button onClick={() => router.push('/dashboard')} style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'white', padding: '5px 12px', borderRadius: '16px', fontSize: '11px',
              cursor: 'pointer', fontWeight: '600',
            }}>
              ← Dashboard
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total Users', value: users.length, color: '#667eea', icon: '👥' },
            { label: 'Free', value: users.filter(u => u.plan === 'free').length, color: '#4facfe', icon: '🆓' },
            { label: 'Weekly', value: users.filter(u => u.plan === 'weekly').length, color: '#667eea', icon: '⚡' },
            { label: 'Monthly', value: users.filter(u => u.plan === 'monthly').length, color: '#f093fb', icon: '💎' },
            { label: 'Yearly', value: users.filter(u => u.plan === 'yearly').length, color: '#f5576c', icon: '👑' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: stat.color }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Users Table */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', overflow: 'hidden' }}>
          
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: 'white', fontSize: '16px', fontWeight: '700', margin: 0 }}>👥 All Users ({users.length})</h2>
            <button onClick={fetchAllUsers} style={{
              background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.25)',
              color: '#667eea', padding: '5px 10px', borderRadius: '8px', fontSize: '11px',
              cursor: 'pointer', fontWeight: '600',
            }}>🔄 Refresh</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '650px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
                  {['#', 'Email', 'Plan', 'Credits', 'Chats', 'Change Plan', 'Delete'].map(h => (
                    <th key={h} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', padding: '10px 12px', textAlign: 'left', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No users yet</td></tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.015)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      
                      <td style={{ color: 'rgba(255,255,255,0.3)', padding: '8px 12px', fontSize: '11px' }}>{i + 1}</td>
                      
                      <td style={{ color: 'white', padding: '8px 12px', fontSize: '12px', fontWeight: '500' }}>
                        {u.email || 'N/A'}
                      </td>
                      
                      <td style={{ padding: '8px 12px' }}>
                        <span style={{
                          background: u.plan === 'yearly' ? 'rgba(245,87,108,0.2)' : u.plan === 'monthly' ? 'rgba(240,147,251,0.2)' : u.plan === 'weekly' ? 'rgba(102,126,234,0.2)' : 'rgba(79,172,254,0.2)',
                          color: u.plan === 'yearly' ? '#f5576c' : u.plan === 'monthly' ? '#f093fb' : u.plan === 'weekly' ? '#667eea' : '#4facfe',
                          padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700',
                        }}>
                          {(u.plan || 'free').toUpperCase()}
                        </span>
                      </td>
                      
                      <td style={{ color: 'white', padding: '8px 12px', fontSize: '13px', fontWeight: '700' }}>
                        {u.credits || 0}
                      </td>
                      
                      <td style={{ color: 'rgba(255,255,255,0.5)', padding: '8px 12px', fontSize: '12px' }}>
                        {u.totalChats || 0}
                      </td>
                      
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          value={u.plan || 'free'}
                          onChange={(e) => updateUserPlan(u.id, e.target.value)}
                          style={{
                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.15)', color: 'white',
                            padding: '4px 6px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer',
                          }}>
                          <option value="free" style={{ background: '#1a1a2e' }}>🆓 Free</option>
                          <option value="weekly" style={{ background: '#1a1a2e' }}>⚡ Weekly</option>
                          <option value="monthly" style={{ background: '#1a1a2e' }}>💎 Monthly</option>
                          <option value="yearly" style={{ background: '#1a1a2e' }}>👑 Yearly</option>
                        </select>
                      </td>
                      
                      <td style={{ padding: '8px 12px' }}>
                        <button onClick={() => deleteUser(u.id)} style={{
                          background: 'rgba(245,87,108,0.12)', border: '1px solid rgba(245,87,108,0.2)',
                          color: '#f5576c', padding: '4px 8px', borderRadius: '6px', fontSize: '10px',
                          cursor: 'pointer', fontWeight: '600',
                        }}>🗑️</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}