'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function OrbModel() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={3}>
      <mesh ref={meshRef} scale={2.5}>
        <icosahedronGeometry args={[1, 2]} />
        <MeshDistortMaterial
          color="#667eea"
          emissive="#764ba2"
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.8}
          distort={0.4}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

export function SmallOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} scale={1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#f093fb"
          emissive="#f5576c"
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.7}
          wireframe
        />
      </mesh>
    </Float>
  );
}

export function TorusModel() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1.5} floatIntensity={2}>
      <mesh ref={meshRef} scale={1.5}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial
          color="#4facfe"
          emissive="#00f2fe"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
}

export function Particles3D() {
  const count = 200;
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  const ref = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05;
      ref.current.rotation.x = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#667eea"
        sizeAttenuation={true}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

export function AISphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#667eea"
          emissive="#764ba2"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

export function FloatingCubes() {
  const cubes = [
    { pos: [-2, 1, -1], color: '#667eea', size: 1 },
    { pos: [3, -1, -2], color: '#f093fb', size: 0.8 },
    { pos: [-1, -2, -3], color: '#4facfe', size: 1.2 },
    { pos: [2, 2, -1], color: '#f5576c', size: 0.6 },
  ];

  return (
    <>
      {cubes.map((cube, i) => (
        <Float key={i} speed={1 + i * 0.5} rotationIntensity={2} floatIntensity={2}>
          <mesh position={[cube.pos[0], cube.pos[1], cube.pos[2]]}>
            <boxGeometry args={[cube.size, cube.size, cube.size]} />
            <meshStandardMaterial
              color={cube.color}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}