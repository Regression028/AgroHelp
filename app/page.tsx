// app/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import Loader from "../components/Loader";
import CategoryIntro from "../components/CategoryIntro";
import CropSections from "../components/CropSection";
import { RecommendationResponse } from "@/types/crop";

type Stage = "loading" | "categories" | "details";

interface CachedData {
  data: RecommendationResponse;
  timestamp: number;
  location: { lat: number; lon: number };
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const CACHE_KEY = "crop_recommendation_cache";

export default function Home() {
  const [stage, setStage] = useState<Stage>("loading");
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const timeout1 = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for cached data first
    const cached = checkCache();
    
    if (cached) {
      // Use cached data directly
      console.log("Using cached data from", new Date(cached.timestamp).toLocaleString());
      setData(cached.data);
      setStage("categories"); // Directly go to categories
    } else {
      // No cache - show location prompt
      setShowLocationPrompt(true);
    }

    return () => {
      if (timeout1.current) clearTimeout(timeout1.current);
    };
  }, []);

  // Check if we have valid cached data
  const checkCache = (): CachedData | null => {
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (!cachedStr) return null;

      const cached: CachedData = JSON.parse(cachedStr);
      const now = Date.now();

      if (now - cached.timestamp < CACHE_DURATION) {
        return cached;
      } else {
        console.log("Cache expired");
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  // Request location permission
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsRequestingLocation(true);
    setShowLocationPrompt(false);

    console.log("Requesting location permission...");
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Location permission granted");
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        await fetchRecommendation(lat, lon);
        setIsRequestingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsRequestingLocation(false);
        
        if (error.code === 1) {
          setError(
            "Location access is needed for personalized recommendations. " +
            "Please enable location access in your browser settings and refresh the page."
          );
        } else if (error.code === 2) {
          setError("Location information is unavailable. Please try again.");
        } else if (error.code === 3) {
          setError("Location request timed out. Please try again.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Use default location
  const useDefaultLocation = async () => {
    setIsRequestingLocation(true);
    setShowLocationPrompt(false);
    
    const defaultLat = 18.5204;
    const defaultLon = 73.8567;
    
    await fetchRecommendation(defaultLat, defaultLon);
    setIsRequestingLocation(false);
  };

  // Save data to cache
  const saveToCache = (data: RecommendationResponse, lat: number, lon: number) => {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now(),
        location: { lat, lon }
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log("Data cached for 30 minutes");
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  const fetchRecommendation = async (lat: number, lon: number) => {
    try {
      console.log("Fetching recommendation for location:", lat, lon);
      
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });

      if (!res.ok) throw new Error("API response not ok");

      const result: RecommendationResponse = await res.json();
      if (!result.success) throw new Error(result.error || "Failed");

      setData(result);
      
      // Save to cache
      saveToCache(result, lat, lon);

      timeout1.current = setTimeout(() => {
        setStage("categories");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch advisory");
      setIsRequestingLocation(false);
    }
  };

  // Handle category click from CategoryIntro
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStage("details");
  };

  // Handle back to categories
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setStage("categories");
  };

  // Manual retry function
  const handleRetry = () => {
    setError(null);
    requestLocation();
  };

  // Manual refresh function
  const refreshData = () => {
    localStorage.removeItem(CACHE_KEY);
    window.location.reload();
  };

  // Location Permission Prompt UI
  if (showLocationPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/60 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-sky-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl">📍</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Enable Location Access</h2>
          
          <p className="text-gray-600 mb-8">
            To provide you with accurate crop recommendations based on your local weather and soil conditions, we need your location.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={requestLocation}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg transition-all hover:scale-[1.02]"
            >
              Allow Location Access
            </button>
            
            <button
              onClick={useDefaultLocation}
              className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Use Default Location Instead
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-6">
            Your location is only used to fetch weather data and is not stored permanently.
          </p>
        </div>
      </div>
    );
  }

  // Error UI with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/60 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state while requesting location
  if (isRequestingLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            <div className="absolute inset-3 border-4 border-sky-200 border-b-sky-600 rounded-full animate-spin animation-delay-150" />
          </div>
          <p className="text-xl text-gray-700 font-medium mb-2">Getting your location...</p>
          <p className="text-sm text-gray-500">Please allow location access when prompted</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50">
      {stage === "loading" && <Loader />}
      
      {stage === "categories" && data && (
        <CategoryIntro 
          onCategorySelect={handleCategorySelect}
          location={data.location}
          weather={data.weather}
        />
      )}
      
      {stage === "details" && data && selectedCategory && (
        <CropSections 
          data={data} 
          selectedCategory={selectedCategory}
          onBack={handleBackToCategories}
        />
      )}
      
      {/* Development refresh button */}
      {process.env.NODE_ENV === "development" && stage !== "loading" && (
        <button
          onClick={refreshData}
          className="fixed bottom-4 right-4 text-xs bg-white/80 backdrop-blur px-3 py-2 rounded-full shadow-lg hover:bg-white transition-colors z-50"
        >
          ↻ Clear Cache & Refresh
        </button>
      )}
    </main>
  );
}