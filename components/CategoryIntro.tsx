// components/CategoryIntro.tsx
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  onCategorySelect: (category: string) => void;
  location: string;
  weather: {
    temperature: number;
    humidity: number;
  };
}

const categories = [
  {
    id: "field",
    title: "Field Crops",
    icon: "🌾",
    description: "High-yield staple crops optimized for your region",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "veg",
    title: "Vegetables",
    icon: "🥬",
    description: "Nutrient-rich vegetables with quick harvest cycles",
    color: "from-emerald-500 to-green-500",
  },
  {
    id: "fruit",
    title: "Fruit Trees",
    icon: "🍎",
    description: "Perennial fruits for sustainable long-term income",
    color: "from-red-500 to-rose-500",
  },
  {
    id: "flower",
    title: "Flowering Plants",
    icon: "🌸",
    description: "Ornamental flowers with high market value",
    color: "from-purple-500 to-pink-500",
  },
];

export default function CategoryIntro({ onCategorySelect, location, weather }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-sky-50 overflow-hidden">
      <div className="relative max-w-6xl mx-auto px-4 py-20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center"
        >
          {/* Welcome Header */}
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">
                Welcome to Smart Farming
              </span>
            </h1>
            
            {/* Location Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">📍</span>
                <span className="font-medium text-gray-700">{location}</span>
              </div>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-semibold">{weather.temperature}°C</span>
                <span className="text-sky-600 font-semibold">{weather.humidity}%</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Choose a category to explore AI-powered crop recommendations
          </motion.p>

          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                whileHover={{ y: -10, scale: 1.05 }}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => onCategorySelect(category.id)}
                className="relative group cursor-pointer"
              >
                {/* Glow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur" />
                
                {/* Card */}
                <div className={`relative bg-white rounded-3xl p-8 shadow-xl overflow-hidden transition-all duration-300 ${
                  hoveredIndex === index ? 'ring-4 ring-emerald-500 ring-offset-4' : ''
                }`}>
                  {/* Background Gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} rounded-full blur-3xl opacity-30`} />
                  
                  {/* Icon */}
                  <div className="text-7xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{category.title}</h3>
                  
                  {/* Description */}
                  <p className="text-gray-600">{category.description}</p>
                  
                  {/* Explore Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileHover={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <span className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                      Explore {category.icon}
                      <span className="text-lg">→</span>
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-sm text-gray-500"
          >
            🌱 AI-powered recommendations based on your local weather and soil conditions
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}