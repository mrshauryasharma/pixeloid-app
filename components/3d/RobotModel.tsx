'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export function RobotModel() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} scale={2.5}>
        {/* Body */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1, 1.2, 0.8]} />
          <meshStandardMaterial color="#667eea" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial color="#f093fb" roughness={0.2} metalness={0.9} emissive="#f5576c" emissiveIntensity={0.3} />
        </mesh>

        {/* Eyes */}
        <mesh position={[-0.15, 1.9, 0.4]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={1} />
        </mesh>
        <mesh position={[0.15, 1.9, 0.4]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={1} />
        </mesh>

        {/* Antenna */}
        <mesh position={[0, 2.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
          <meshStandardMaterial color="#4facfe" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 2.6, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#f5576c" emissive="#f5576c" emissiveIntensity={0.8} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.7, 0.8, 0]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.12, 0.12, 1, 16]} />
          <meshStandardMaterial color="#667eea" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.7, 0.8, 0]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.12, 0.12, 1, 16]} />
          <meshStandardMaterial color="#667eea" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Hands */}
        <mesh position={[-0.95, 0.25, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#f093fb" roughness={0.2} metalness={0.7} />
        </mesh>
        <mesh position={[0.95, 0.25, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#f093fb" roughness={0.2} metalness={0.7} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.3, -0.1, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshStandardMaterial color="#764ba2" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.3, -0.1, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.8, 16]} />
          <meshStandardMaterial color="#764ba2" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.3, -0.6, 0.1]}>
          <boxGeometry args={[0.3, 0.15, 0.4]} />
          <meshStandardMaterial color="#f5576c" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0.3, -0.6, 0.1]}>
          <boxGeometry args={[0.3, 0.15, 0.4]} />
          <meshStandardMaterial color="#f5576c" roughness={0.3} metalness={0.7} />
        </mesh>

        {/* Chest plate */}
        <mesh position={[0, 1.1, 0.45]}>
          <boxGeometry args={[0.5, 0.3, 0.05]} />
          <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={0.6} />
        </mesh>

        {/* Mouth */}
        <mesh position={[0, 1.7, 0.45]}>
          <boxGeometry args={[0.2, 0.05, 0.02]} />
          <meshStandardMaterial color="#00f2fe" emissive="#00f2fe" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

export function OrbitingParticles() {
  const count = 8;
  const particlesRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.02;
      particlesRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.5;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 2.5;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#667eea' : '#f093fb'}
              emissive={i % 2 === 0 ? '#667eea' : '#f093fb'}
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}