// components/HybridFlower.tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, Cylinder, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

export default function HybridFlower() {
  const flowerRef = useRef<THREE.Group>(null);
  const petalsRef = useRef<THREE.Group[]>([]);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (flowerRef.current) {
      flowerRef.current.position.y = Math.sin(time * 0.5) * 0.2;
      flowerRef.current.rotation.y += 0.002;
    }
    
    petalsRef.current.forEach((petal, i) => {
      if (petal) {
        petal.rotation.z = Math.sin(time * 2 + i) * 0.2;
        petal.rotation.x = Math.sin(time * 1.5 + i) * 0.2;
      }
    });
  });

  const addPetalRef = (el: THREE.Group | null, index: number) => {
    if (el) petalsRef.current[index] = el;
  };

  return (
    <group ref={flowerRef}>
      {/* Glowing base effect */}
      <pointLight position={[0, 1, 0]} intensity={1} color="#fbbf24" distance={5} />
      
      {/* Stem with glow */}
      <Cylinder
        args={[0.15, 0.2, 4.5]}
        position={[0, -1.8, 0]}
      >
        <MeshDistortMaterial
          color="#2d5a27"
          emissive="#1a3a17"
          distort={0.2}
          speed={1}
          roughness={0.3}
          metalness={0.2}
        />
      </Cylinder>

      {/* Leaves with glow */}
      {[-1, 1].map((side, i) => (
        <group key={`leaf-${i}`} position={[side * 0.8, -0.5, 0]}>
          <Cylinder
            args={[0.1, 0.1, 1.2]}
            rotation={[0.4, 0, side * 0.6]}
          >
            <MeshDistortMaterial
              color="#3d7a37"
              emissive="#1e4a1a"
              distort={0.3}
              speed={1.2}
            />
          </Cylinder>
        </group>
      ))}

      {/* Flower Center - glowing */}
      <Sphere args={[0.6, 32, 32]} position={[0, 0.3, 0]}>
        <MeshDistortMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.3}
        />
      </Sphere>

      {/* Inner Petals */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <group
            key={`inner-${i}`}
            ref={(el) => addPetalRef(el, i)}
            position={[Math.cos(rad) * 0.8, 0.3, Math.sin(rad) * 0.8]}
            rotation={[0.2, rad, 0.3]}
          >
            <Cylinder args={[0.2, 0.3, 0.8]} rotation={[0.5, 0, 0]}>
              <MeshDistortMaterial
                color={["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f87171"][i]}
                emissive={["#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", "#ef4444"][i]}
                distort={0.3}
                speed={2}
              />
            </Cylinder>
          </group>
        );
      })}

      {/* Outer Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <group
            key={`outer-${i}`}
            ref={(el) => addPetalRef(el, i + 6)}
            position={[Math.cos(rad) * 1.3, 0.4, Math.sin(rad) * 1.3]}
            rotation={[0.4, rad, 0.5]}
          >
            <Cylinder args={[0.15, 0.25, 1]} rotation={[0.6, 0, 0]}>
              <MeshDistortMaterial
                color="#fca5a5"
                emissive="#f87171"
                distort={0.2}
                speed={1.5}
                opacity={0.9}
                transparent
              />
            </Cylinder>
          </group>
        );
      })}
    </group>
  );
}