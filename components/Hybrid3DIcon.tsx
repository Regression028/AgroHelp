// components/Hybrid3DIcon.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

interface Props {
  icon: string;
  scale?: number;
  position?: [number, number, number];
}

export default function Hybrid3DIcon({ icon, scale = 1, position = [0, 0, 0] }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Glowing background */}
      <Sphere args={[1, 32, 32]} ref={meshRef}>
        <MeshDistortMaterial
          color="#10b981"
          emissive="#059669"
          distort={0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Icon as 3D Text */}
      <Text
        fontSize={1.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.5]}
      >
        {icon}
      </Text>

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <Sphere
            key={i}
            args={[0.1, 8, 8]}
            position={[
              Math.cos(angle) * 1.5,
              Math.sin(angle) * 1.5,
              0,
            ]}
          >
            <MeshDistortMaterial
              color={["#fbbf24", "#34d399", "#60a5fa"][i % 3]}
              emissive={["#f59e0b", "#10b981", "#3b82f6"][i % 3]}
              distort={0.2}
              speed={1}
            />
          </Sphere>
        );
      })}
    </group>
  );
}