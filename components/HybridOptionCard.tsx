// components/HybridOptionCard.tsx
"use client";

import { motion } from "framer-motion";

interface HybridSummary {
  name: string;
  description: string;
  duration: string;
  yield_per_acre?: string;
  profit_margin?: string;
  market_price?: string;
  key_benefit?: string;
}

interface Props {
  hybrid: HybridSummary;
  icon: string;
  index: number;
  onSelect: () => void;
}

export default function HybridOptionCard({ hybrid, icon, index, onSelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onSelect}
      className="group cursor-pointer"
    >
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
        
        <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-full blur-2xl" />
          
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-3xl">{icon}</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2">{hybrid.name}</h3>
          <p className="text-white/70 text-sm mb-4 line-clamp-2">{hybrid.key_benefit || hybrid.description}</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/5 rounded-xl p-2">
              <p className="text-xs text-emerald-300">Duration</p>
              <p className="text-sm font-semibold text-white">{hybrid.duration}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2">
              <p className="text-xs text-emerald-300">Yield</p>
              <p className="text-sm font-semibold text-white">{hybrid.yield_per_acre || "—"}</p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <div>
              <p className="text-xs text-white/50">Market Price</p>
              <p className="text-sm font-semibold text-emerald-400">{hybrid.market_price || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/50">Profit</p>
              <p className="text-sm font-semibold text-amber-400">{hybrid.profit_margin || "—"}</p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/90 font-medium transition-colors"
          >
            View Details →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}