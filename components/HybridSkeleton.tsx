// components/HybridSkeleton.tsx
"use client";

import { motion } from "framer-motion";

interface Props {
  progress: number;
  icon: string;
}

export default function HybridSkeleton({ progress, icon }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-white/10 rounded-2xl animate-pulse" />
        <div className="space-y-2">
          <div className="w-64 h-8 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-96 h-4 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-sky-500"
        />
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-white text-xl">AI Hybrid Details ला रहा है...</p>
        <p className="text-emerald-300 text-sm">
          {progress < 30 && "🌱 Hybrid information इकट्ठा कर रहे हैं"}
          {progress >= 30 && progress < 60 && "📊 Market analysis तैयार कर रहे हैं"}
          {progress >= 60 && progress < 90 && "📝 Farming guide बना रहे हैं"}
          {progress >= 90 && "✨ Final touches लगा रहे हैं"}
        </p>
      </div>

      {/* Skeleton Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse">
            <div className="w-8 h-8 bg-white/10 rounded-lg mb-2" />
            <div className="w-16 h-3 bg-white/10 rounded mb-1" />
            <div className="w-20 h-4 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 bg-white/5 p-2 rounded-2xl w-fit">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-24 h-10 bg-white/10 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white/5 rounded-3xl p-6 space-y-4">
            <div className="w-40 h-5 bg-white/10 rounded animate-pulse" />
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <div className="w-24 h-3 bg-white/10 rounded" />
                <div className="w-full h-4 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Floating Icon Animation */}
      <div className="fixed bottom-10 right-10">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-6xl opacity-30"
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
}