// components/CropSection.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { RecommendationResponse, CropItem } from "@/types/crop";

interface Crop {
  name: string;
  hybrid: string;
  irrigation: string;
  water: string;
  yield: string;
  profit: string;
  reason: string;
}

interface Props {
  data: RecommendationResponse;
  selectedCategory: string;
  onBack: () => void;
}

// Map category id → recommendation key
const CATEGORY_KEY: Record<
  string,
  keyof RecommendationResponse["recommendation"]
> = {
  field: "fieldCrops",
  veg: "vegetables",
  fruit: "fruitTrees",
  flower: "floweringPlants",
};

// Convert CropItem → Crop (for UI)
function toCrop(item: CropItem): Crop {
  return {
    name: item.name,
    hybrid: item.bestHybrid,
    irrigation: item.irrigation,
    water: item.waterRequirement,
    yield: item.yield,
    profit: item.profit,
    reason: item.reason,
  };
}

export default function CropSections({
  data,
  selectedCategory,
  onBack,
}: Props) {
  const router = useRouter();
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const key = CATEGORY_KEY[selectedCategory];
  const rawItems: CropItem[] =
    (key && data.recommendation?.[key]) || [];
  const currentCrops: Crop[] = rawItems.map(toCrop);

  const category = (() => {
    switch (selectedCategory) {
      case "field":
        return {
          title: "Field Crops",
          icon: "🌾",
          color: "from-amber-500/20 to-orange-500/20",
        };
      case "veg":
        return {
          title: "Vegetables",
          icon: "🥬",
          color: "from-emerald-500/20 to-green-500/20",
        };
      case "fruit":
        return {
          title: "Fruit Trees",
          icon: "🍎",
          color: "from-red-500/20 to-rose-500/20",
        };
      case "flower":
        return {
          title: "Flowering Plants",
          icon: "🌸",
          color: "from-purple-500/20 to-pink-500/20",
        };
      default:
        return { title: "", icon: "", color: "" };
    }
  })();

  const handleViewActivity = (crop: Crop) => {
    setSelectedCrop(crop);
    setActiveModal(selectedCategory);
  };

  const handleViewHybrid = (crop: Crop) => {
    router.push(
      `/hybrid/${encodeURIComponent(crop.name)}?hybrid=${encodeURIComponent(
        crop.hybrid
      )}`
    );
  };

  const handleBusinessAnalytics = (crop: Crop) => {
    router.push(
      `/hybrid-business/${encodeURIComponent(
        crop.name
      )}/${encodeURIComponent(crop.hybrid)}`
    );
  };

  // ✅ Empty state — instead of returning null
  if (!currentCrops.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md text-center">
          <div className="text-6xl mb-4">{category.icon || "🌱"}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No recommendations available
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't load {category.title || "this category"} data right now.
            Please try again.
          </p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            ← Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Weather Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-40 max-w-md mx-auto mb-8 px-4"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-bold text-gray-800">{data.location}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Temp</p>
                <p className="font-bold text-emerald-600">
                  {data.weather.temperature}°C
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Humidity</p>
                <p className="font-bold text-sky-600">
                  {data.weather.humidity}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <section className="relative py-12 px-4 md:px-8 overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-30 blur-3xl`}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="mb-12">
            <motion.button
              onClick={onBack}
              whileHover={{ x: -5 }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Back to Categories
            </motion.button>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">{category.icon}</span>
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                  {category.title}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentCrops.length} varieties available for your region
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {currentCrops.map((crop, index) => (
              <motion.div
                key={`${crop.name}-${index}`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-sky-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />

                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-sky-200/30 rounded-full blur-2xl" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() =>
                        setExpandedCard(
                          expandedCard === crop.name ? null : crop.name
                        )
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedCard === crop.name ? "▼" : "▶"}
                    </motion.button>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {crop.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {crop.reason}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-emerald-600">Profit</p>
                      <p className="text-lg font-bold text-emerald-700 truncate">
                        {crop.profit}
                      </p>
                    </div>
                    <div className="bg-sky-50 rounded-xl p-3">
                      <p className="text-xs text-sky-600">Yield</p>
                      <p className="text-lg font-bold text-sky-700 truncate">
                        {crop.yield}
                      </p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedCard === crop.name && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="pt-4 border-t border-gray-200 space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Hybrid</p>
                              <p className="font-medium text-gray-800">
                                {crop.hybrid}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Irrigation</p>
                              <p className="font-medium text-gray-800">
                                {crop.irrigation}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Water</p>
                              <p className="font-medium text-gray-800">
                                {crop.water}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-3 gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewActivity(crop)}
                      className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-emerald-500/30 transition-all flex flex-col items-center"
                    >
                      <span className="text-lg mb-1">📋</span>
                      <span>Activity</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewHybrid(crop)}
                      className="bg-white border-2 border-emerald-600 text-emerald-600 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition-all flex flex-col items-center"
                    >
                      <span className="text-lg mb-1">🌱</span>
                      <span>Hybrid</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBusinessAnalytics(crop)}
                      className="bg-gradient-to-br from-amber-600 to-orange-600 text-white py-2 rounded-xl text-xs font-semibold shadow-lg hover:shadow-amber-500/30 transition-all flex flex-col items-center"
                    >
                      <span className="text-lg mb-1">📊</span>
                      <span>Business</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity Modal */}
        <AnimatePresence>
          {activeModal && selectedCrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setActiveModal(null)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-sky-600 p-8 relative">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {selectedCrop.name}
                  </h2>
                  <p className="text-emerald-100">{selectedCrop.reason}</p>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-emerald-50 rounded-2xl p-4">
                      <p className="text-sm text-emerald-600 mb-1">Hybrid</p>
                      <p className="text-xl font-bold text-gray-800">
                        {selectedCrop.hybrid}
                      </p>
                    </div>
                    <div className="bg-sky-50 rounded-2xl p-4">
                      <p className="text-sm text-sky-600 mb-1">Irrigation</p>
                      <p className="text-xl font-bold text-gray-800">
                        {selectedCrop.irrigation}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4">
                      <p className="text-sm text-amber-600 mb-1">Water</p>
                      <p className="text-xl font-bold text-gray-800">
                        {selectedCrop.water}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-2xl p-4">
                      <p className="text-sm text-purple-600 mb-1">Yield</p>
                      <p className="text-xl font-bold text-gray-800">
                        {selectedCrop.yield}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                    <p className="text-2xl font-bold text-emerald-600 mb-2">
                      💰 {selectedCrop.profit}
                    </p>
                    <p className="text-gray-600">Estimated Profit per Acre</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        handleViewHybrid(selectedCrop);
                        setActiveModal(null);
                      }}
                      className="bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow"
                    >
                      View Hybrid Details
                    </button>

                    <button
                      onClick={() => {
                        handleBusinessAnalytics(selectedCrop);
                        setActiveModal(null);
                      }}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow"
                    >
                      Business Analytics
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}