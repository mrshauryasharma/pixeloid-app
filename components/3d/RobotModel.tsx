'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export function RobotModel() {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const leftArmRef = useRef<THREE.Mesh>(null!);
  const rightArmRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.4;
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.3;
      rightArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8 + Math.PI) * 0.3;
    }
  });

  const metalMaterial = { roughness: 0.25, metalness: 0.9 };
  const darkMetal = { roughness: 0.3, metalness: 0.85 };
  const glassMaterial = { roughness: 0.1, metalness: 0.3 };

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef} scale={2.8} position={[0, -0.3, 0]}>
        
        {/* Torso - Main Body */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[1.2, 1.6, 0.8]} />
          <meshStandardMaterial color="#3a3a4a" {...metalMaterial} />
        </mesh>
        
        {/* Torso Armor Plates */}
        <mesh position={[0, 1.5, 0.45]} castShadow>
          <boxGeometry args={[1.0, 1.2, 0.05]} />
          <meshStandardMaterial color="#4a4a5a" {...darkMetal} />
        </mesh>
        
        {/* Chest Core - Glowing Arc Reactor */}
        <mesh position={[0, 1.8, 0.48]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.8, 0.5]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshStandardMaterial color="#667eea" emissive="#667eea" emissiveIntensity={1.5} roughness={0.1} />
        </mesh>
        
        {/* Abdomen Plates */}
        <mesh position={[0, 1.05, 0.4]} castShadow>
          <boxGeometry args={[0.7, 0.3, 0.04]} />
          <meshStandardMaterial color="#505060" {...darkMetal} />
        </mesh>
        <mesh position={[0, 1.3, 0.4]} castShadow>
          <boxGeometry args={[0.8, 0.3, 0.04]} />
          <meshStandardMaterial color="#505060" {...darkMetal} />
        </mesh>

        {/* Head */}
        <mesh ref={headRef} position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[0.65, 0.55, 0.5]} />
          <meshStandardMaterial color="#4a4a5a" {...darkMetal} />
        </mesh>
        
        {/* Face Plate */}
        <mesh position={[0, 2.5, 0.28]}>
          <boxGeometry args={[0.5, 0.35, 0.03]} />
          <meshStandardMaterial color="#0a0a15" roughness={0.05} />
        </mesh>
        
        {/* Eyes - Glowing */}
        <mesh position={[-0.12, 2.6, 0.32]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3} roughness={0.05} />
        </mesh>
        <mesh position={[0.12, 2.6, 0.32]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3} roughness={0.05} />
        </mesh>
        
        {/* Mouth LED */}
        <mesh position={[0, 2.42, 0.32]}>
          <boxGeometry args={[0.2, 0.02, 0.01]} />
          <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} />
        </mesh>
        
        {/* Head Top */}
        <mesh position={[0, 2.8, 0]} castShadow>
          <boxGeometry args={[0.5, 0.08, 0.4]} />
          <meshStandardMaterial color="#555570" {...darkMetal} />
        </mesh>
        
        {/* Antenna */}
        <mesh position={[0.15, 3.0, -0.1]} rotation={[0.2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#667eea" {...metalMaterial} />
        </mesh>
        <mesh position={[0.15, 3.18, -0.08]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#f5576c" emissive="#f5576c" emissiveIntensity={2} />
        </mesh>

        {/* Shoulder Pads */}
        <mesh position={[-0.75, 2.05, 0]} rotation={[0, 0, 0.2]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#555570" {...darkMetal} />
        </mesh>
        <mesh position={[0.75, 2.05, 0]} rotation={[0, 0, -0.2]} castShadow>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#555570" {...darkMetal} />
        </mesh>

        {/* Upper Arms */}
        <mesh ref={leftArmRef} position={[-0.8, 1.4, 0]} rotation={[0.2, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.9, 12]} />
          <meshStandardMaterial color="#4a4a5a" {...darkMetal} />
        </mesh>
        <mesh ref={rightArmRef} position={[0.8, 1.4, 0]} rotation={[-0.2, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.9, 12]} />
          <meshStandardMaterial color="#4a4a5a" {...darkMetal} />
        </mesh>

        {/* Forearms */}
        <mesh position={[-1.15, 0.7, 0.05]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.7, 12]} />
          <meshStandardMaterial color="#3a3a4a" {...metalMaterial} />
        </mesh>
        <mesh position={[1.15, 0.7, 0.05]} rotation={[0, 0, -0.5]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.7, 12]} />
          <meshStandardMaterial color="#3a3a4a" {...metalMaterial} />
        </mesh>

        {/* Hands - Claw style */}
        <mesh position={[-1.3, 0.3, 0.08]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.15]} />
          <meshStandardMaterial color="#505060" {...darkMetal} />
        </mesh>
        <mesh position={[1.3, 0.3, 0.08]} castShadow>
          <boxGeometry args={[0.2, 0.12, 0.15]} />
          <meshStandardMaterial color="#505060" {...darkMetal} />
        </mesh>
        
        {/* Fingers */}
        {[-0.08, 0, 0.08].map((offset, i) => (
          <mesh key={`lf${i}`} position={[-1.35, 0.2, 0.05 + offset]}>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
            <meshStandardMaterial color="#606070" {...darkMetal} />
          </mesh>
        ))}
        {[-0.08, 0, 0.08].map((offset, i) => (
          <mesh key={`rf${i}`} position={[1.35, 0.2, 0.05 + offset]}>
            <cylinderGeometry args={[0.02, 0.02, 0.15, 6]} />
            <meshStandardMaterial color="#606070" {...darkMetal} />
          </mesh>
        ))}

        {/* Hip Joints */}
        <mesh position={[-0.35, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#555570" {...darkMetal} />
        </mesh>
        <mesh position={[0.35, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial color="#555570" {...darkMetal} />
        </mesh>

        {/* Upper Legs */}
        <mesh position={[-0.35, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.9, 12]} />
          <meshStandardMaterial color="#3a3a4a" {...metalMaterial} />
        </mesh>
        <mesh position={[0.35, 0.05, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.9, 12]} />
          <meshStandardMaterial color="#3a3a4a" {...metalMaterial} />
        </mesh>

        {/* Knee Joints */}
        <mesh position={[-0.35, -0.45, 0.05]} castShadow>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#667eea" {...metalMaterial} />
        </mesh>
        <mesh position={[0.35, -0.45, 0.05]} castShadow>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshStandardMaterial color="#667eea" {...metalMaterial} />
        </mesh>

        {/* Lower Legs */}
        <mesh position={[-0.35, -0.9, 0.05]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
          <meshStandardMaterial color="#4a4a5a" {...darkMetal} />
        </mesh>
        <mesh position={[0.35, -0.9, 0.05]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 0.7, 12]} />
          <meshStandardMaterial color="#4a4a5a" {...darkMetal} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.35, -1.3, 0.1]} castShadow>
          <boxGeometry args={[0.25, 0.1, 0.35]} />
          <meshStandardMaterial color="#505060" {...darkMetal} />
        </mesh>
        <mesh position={[0.35, -1.3, 0.1]} castShadow>
          <boxGeometry args={[0.25, 0.1, 0.35]} />
          <meshStandardMaterial color="#505060" {...darkMetal} />
        </mesh>

        {/* Backpack / Jet pack */}
        <mesh position={[0, 1.7, -0.5]} castShadow>
          <boxGeometry args={[0.6, 1.0, 0.3]} />
          <meshStandardMaterial color="#2a2a35" {...metalMaterial} />
        </mesh>
        <mesh position={[0, 2.0, -0.7]}>
          <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
          <meshStandardMaterial color="#667eea" {...metalMaterial} />
        </mesh>
        <mesh position={[0, 1.4, -0.7]}>
          <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
          <meshStandardMaterial color="#667eea" {...metalMaterial} />
        </mesh>

        {/* Thrusters glow */}
        <mesh position={[0, 2.15, -0.78]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3} />
        </mesh>
        <mesh position={[0, 1.55, -0.78]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3} />
        </mesh>
      </group>
    </Float>
  );
}

export function OrbitingParticles() {
  const count = 12;
  const particlesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.015;
      particlesRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.8;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3.5;
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#667eea' : i % 3 === 1 ? '#f093fb' : '#00d4ff'}
              emissive={i % 3 === 0 ? '#667eea' : i % 3 === 1 ? '#f093fb' : '#00d4ff'}
              emissiveIntensity={2}
            />
          </mesh>
        );
      })}
    </group>
  );
}