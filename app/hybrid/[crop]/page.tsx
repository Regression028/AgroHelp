// app/hybrid/[crop]/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";
import Hybrid3DIcon from "@/components/Hybrid3DIcon";
import HybridOptionCard from "@/components/HybridOptionCard";
import HybridDetailView from "@/components/HybridDetailView";
import HybridSkeleton from "@/components/HybridSkeleton";

// Types
interface HybridSummary {
  name: string;
  description: string;
  duration: string;
  yield_per_acre?: string;
  profit_margin?: string;
  market_price?: string;
  key_benefit?: string;
}

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
  optimal_temperature?: string;
  ph_requirement?: string;
  seed_rate?: string;
  intercropping?: string[];
  value_added_products?: string[];
  success_stories?: string[];
}

interface PageProps {
  params: Promise<{ crop: string }>;
}

// Crop icon mapping
const cropIcons: { [key: string]: string } = {
  'wheat': '🌾',
  'rice': '🌾',
  'corn': '🌽',
  'tomato': '🍅',
  'potato': '🥔',
  'carrot': '🥕',
  'onion': '🧅',
  'garlic': '🧄',
  'apple': '🍎',
  'banana': '🍌',
  'orange': '🍊',
  'mango': '🥭',
  'grapes': '🍇',
  'strawberry': '🍓',
  'cotton': '🌿',
  'sugarcane': '🎋',
  'tea': '🍃',
  'coffee': '☕',
  'flower': '🌸',
  'rose': '🌹',
  'sunflower': '🌻',
  'default': '🌱'
};

