'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import { Suspense } from 'react';

function Cube3D() {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial 
          color="#667eea" 
          metalness={0.3}
          roughness={0.2}
          emissive="#764ba2"
          emissiveIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

function Sphere3D() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh position={[5, 2, -3]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color="#f093fb" 
          metalness={0.5}
          roughness={0.1}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function Torus3D() {
  return (
    <Float speed={1.2} rotationIntensity={1.5} floatIntensity={2}>
      <mesh position={[-4, -1, -2]}>
        <torusGeometry args={[1.5, 0.4, 16, 32]} />
        <meshStandardMaterial 
          color="#f5576c" 
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <Float key={i} speed={Math.random() * 2 + 1} rotationIntensity={0} floatIntensity={1}>
          <mesh position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ]}>
            <sphereGeometry args={[0.1, 4, 4]} />
            <meshBasicMaterial color="#fff" />
          </mesh>
        </Float>
      ))}
    </>
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
      {/* 3D Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Canvas camera={{ position: [0, 0, 12], fov: 60 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Cube3D />
            <Sphere3D />
            <Torus3D />
            <Particles />
            <OrbitControls 
              enableZoom={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, type: "spring" }}
            style={{ textAlign: 'center' }}
          >
            <motion.h1
              style={{
                fontSize: '80px',
                fontWeight: '900',
                background: 'linear-gradient(to right, #f093fb, #667eea, #f5576c)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
                textShadow: '0 0 80px rgba(102,126,234,0.5)',
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
                fontSize: '26px',
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '12px',
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
                fontSize: '20px',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '48px',
                fontWeight: '300',
              }}
            >
              Chat • Create • Automate — All with Simple AI Tools
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}
            >
              <Link href="/signup" style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                padding: '18px 48px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '20px',
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
                padding: '18px 48px',
                borderRadius: '50px',
                textDecoration: 'none',
                fontSize: '20px',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s',
              }}>
                💎 View Plans
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Cards with Glass Morphism */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '32px',
              marginTop: '100px',
            }}
          >
            {[
              { icon: '🤖', title: 'AI Chat', desc: '24/7 intelligent conversations powered by advanced AI' },
              { icon: '⚡', title: 'Fast & Easy', desc: 'Lightning quick responses for seamless experience' },
              { icon: '🔒', title: '100% Secure', desc: 'Your data is protected with enterprise-grade security' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.2 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 20px 60px rgba(102,126,234,0.3)',
                  border: '1px solid rgba(102,126,234,0.5)',
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '24px',
                  padding: '40px',
                  textAlign: 'center',
                  transition: 'all 0.4s',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: 'white',
                  marginBottom: '12px',
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.7)',
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