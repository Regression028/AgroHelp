// components/HybridDetailView.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HybridDetailed {
  name: string;
  description: string;
  farming_method: string;
  duration: string;
  water_needs: string;
  fertilizer_needs: string;
  pest_resistance: string;
  market_price: string;
  market_demand: string;
  selling_platforms: string[];
  government_schemes: string[];
  profit_margin: string;
  breakeven_time: string;
  yield_per_acre: string;
  season: string;
  soil_type: string;
  planting_time: string;
  spacing: string;
  harvest_method: string;
  storage_requirements: string;
  common_problems: string[];
  drought_tolerance: number;
  disease_resistance: number;
  yield_potential: number;
  market_value: number;
}

interface Props {
  hybrid: HybridDetailed;
  icon: string;
}

export default function HybridDetailView({ hybrid, icon }: Props) {
  const [activeTab, setActiveTab] = useState<"farming" | "market" | "analytics">("farming");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center">
          <span className="text-4xl">{icon}</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold text-white">{hybrid.name}</h2>
          <p className="text-emerald-300 text-lg">{hybrid.description}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickStat label="Duration" value={hybrid.duration} icon="⏱️" />
        <QuickStat label="Yield/Acre" value={hybrid.yield_per_acre} icon="🌾" />
        <QuickStat label="Profit" value={hybrid.profit_margin} icon="💰" />
        <QuickStat label="Market Price" value={hybrid.market_price} icon="📊" />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-white/5 backdrop-blur-xl p-2 rounded-2xl w-fit">
        <TabButton 
          active={activeTab === "farming"} 
          onClick={() => setActiveTab("farming")}
          icon="🌱"
          label="Farming Guide"
        />
        <TabButton 
          active={activeTab === "market"} 
          onClick={() => setActiveTab("market")}
          icon="💰"
          label="Market Info"
        />
        <TabButton 
          active={activeTab === "analytics"} 
          onClick={() => setActiveTab("analytics")}
          icon="📊"
          label="Analytics"
        />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "farming" && (
          <motion.div
            key="farming"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <DetailCard title="🌱 Growing Information">
              <DetailItem label="Duration" value={hybrid.duration} />
              <DetailItem label="Season" value={hybrid.season} />
              <DetailItem label="Planting Time" value={hybrid.planting_time} />
              <DetailItem label="Spacing" value={hybrid.spacing} />
              <DetailItem label="Soil Type" value={hybrid.soil_type} />
            </DetailCard>

            <DetailCard title="💧 Water & Fertilizer">
              <DetailItem label="Water Needs" value={hybrid.water_needs} />
              <DetailItem label="Fertilizer" value={hybrid.fertilizer_needs} />
              <DetailItem label="Pest Resistance" value={hybrid.pest_resistance} />
            </DetailCard>

            <DetailCard title="📝 Detailed Farming Method" className="lg:col-span-2">
              <p className="text-white/80 whitespace-pre-line leading-relaxed">{hybrid.farming_method}</p>
            </DetailCard>

            <DetailCard title="🌾 Harvest & Storage">
              <DetailItem label="Harvest Method" value={hybrid.harvest_method} />
              <DetailItem label="Storage" value={hybrid.storage_requirements} />
            </DetailCard>

            <DetailCard title="⚠️ Common Problems & Solutions">
              <ul className="space-y-2">
                {hybrid.common_problems?.map((problem, i) => (
                  <li key={i} className="text-white/80 flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    <span>{problem}</span>
                  </li>
                ))}
              </ul>
            </DetailCard>
          </motion.div>
        )}

        {activeTab === "market" && (
          <motion.div
            key="market"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <DetailCard title="💰 Price & Profit">
              <DetailItem label="Market Price" value={hybrid.market_price} />
              <DetailItem label="Market Demand" value={hybrid.market_demand} />
              <DetailItem label="Profit Margin" value={hybrid.profit_margin} />
              <DetailItem label="Breakeven Time" value={hybrid.breakeven_time} />
            </DetailCard>

            <DetailCard title="🏪 Selling Platforms">
              <ul className="space-y-2">
                {hybrid.selling_platforms?.map((platform, i) => (
                  <li key={i} className="text-white/80 flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    {platform}
                  </li>
                ))}
              </ul>
            </DetailCard>

            <DetailCard title="🏛️ Government Schemes" className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hybrid.government_schemes?.map((scheme, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white font-medium">{scheme}</p>
                    <p className="text-emerald-300 text-sm mt-1">Apply through local agriculture office</p>
                  </div>
                ))}
              </div>
            </DetailCard>
          </motion.div>
        )}

        {activeTab === "analytics" && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <DetailCard title="📊 Performance Metrics">
              <MetricBar 
                label="Yield Potential" 
                value={hybrid.yield_potential} 
                color="from-emerald-500 to-green-500"
              />
              <MetricBar 
                label="Disease Resistance" 
                value={hybrid.disease_resistance} 
                color="from-blue-500 to-sky-500"
              />
              <MetricBar 
                label="Drought Tolerance" 
                value={hybrid.drought_tolerance} 
                color="from-amber-500 to-orange-500"
              />
              <MetricBar 
                label="Market Value" 
                value={hybrid.market_value} 
                color="from-purple-500 to-pink-500"
              />
            </DetailCard>

            <DetailCard title="📈 Quick Statistics">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-400/20 rounded-xl p-4">
                  <p className="text-emerald-300 text-sm">Expected Yield per Acre</p>
                  <p className="text-3xl font-bold text-white">{hybrid.yield_per_acre}</p>
                </div>
                <div className="bg-gradient-to-br from-sky-600/20 to-sky-400/20 rounded-xl p-4">
                  <p className="text-sky-300 text-sm">Time to Harvest</p>
                  <p className="text-3xl font-bold text-white">{hybrid.duration}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-600/20 to-amber-400/20 rounded-xl p-4">
                  <p className="text-amber-300 text-sm">Net Profit per Acre</p>
                  <p className="text-3xl font-bold text-white">{hybrid.profit_margin}</p>
                </div>
              </div>
            </DetailCard>

            <DetailCard title="📉 Risk Analysis" className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-emerald-300 text-sm">Pest Risk</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[30%] bg-red-500" />
                    </div>
                    <span className="text-white">Low</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-emerald-300 text-sm">Weather Risk</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-yellow-500" />
                    </div>
                    <span className="text-white">Medium</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <p className="text-emerald-300 text-sm">Market Risk</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-[25%] bg-green-500" />
                    </div>
                    <span className="text-white">Low</span>
                  </div>
                </div>
              </div>
            </DetailCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Helper Components
function QuickStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <p className="text-white/60 text-sm">{label}</p>
      </div>
      <p className="text-white font-semibold text-lg">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
        active
          ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg"
          : "text-white/70 hover:text-white hover:bg-white/10"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function DetailCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 ${className}`}>
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-white/10 pb-2">
      <span className="text-white/60">{label}:</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-white/70 mb-2">
        <span>{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1 }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
    </div>
  );
}