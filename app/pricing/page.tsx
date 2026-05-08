'use client';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    icon: '🎁',
    chats: '20 chats daily',
    features: ['20 chats/day', 'Basic AI responses', 'Email support'],
    color: 'linear-gradient(135deg, #667eea, #764ba2)',
    popular: false,
  },
  {
    name: 'Weekly',
    price: '₹15',
    icon: '⚡',
    chats: '100 chats',
    features: ['100 chats/week', 'Priority AI', 'Chat history', '24/7 support'],
    color: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    popular: false,
  },
  {
    name: 'Monthly',
    price: '₹60',
    icon: '💎',
    chats: '200 chats',
    features: ['200 chats/month', 'Advanced AI', 'Unlimited history', 'Priority support'],
    color: 'linear-gradient(135deg, #667eea, #f5576c)',
    popular: true,
  },
  {
    name: 'Yearly',
    price: '₹499',
    icon: '👑',
    chats: 'Unlimited',
    features: ['Unlimited chats', 'Premium AI', 'Everything included', 'Dedicated support'],
    color: 'linear-gradient(135deg, #f5576c, #f093fb)',
    popular: false,
  },
];

export default function Pricing() {
  const handlePayment = (plan: string) => {
    if (plan === 'Free') {
      window.location.href = '/signup';
      return;
    }
    alert('🛠️ Payment system coming soon! Sign up for free plan to start using Pixeloid.');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      padding: 'clamp(20px, 5vw, 60px) clamp(12px, 3vw, 20px)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(245,87,108,0.2), rgba(240,147,251,0.2))',
            border: '1px solid rgba(245,87,108,0.3)',
            borderRadius: '16px',
            padding: '12px 24px',
            textAlign: 'center',
            marginBottom: 'clamp(20px, 3vw, 40px)',
            maxWidth: '500px',
            margin: '0 auto clamp(20px, 3vw, 40px)',
          }}
        >
          <p style={{
            color: '#f093fb',
            margin: 0,
            fontSize: 'clamp(12px, 1.8vw, 14px)',
            fontWeight: '600',
          }}>
            🛠️ Payment system coming soon! All upgrades will be available shortly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(30px, 5vw, 60px)' }}
        >
          <h1 style={{
            fontSize: 'clamp(30px, 8vw, 56px)',
            fontWeight: '900',
            background: 'linear-gradient(to right, #f093fb, #667eea, #f5576c)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '12px',
          }}>
            Choose Your Plan
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 'clamp(14px, 2.5vw, 20px)',
            fontWeight: '300',
          }}>
            Purchase options will be available soon. Start with Free!
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'clamp(14px, 2vw, 20px)',
          alignItems: 'start',
        }}>
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8 }}
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(30px)',
                border: plan.popular 
                  ? '2px solid rgba(102,126,234,0.5)' 
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'clamp(18px, 3vw, 28px)',
                overflow: 'hidden',
                transition: 'all 0.4s',
                position: 'relative',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #667eea, #f093fb)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: 'clamp(10px, 1.5vw, 12px)',
                  fontWeight: '700',
                  zIndex: 1,
                }}>
                  🔥 POPULAR
                </div>
              )}

              <div style={{
                background: plan.color,
                padding: 'clamp(20px, 3vw, 36px) clamp(14px, 2vw, 24px)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: '8px' }}>
                  {plan.icon}
                </div>
                <h3 style={{
                  color: 'white',
                  fontSize: 'clamp(18px, 2.5vw, 24px)',
                  fontWeight: '800',
                  margin: '0 0 6px 0',
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 'clamp(11px, 1.8vw, 14px)',
                  marginBottom: '10px',
                }}>
                  {plan.chats}
                </div>
                <div>
                  <span style={{
                    color: 'white',
                    fontSize: 'clamp(30px, 5vw, 44px)',
                    fontWeight: '900',
                  }}>
                    {plan.price}
                  </span>
                  {plan.name !== 'Free' && (
                    <span style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 'clamp(12px, 2vw, 16px)',
                    }}>
                      /{plan.name.toLowerCase()}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ padding: 'clamp(16px, 2vw, 28px)' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 clamp(16px, 2vw, 28px) 0' }}>
                  {plan.features.map((feature, i) => (
                    <li key={i} style={{
                      color: 'rgba(255,255,255,0.8)',
                      padding: 'clamp(7px, 1vw, 10px) 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      fontSize: 'clamp(12px, 1.8vw, 14px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{ color: '#4facfe', fontSize: 'clamp(14px, 2vw, 18px)' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => handlePayment(plan.name)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    padding: 'clamp(12px, 2vw, 16px)',
                    borderRadius: 'clamp(12px, 2vw, 16px)',
                    border: plan.popular ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    background: plan.popular 
                      ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                      : plan.name === 'Free' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: plan.popular ? '0 4px 16px rgba(102,126,234,0.4)' : 'none',
                    opacity: plan.name === 'Free' ? 1 : 0.7,
                  }}
                >
                  {plan.name === 'Free' ? 'Get Started Free' : 'Coming Soon'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}