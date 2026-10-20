// types/crop.ts

export interface Crop {
  name: string;
  hybrid: string;
  irrigation: string;
  water: string;
  yield: string;
  profit: string;
  reason: string;
}

export interface CropItem {
  name: string;
  bestHybrid: string;
  irrigation: string;
  waterRequirement: string;
  yield: string;
  profit: string;
  reason: string;
}

export interface StructuredRecommendation {
  fieldCrops: CropItem[];
  vegetables: CropItem[];
  fruitTrees: CropItem[];
  floweringPlants: CropItem[];
}

export interface RecommendationResponse {
  success: boolean;
  location: string;
  weather: {
    temperature: number;
    humidity: number;
  };
  recommendation: StructuredRecommendation;
  error?: string;
}