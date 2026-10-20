// components/Loader.tsx
"use client";

import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import HybridFlower from "./HybridFlower";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";

export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState("Analyzing location...");

  useEffect(() => {
    const stages = [
      "Analyzing location...",
      "Scanning soil conditions...",
      "Calculating climate patterns...",
      "Evaluating market trends...",
      "Generating hybrid recommendations...",
      "Preparing your dashboard..."
    ];

    let currentStage = 0;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1;
        
        if (newProgress > 16 && currentStage === 0) {
          setLoadingStage(stages[1]);
          currentStage = 1;
        } else if (newProgress > 33 && currentStage === 1) {
          setLoadingStage(stages[2]);
          currentStage = 2;
        } else if (newProgress > 50 && currentStage === 2) {
          setLoadingStage(stages[3]);
          currentStage = 3;
        } else if (newProgress > 66 && currentStage === 3) {
          setLoadingStage(stages[4]);
          currentStage = 4;
        } else if (newProgress > 83 && currentStage === 4) {
          setLoadingStage(stages[5]);
          currentStage = 5;
        }
        
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-emerald-950 via-green-900 to-sky-950 overflow-hidden">
      {/* Main 3D Canvas with Tree */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas 
          camera={{ position: [0, 2, 12], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            autoRotate 
            autoRotateSpeed={1}
          />
          
          {/* Enhanced Lighting */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 10, 5]} intensity={2} />
          <pointLight position={[-5, 5, 5]} intensity={1.2} color="#ff6b6b" />
          <pointLight position={[5, 3, -5]} intensity={1.2} color="#4ecdc4" />
          
          {/* Center Tree/Flower */}
          <group position={[0, -0.8, 0]} scale={1.3}>
            <HybridFlower />
          </group>

          {/* Circular Loading Elements */}
          <LoadingCircle progress={progress} />
          
          {/* Floating Particles around the tree */}
          <FloatingParticles count={30} />
        </Canvas>
      </div>

      {/* Minimal Overlay with Progress Info */}
      <div className="relative z-10 text-center">
        {/* Circular Progress Indicator - HTML overlay */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-4 border-emerald-500/30 border-t-emerald-500"
          />
          
          {/* Inner pulsing ring */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-4 rounded-full border-2 border-sky-500/50"
          />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-5xl mb-2"
            >
              🌱
            </motion.div>
            <div className="text-3xl font-bold text-white">{progress}%</div>
          </div>
        </div>

        {/* Loading Stage Text */}
        <motion.div
          key={loadingStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl text-white/90 font-medium mb-4"
        >
          {loadingStage}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-72 h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm mx-auto">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-400 via-green-400 to-sky-400 rounded-full"
          />
        </div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-sm text-white/60 font-mono"
        >
          {progress < 33 && "🌍 Initializing..."}
          {progress >= 33 && progress < 66 && "🔬 Processing data..."}
          {progress >= 66 && progress < 100 && "🌿 Growing recommendations..."}
          {progress === 100 && "✨ Ready to explore!"}
        </motion.div>
      </div>
    </div>
  );
}

// 3D Circular Loading Elements - Fixed with proper animations
function LoadingCircle({ progress }: { progress: number }) {
  const dotsRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (dotsRef.current) {
      dotsRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      {/* Main static circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1, 0]}>
        <ringGeometry args={[1.8, 2, 64]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#059669"
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Progress circle - fills based on progress */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 1, 0.1]}>
        <ringGeometry args={[1.8, 2, 64, 0, (progress / 100) * Math.PI * 2]} />
        <meshStandardMaterial 
          color="#34d399" 
          emissive="#10b981"
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting dots group - rotates continuously */}
      <group ref={dotsRef} position={[0, 1, 0]}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 2,
                Math.sin(angle * 2) * 0.2,
                Math.sin(angle) * 2,
              ]}
            >
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial 
                color={i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#34d399" : "#60a5fa"}
                emissive={i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#10b981" : "#3b82f6"}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

// Floating Particles Component - Fixed with proper animation
function FloatingParticles({ count }: { count: number }) {
  const particlesRef = useRef<THREE.Group>(null);
  const initialPositions = useRef<{ x: number; y: number; z: number }[]>([]);
  
  // Initialize random positions
  useEffect(() => {
    initialPositions.current = Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle * 2) * 1.5,
        z: Math.sin(angle) * radius,
      };
    });
  }, [count]);
  
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      const time = clock.getElapsedTime();
      particlesRef.current.children.forEach((child, i) => {
        if (initialPositions.current[i]) {
          // Gentle floating motion
          child.position.y = initialPositions.current[i].y + Math.sin(time * 2 + i) * 0.3;
          // Subtle scale animation
          const scale = 1 + Math.sin(time * 3 + i) * 0.2;
          child.scale.set(scale, scale, scale);
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 3 + Math.random() * 2;
        
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2) * 1.5,
              Math.sin(angle) * radius,
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color={["#fbbf24", "#34d399", "#60a5fa", "#f87171"][i % 4]}
              emissive={["#f59e0b", "#10b981", "#3b82f6", "#ef4444"][i % 4]}
              transparent
              opacity={0.7}
            />
          </mesh>
        );
      })}
    </group>
  );
}