// app/hybrid-business/[crop]/[hybrid]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import Link from "next/link";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Line, Radar, Doughnut } from 'react-chartjs-2';
import { 
  FaSeedling, 
  FaTractor, 
  FaRupeeSign, 
  FaStore, 
  FaVideo, 
  FaChartLine, 
  FaIndustry,
  FaShoppingCart,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaYoutube,
  FaFacebook,
  FaInstagram,
  FaWhatsapp
} from 'react-icons/fa';
import { MdAgriculture, MdLocalShipping, MdOutlinePrecisionManufacturing } from 'react-icons/md';
import { GiFarmer,  GiFruitTree } from 'react-icons/gi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

interface BusinessAnalytics {
  // Basic Info
  cropName: string;
  hybridName: string;
  description: string;
  category: string;
  
  // Seed Source
  seedSources: {
    name: string;
    company: string;
    price: string;
    quantity: string;
    website: string;
    contact: string;
    rating: number;
    certified: boolean;
  }[];
  
  // Machinery Required
  machinery: {
    name: string;
    purpose: string;
    cost: string;
    rentalAvailable: boolean;
    rentalCost: string;
    subsidyEligible: boolean;
    subsidyPercent: number;
    image?: string;
  }[];
  
  // Complete Cost Breakdown
  costBreakdown: {
    category: string;
    items: {
      name: string;
      cost: number;
      percentage: number;
    }[];
    totalCost: number;
  };
  
  // Profit Analysis
  profitAnalysis: {
    yieldPerAcre: string;
    marketPrice: string;
    revenuePerAcre: number;
    costPerAcre: number;
    netProfitPerAcre: number;
    profitMargin: number;
    roi: number;
    breakevenTime: string;
    monthlyProjection: {
      month: string;
      revenue: number;
      cost: number;
      profit: number;
    }[];
  };
  
  // Selling Platforms
  sellingPlatforms: {
    type: 'direct' | 'online' | 'local' | 'export' | 'hallSell';
    name: string;
    description: string;
    website: string;
    commission: string;
    paymentTime: string;
    requirements: string[];
    rating: number;
    contact?: string;
  }[];
  
  // Local Selling (Hall Sell)
  hallSell: {
    available: boolean;
    locations: {
      city: string;
      marketName: string;
      address: string;
      timings: string;
      contact: string;
      mapLink: string;
      avgPrice: string;
    }[];
    process: string[];
    documents: string[];
  };
  
  // Value Added Products
  valueAddedProducts: {
    name: string;
    description: string;
    requiredEquipment: string[];
    rawMaterialRequired: string;
    process: string[];
    estimatedCost: string;
    sellingPrice: string;
    profitMargin: string;
    marketDemand: string;
    sourceForEquipment: {
      name: string;
      website: string;
      price: string;
    }[];
    videoTutorials: {
      title: string;
      url: string;
      platform: 'youtube' | 'other';
      duration: string;
    }[];
  }[];
  
  // Video Tutorials
  videoTutorials: {
    category: string;
    videos: {
      title: string;
      url: string;
      platform: 'youtube' | 'other';
      thumbnail?: string;
      duration: string;
      channel: string;
      description: string;
    }[];
  }[];
  
  // Market Analysis
  marketAnalysis: {
    currentDemand: string;
    demandTrend: 'increasing' | 'stable' | 'decreasing';
    priceTrend: {
      month: string;
      price: number;
    }[];
    competitorAnalysis: {
      competitor: string;
      price: string;
      marketShare: number;
      strengths: string[];
    }[];
    exportPotential: {
      countries: string[];
      requirements: string[];
      price: string;
    };
  };
  
  // Success Stories
  successStories: {
    farmer: string;
    location: string;
    yield: string;
    profit: string;
    experience: string;
    image?: string;
    video?: string;
  }[];
  
  // Government Schemes
  governmentSchemes: {
    name: string;
    description: string;
    benefit: string;
    eligibility: string;
    website: string;
    documents: string[];
  }[];
}