export default function HybridPage({ params }: PageProps) {
  const { crop } = React.use(params);
  const searchParams = useSearchParams();
  const initialHybrid = searchParams.get("hybrid") || "";
  const [hybrids, setHybrids] = useState<HybridSummary[]>([]);
  const [selectedHybrid, setSelectedHybrid] = useState<HybridDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const cropName = decodeURIComponent(crop);
  const cropKey = cropName.toLowerCase();
  const cropIcon = cropIcons[cropKey] || cropIcons.default;

  // Progress animation for loading
  useEffect(() => {
    if (loadingDetails) {
      const interval = setInterval(() => {
        setProgress(prev => prev >= 90 ? 90 : prev + 10);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [loadingDetails]);

  // Step 1: Fetch hybrid options from main API
  useEffect(() => {
    fetchHybridOptions();
  }, [cropName]);

  const fetchHybridOptions = async () => {
    try {
      setLoading(true);
      
      // Get location from cache
      let lat = 18.5204;
      let lon = 73.8567;
      
      const cached = localStorage.getItem("crop_recommendation_cache");
      if (cached) {
        const { location } = JSON.parse(cached);
        lat = location.lat;
        lon = location.lon;
      }

      // Main API se hybrid options fetch karo
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cropName, 
          generateHybrids: true,
          lat,
          lon 
        }),
      });

      const result = await response.json();
      
      if (result.success && result.hybrids && result.hybrids.length > 0) {
        const summaryHybrids: HybridSummary[] = result.hybrids.map((h: any) => ({
          name: h.name,
          description: h.description,
          duration: h.duration,
          yield_per_acre: h.yield_per_acre,
          profit_margin: h.profit_margin,
          market_price: h.market_price,
          key_benefit: h.description?.split('.')[0] || h.name
        }));

        setHybrids(summaryHybrids);
        
        // Agar initial hybrid diya hai to use select karo
        if (initialHybrid) {
          const found = summaryHybrids.find(h => 
            h.name.toLowerCase().includes(initialHybrid.toLowerCase())
          );
          if (found) {
            handleHybridSelect(found);
          }
        }
      } else {
        setError("AI se hybrid data nahi mila");
      }
    } catch (err) {
      console.error("Error fetching hybrids:", err);
      setError("AI se data fetch karne mein error aaya");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Fetch detailed info from dedicated hybrid-details API
  const handleHybridSelect = async (hybrid: HybridSummary) => {
    try {
      setLoadingDetails(true);
      setProgress(10);
      
      // Get location from cache
      let lat = 18.5204;
      let lon = 73.8567;
      
      const cached = localStorage.getItem("crop_recommendation_cache");
      if (cached) {
        const { location } = JSON.parse(cached);
        lat = location.lat;
        lon = location.lon;
      }

      setProgress(30);

      // Dedicated API se specific hybrid ki details fetch karo
      const response = await fetch("/api/hybrid-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          cropName, 
          hybridName: hybrid.name,
          lat,
          lon 
        }),
      });

      setProgress(70);

      const result = await response.json();
      
      setProgress(90);

      if (result.success && result.details) {
        setSelectedHybrid(result.details);
      } else {
        // Fallback
        setSelectedHybrid(generateFallbackDetails(hybrid));
      }
      
      setProgress(100);
    } catch (err) {
      console.error("Error fetching hybrid details:", err);
      setSelectedHybrid(generateFallbackDetails(hybrid));
    } finally {
      setTimeout(() => {
        setLoadingDetails(false);
        setProgress(0);
      }, 500);
    }
  };

  const generateFallbackDetails = (hybrid: HybridSummary): HybridDetailed => {
    return {
      name: hybrid.name,
      description: hybrid.description,
      farming_method: `Sow ${cropName} in well-prepared field. Use certified seeds. Apply recommended fertilizers. Maintain regular irrigation schedule.`,
      duration: hybrid.duration,
      water_needs: "Medium (5-6 irrigations)",
      fertilizer_needs: "120:60:40 NPK kg/ha",
      pest_resistance: "Moderately resistant to common pests",
      market_price: hybrid.market_price || "₹2,000-2,200/quintal",
      market_demand: "High",
      selling_platforms: ["APMC Mandi", "Local Traders", "Online Platforms", "Farmer Producer Organizations"],
      government_schemes: ["PM-KISAN", "Soil Health Card", "RKVY", "PMFBY"],
      profit_margin: hybrid.profit_margin || "₹35,000-40,000/acre",
      breakeven_time: "5-6 months",
      yield_per_acre: hybrid.yield_per_acre || "20-22 quintals",
      season: "Kharif/Rabi depending on region",
      soil_type: "Well-drained loamy soil",
      planting_time: "November-December",
      spacing: "20cm x 15cm",
      harvest_method: "Manual harvesting when grains are mature",
      storage_requirements: "Store in cool, dry place with moisture <12%",
      common_problems: ["Pest attack", "Disease outbreak", "Weather damage", "Storage issues"],
      drought_tolerance: 75,
      disease_resistance: 80,
      yield_potential: 85,
      market_value: 80,
      optimal_temperature: "20-30°C",
      ph_requirement: "6.0-7.5",
      seed_rate: "20-25 kg/acre",
      intercropping: ["Gram", "Mustard", "Vegetables"],
      value_added_products: ["Flour", "Snacks", "Animal feed"],
      success_stories: ["Farmers in Punjab reported 25% higher yield", "Success in Haryana with proper irrigation"]
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-sky-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Hybrid3DIcon icon={cropIcon} scale={1.5} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
          </div>
          <p className="text-white text-2xl font-light">AI {cropName} ke hybrids dhundh raha hai...</p>
          <div className="w-64 h-2 bg-white/20 rounded-full mt-4 mx-auto overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full h-full bg-gradient-to-r from-emerald-400 to-sky-400"
            />
          </div>
          <p className="text-emerald-300 text-sm mt-4">कृपया प्रतीक्षा करें...</p>
        </div>
      </div>
    );
  }

  if (error || hybrids.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-sky-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center border border-white/20">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-red-400 mb-4 text-lg">{error || "Koi hybrid data nahi mila"}</p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold"
            >
              Wapas Home Pe Jayen
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-sky-950 overflow-hidden">
      {/* 3D Background */}
      <div className="fixed inset-0 opacity-20">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 7;
            const yOffset = Math.sin(i) * 2;
            return (
              <group
                key={i}
                position={[
                  Math.cos(angle) * radius,
                  yOffset,
                  Math.sin(angle) * radius,
                ]}
              >
                <Hybrid3DIcon icon={cropIcon} scale={0.5} />
              </group>
            );
          })}
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
        </Canvas>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link href="/">
          <motion.button
            whileHover={{ x: -5 }}
            className="text-white/80 hover:text-white mb-6 flex items-center gap-2 text-lg bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all"
          >
            ← Wapas Recommendations Pe
          </motion.button>
        </Link>

        {/* Header with Glow Effect */}
        <div className="relative mb-12">
          <div className="absolute -inset-20 bg-gradient-to-r from-emerald-500/20 to-sky-500/20 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
              <span className="text-6xl">{cropIcon}</span>
            </div>
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-5xl md:text-6xl font-bold text-white mb-2"
              >
                {cropName}
              </motion.h1>
              <p className="text-emerald-300 text-lg flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                AI ne {hybrids.length} hybrid varieties suggest ki hain
              </p>
            </div>
          </div>
        </div>

        {!selectedHybrid ? (
          /* Step 1: Show Hybrid Options */
          <>
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-3xl font-semibold text-white mb-8 flex items-center gap-2"
            >
              <span className="text-4xl">🌱</span>
              AI-Recommended Hybrid Varieties
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hybrids.map((hybrid, index) => (
                <HybridOptionCard
                  key={index}
                  hybrid={hybrid}
                  icon={cropIcon}
                  index={index}
                  onSelect={() => handleHybridSelect(hybrid)}
                />
              ))}
            </div>
          </>
        ) : (
          /* Step 2: Show Hybrid Details */
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedHybrid(null)}
              className="mb-6 text-white/70 hover:text-white flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/20 transition-all"
            >
              ← Sab hybrids par wapas jayein
            </motion.button>

            {loadingDetails ? (
              <HybridSkeleton progress={progress} icon={cropIcon} />
            ) : (
              <HybridDetailView 
                hybrid={selectedHybrid} 
                icon={cropIcon}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}