// YouTube embed component
const YouTubeEmbed = ({ url }: { url: string }) => {
  const videoId = url.split('v=')[1] || url.split('/').pop();
  return (
    <div className="relative w-full h-48 rounded-xl overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default function HybridBusinessPage() {
  const params = useParams();
  const cropName = decodeURIComponent(params.crop as string);
  const hybridName = decodeURIComponent(params.hybrid as string);
  
  const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessAnalytics();
  }, [cropName, hybridName]);

  const fetchBusinessAnalytics = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/business-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName, hybridName }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError("Failed to fetch business analytics");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-sky-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <Canvas camera={{ position: [0, 0, 5] }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Sphere args={[1, 100, 200]} scale={1.5}>
                <MeshDistortMaterial
                  color="#10b981"
                  attach="material"
                  distort={0.4}
                  speed={2}
                />
              </Sphere>
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
          </div>
          <p className="text-white text-2xl font-light">AI Business Analysis Generating...</p>
          <p className="text-emerald-300 mt-4">Crop: {cropName} | Hybrid: {hybridName}</p>
          <div className="w-64 h-2 bg-white/20 rounded-full mt-8 mx-auto overflow-hidden">
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-full h-full bg-gradient-to-r from-emerald-400 to-sky-400"
            />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-sky-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 max-w-md text-center border border-white/20">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4 text-lg">{error || "Data not found"}</p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold"
            >
              Back to Home
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  // Chart Data
  const costChartData = {
    labels: analytics.costBreakdown.items.map(item => item.name),
    datasets: [{
      data: analytics.costBreakdown.items.map(item => item.cost),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderWidth: 0,
    }],
  };

  const profitChartData = {
    labels: analytics.profitAnalysis.monthlyProjection.map(p => p.month),
    datasets: [
      {
        label: 'Revenue',
        data: analytics.profitAnalysis.monthlyProjection.map(p => p.revenue),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
      {
        label: 'Cost',
        data: analytics.profitAnalysis.monthlyProjection.map(p => p.cost),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Profit',
        data: analytics.profitAnalysis.monthlyProjection.map(p => p.profit),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  const priceTrendData = {
    labels: analytics.marketAnalysis.priceTrend.map(p => p.month),
    datasets: [{
      label: 'Price (₹/quintal)',
      data: analytics.marketAnalysis.priceTrend.map(p => p.price),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      tension: 0.4,
      fill: true,
    }],
  };

  const competitorData = {
    labels: analytics.marketAnalysis.competitorAnalysis.map(c => c.competitor),
    datasets: [{
      data: analytics.marketAnalysis.competitorAnalysis.map(c => c.marketShare),
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: 'white', font: { size: 12 } }
      },
    },
    scales: {
      y: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      x: {
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'seeds', label: 'Seeds & Inputs', icon: '🌱' },
    { id: 'machinery', label: 'Machinery', icon: '🚜' },
    { id: 'cost', label: 'Cost Analysis', icon: '💰' },
    { id: 'selling', label: 'Selling Platforms', icon: '🏪' },
    { id: 'valueAdd', label: 'Value Addition', icon: '🏭' },
    { id: 'videos', label: 'Tutorials', icon: '🎥' },
    { id: 'market', label: 'Market Analysis', icon: '📈' },
    { id: 'schemes', label: 'Government', icon: '🏛️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900">
      {/* 3D Background */}
      <div className="fixed inset-0 opacity-20">
        <Canvas camera={{ position: [0, 0, 15] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            return (
              <Sphere
                key={i}
                args={[0.3, 16, 16]}
                position={[
                  Math.cos(angle) * 6,
                  Math.sin(angle * 2) * 2,
                  Math.sin(angle) * 6,
                ]}
              >
                <MeshDistortMaterial
                  color={i % 2 === 0 ? '#10b981' : '#3b82f6'}
                  distort={0.3}
                  speed={1}
                />
              </Sphere>
            );
          })}
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
        </Canvas>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href={`/hybrid/${encodeURIComponent(cropName)}`}>
            <motion.button
              whileHover={{ x: -5 }}
              className="text-white/70 hover:text-white mb-6 flex items-center gap-2"
            >
              ← Back to Hybrids
            </motion.button>
          </Link>

          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-sky-400 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-5xl">📊</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">{hybridName}</h1>
              <p className="text-emerald-300 text-xl">{cropName} - Complete Business Analytics</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <QuickStatCard
            title="Yield per Acre"
            value={analytics.profitAnalysis.yieldPerAcre}
            icon="🌾"
            color="from-emerald-600 to-emerald-400"
          />
          <QuickStatCard
            title="Market Price"
            value={analytics.profitAnalysis.marketPrice}
            icon="💰"
            color="from-amber-600 to-amber-400"
          />
          <QuickStatCard
            title="Net Profit/Acre"
            value={`₹${analytics.profitAnalysis.netProfitPerAcre.toLocaleString()}`}
            icon="📈"
            color="from-blue-600 to-blue-400"
          />
          <QuickStatCard
            title="ROI"
            value={`${analytics.profitAnalysis.roi}%`}
            icon="⚡"
            color="from-purple-600 to-purple-400"
          />
        </div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto mb-8 pb-2">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Description */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-4">About {hybridName}</h2>
                  <p className="text-white/80 text-lg leading-relaxed">{analytics.description}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Total Investment"
                    value={`₹${analytics.costBreakdown.totalCost.toLocaleString()}`}
                    subtitle="per acre"
                    icon="💰"
                  />
                  <MetricCard
                    title="Expected Revenue"
                    value={`₹${analytics.profitAnalysis.revenuePerAcre.toLocaleString()}`}
                    subtitle="per acre"
                    icon="📊"
                  />
                  <MetricCard
                    title="Profit Margin"
                    value={`${analytics.profitAnalysis.profitMargin}%`}
                    subtitle="net profit"
                    icon="📈"
                  />
                </div>

                {/* Cost Breakdown Chart */}
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                  <h2 className="text-2xl font-bold text-white mb-6">Cost Breakdown</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="h-80">
                      <Pie data={costChartData} options={{
                        ...chartOptions,
                        plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
                      }} />
                    </div>
                    <div className="space-y-4">
                      {analytics.costBreakdown.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-white/70">{item.name}</span>
                          <div className="flex items-center gap-4">
                            <span className="text-white font-semibold">₹{item.cost.toLocaleString()}</span>
                            <span className="text-emerald-400 text-sm">{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-white/20 flex justify-between">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-white font-bold">₹{analytics.costBreakdown.totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Links to Other Sections */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <QuickLinkCard
                    title="Seed Sources"
                    count={analytics.seedSources.length}
                    icon="🌱"
                    onClick={() => setActiveTab('seeds')}
                  />
                  <QuickLinkCard
                    title="Machinery"
                    count={analytics.machinery.length}
                    icon="🚜"
                    onClick={() => setActiveTab('machinery')}
                  />
                  <QuickLinkCard
                    title="Selling Platforms"
                    count={analytics.sellingPlatforms.length}
                    icon="🏪"
                    onClick={() => setActiveTab('selling')}
                  />
                  <QuickLinkCard
                    title="Value Added Products"
                    count={analytics.valueAddedProducts.length}
                    icon="🏭"
                    onClick={() => setActiveTab('valueAdd')}
                  />
                </div>
              </div>
            )}

            {/* Seeds & Inputs Tab */}
            {activeTab === 'seeds' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🌱 Seed Sources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.seedSources.map((source, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{source.name}</h3>
                          <p className="text-emerald-300">{source.company}</p>
                        </div>
                        {source.certified && (
                          <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-sm">
                            Certified
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-white/60">Price:</span>
                          <span className="text-white font-semibold">{source.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Quantity:</span>
                          <span className="text-white">{source.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Rating:</span>
                          <span className="text-amber-400">{'★'.repeat(source.rating)}</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <a
                          href={source.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-emerald-600 transition-all"
                        >
                          Visit Website <FaExternalLinkAlt size={12} />
                        </a>
                        <a
                          href={`tel:${source.contact}`}
                          className="px-4 bg-white/10 text-white py-2 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all"
                        >
                          Call
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Machinery Tab */}
            {activeTab === 'machinery' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🚜 Required Machinery</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analytics.machinery.map((machine, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center text-2xl">
                          <FaTractor />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white">{machine.name}</h3>
                          <p className="text-white/70 text-sm mb-3">{machine.purpose}</p>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-white/50">Purchase Cost</p>
                              <p className="text-white font-semibold">{machine.cost}</p>
                            </div>
                            {machine.rentalAvailable && (
                              <div>
                                <p className="text-white/50">Rental Cost</p>
                                <p className="text-white font-semibold">{machine.rentalCost}/day</p>
                              </div>
                            )}
                          </div>

                          {machine.subsidyEligible && (
                            <div className="mt-3 bg-emerald-600/20 rounded-xl p-2">
                              <p className="text-emerald-300 text-sm">
                                ✨ Subsidy available: {machine.subsidyPercent}% off
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Selling Platforms Tab */}
            {activeTab === 'selling' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🏪 Selling Platforms</h2>
                
                {/* Online/Direct Platforms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.sellingPlatforms.filter(p => p.type === 'online' || p.type === 'direct').map((platform, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{platform.name}</h3>
                          <p className="text-emerald-300 text-sm">{platform.type.toUpperCase()}</p>
                        </div>
                        <span className="text-amber-400">{'★'.repeat(platform.rating)}</span>
                      </div>
                      
                      <p className="text-white/80 text-sm mb-4">{platform.description}</p>
                      
                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                          <span className="text-white/60">Commission:</span>
                          <span className="text-white">{platform.commission}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Payment Time:</span>
                          <span className="text-white">{platform.paymentTime}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Requirements:</p>
                        <ul className="space-y-1">
                          {platform.requirements.map((req, i) => (
                            <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                              <span className="text-emerald-400">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href={platform.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-sky-500 transition-all"
                      >
                        Visit Platform <FaExternalLinkAlt size={14} />
                      </a>
                    </motion.div>
                  ))}
                </div>

                {/* Hall Sell (Local Markets) */}
                {analytics.hallSell.available && (
                  <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <FaMapMarkerAlt className="text-emerald-400" />
                      Local Hall Sell Markets
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analytics.hallSell.locations.map((location, index) => (
                        <div key={index} className="bg-white/5 rounded-xl p-4">
                          <h4 className="text-lg font-semibold text-white mb-2">{location.marketName}</h4>
                          <p className="text-white/70 text-sm mb-1">{location.city}</p>
                          <p className="text-white/70 text-sm mb-3">{location.address}</p>
                          
                          <div className="space-y-1 text-sm mb-3">
                            <p className="text-white/60">⏰ {location.timings}</p>
                            <p className="text-white/60">📞 {location.contact}</p>
                            <p className="text-emerald-400">Avg Price: {location.avgPrice}</p>
                          </div>

                          <div className="flex gap-2">
                            <a
                              href={location.mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 bg-emerald-600/20 text-emerald-300 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-emerald-600/30"
                            >
                              View Map
                            </a>
                            <a
                              href={`tel:${location.contact}`}
                              className="px-4 bg-white/10 text-white py-2 rounded-xl text-sm font-semibold hover:bg-white/20"
                            >
                              Call
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Selling Process</h4>
                        <ol className="space-y-2">
                          {analytics.hallSell.process.map((step, i) => (
                            <li key={i} className="text-white/80 text-sm flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">{i+1}.</span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Required Documents</h4>
                        <ul className="space-y-2">
                          {analytics.hallSell.documents.map((doc, i) => (
                            <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                              <span className="text-emerald-400">✓</span>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Value Addition Tab */}
            {activeTab === 'valueAdd' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🏭 Value Added Products</h2>
                
                {analytics.valueAddedProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20"
                  >
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-white mb-3">{product.name}</h3>
                        <p className="text-white/80 mb-4">{product.description}</p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-emerald-300 text-sm">Estimated Cost</p>
                            <p className="text-white font-semibold">{product.estimatedCost}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-emerald-300 text-sm">Selling Price</p>
                            <p className="text-white font-semibold">{product.sellingPrice}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-emerald-300 text-sm">Profit Margin</p>
                            <p className="text-white font-semibold">{product.profitMargin}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-emerald-300 text-sm">Market Demand</p>
                            <p className="text-white font-semibold">{product.marketDemand}</p>
                          </div>
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2">Required Equipment</h4>
                        <ul className="grid grid-cols-2 gap-2 mb-4">
                          {product.requiredEquipment.map((eq, i) => (
                            <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                              <span className="text-emerald-400">⚙️</span>
                              {eq}
                            </li>
                          ))}
                        </ul>

                        <h4 className="text-lg font-semibold text-white mb-2">Equipment Sources</h4>
                        <div className="space-y-2">
                          {product.sourceForEquipment.map((source, i) => (
                            <a
                              key={i}
                              href={source.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between bg-white/5 hover:bg-white/10 p-3 rounded-xl transition-all"
                            >
                              <span className="text-white">{source.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-emerald-300 text-sm">{source.price}</span>
                                <FaExternalLinkAlt className="text-white/50" size={12} />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>

                      <div className="lg:w-96">
                        <h4 className="text-lg font-semibold text-white mb-4">Video Tutorials</h4>
                        <div className="space-y-4">
                          {product.videoTutorials.map((video, i) => (
                            <a
                              key={i}
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <FaYoutube className="text-red-500 text-2xl flex-shrink-0" />
                                <div>
                                  <p className="text-white font-medium text-sm">{video.title}</p>
                                  <p className="text-white/50 text-xs mt-1">{video.duration}</p>
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Video Tutorials Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🎥 Video Tutorials</h2>
                
                {analytics.videoTutorials.map((category, idx) => (
                  <div key={idx} className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6">{category.category}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.videos.map((video, i) => (
                        <motion.a
                          key={i}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="group block"
                        >
                          <div className="relative overflow-hidden rounded-xl">
                            {video.thumbnail ? (
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gradient-to-br from-emerald-600 to-sky-600 flex items-center justify-center">
                                <FaYoutube className="text-white text-6xl opacity-50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-white ml-1" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <h4 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                              {video.title}
                            </h4>
                            <p className="text-white/50 text-sm">{video.channel}</p>
                            <p className="text-white/70 text-sm mt-1 line-clamp-2">{video.description}</p>
                          </div>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Market Analysis Tab */}
            {activeTab === 'market' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">📈 Market Analysis</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Demand Trend */}
                  <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">Current Demand</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">
                        {analytics.marketAnalysis.demandTrend === 'increasing' ? '📈' : 
                         analytics.marketAnalysis.demandTrend === 'stable' ? '📊' : '📉'}
                      </span>
                      <div>
                        <p className="text-white text-lg">{analytics.marketAnalysis.currentDemand}</p>
                        <p className="text-emerald-300">Trend: {analytics.marketAnalysis.demandTrend}</p>
                      </div>
                    </div>
                  </div>

                  {/* Export Potential */}
                  <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">Export Potential</h3>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {analytics.marketAnalysis.exportPotential.countries.map((country, i) => (
                          <span key={i} className="bg-emerald-600/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                            {country}
                          </span>
                        ))}
                      </div>
                      <p className="text-white/80">Export Price: {analytics.marketAnalysis.exportPotential.price}</p>
                    </div>
                  </div>

                  {/* Price Trend Chart */}
                  <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">Price Trend (Last 6 Months)</h3>
                    <div className="h-80">
                      <Line data={priceTrendData} options={chartOptions} />
                    </div>
                  </div>

                  {/* Competitor Analysis */}
                  <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">Competitor Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64">
                        <Doughnut data={competitorData} options={{
                          ...chartOptions,
                          plugins: { legend: { position: 'bottom', labels: { color: 'white' } } }
                        }} />
                      </div>
                      <div className="space-y-4">
                        {analytics.marketAnalysis.competitorAnalysis.map((comp, i) => (
                          <div key={i} className="bg-white/5 rounded-xl p-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-white font-semibold">{comp.competitor}</span>
                              <span className="text-emerald-300">{comp.price}</span>
                            </div>
                            <p className="text-white/70 text-sm">Market Share: {comp.marketShare}%</p>
                            <div className="mt-2">
                              <p className="text-white/50 text-xs">Strengths:</p>
                              <ul className="list-disc list-inside">
                                {comp.strengths.map((s, idx) => (
                                  <li key={idx} className="text-white/70 text-xs">{s}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Export Requirements */}
                  <div className="lg:col-span-2 backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                    <h3 className="text-xl font-semibold text-white mb-4">Export Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.marketAnalysis.exportPotential.requirements.map((req, i) => (
                        <div key={i} className="bg-white/5 rounded-xl p-3">
                          <p className="text-white">{req}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Government Schemes Tab */}
            {activeTab === 'schemes' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-white mb-6">🏛️ Government Schemes</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analytics.governmentSchemes.map((scheme, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20"
                    >
                      <h3 className="text-xl font-bold text-white mb-3">{scheme.name}</h3>
                      <p className="text-white/80 text-sm mb-4">{scheme.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Benefit:</span>
                          <span className="text-emerald-300 font-semibold">{scheme.benefit}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-white/60">Eligibility:</span>
                          <p className="text-white/80 mt-1">{scheme.eligibility}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-white/60 text-sm mb-2">Required Documents:</p>
                        <ul className="space-y-1">
                          {scheme.documents.map((doc, i) => (
                            <li key={i} className="text-white/80 text-sm flex items-center gap-2">
                              <span className="text-emerald-400">📄</span>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <a
                        href={scheme.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-emerald-500 hover:to-sky-500 transition-all"
                      >
                        Apply Now <FaExternalLinkAlt size={14} />
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper Components
function QuickStatCard({ title, value, icon, color }: { title: string; value: string; icon: string; color: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`backdrop-blur-xl bg-gradient-to-br ${color}/20 rounded-2xl p-6 border border-white/10`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <p className="text-white/70 text-sm">{title}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </motion.div>
  );
}

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: string }) {
  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-white/80">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-white/50 text-sm">{subtitle}</p>
    </div>
  );
}

function QuickLinkCard({ title, count, icon, onClick }: { title: string; count: number; icon: string; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-left hover:bg-white/20 transition-all"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-emerald-300 text-sm">{count} items</p>
    </motion.button>
  );
}