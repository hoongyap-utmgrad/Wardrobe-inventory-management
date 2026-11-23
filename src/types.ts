export type ClothingCategory =
  | 'Tops'
  | 'Bottoms'
  | 'Outerwear'
  | 'One-Piece'
  | 'Footwear'
  | 'Accessories';

export type ClothingStatus = 'AVAILABLE' | 'WORN_UNAVAILABLE' | 'IN_LAUNDRY';

export type FormalityLevel = 'Casual' | 'Smart Casual' | 'Formal' | 'Sporty';

export type SeasonType = 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All Season';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory?: string;
  color: string;
  photoUrl: string; // Base64 data string or default preset URL
  season: SeasonType[];
  formality: FormalityLevel;
  status: ClothingStatus;
  timesWorn: number;
  lastWornDate: string | null; // ISO timestamp
  addedAt: string; // ISO timestamp
  notes?: string;
  brand?: string;
}

export interface WeatherInfo {
  temperature: number; // °C
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rainy' | 'Chilly' | 'Cold & Snowy' | 'Hot & Humid';
  locationName: string;
  summary: string;
  humidity?: number;
  windSpeed?: number;
}

export interface WearLogEntry {
  id: string;
  date: string; // ISO string
  itemIds: string[];
  outfitName?: string;
  weather: WeatherInfo;
  vibe?: string;
  notes?: string;
}

export interface OutfitSuggestion {
  title: string;
  itemIds: string[];
  matchScore: number;
  weatherSuitability: string;
  aiAdvice: string;
  vibe: string;
}

export type CategoryCountMap = Record<ClothingCategory, number>;

export type AppView =
  | 'onboarding'
  | 'closet'
  | 'stylist'
  | 'log_fit'
  | 'laundry'
  | 'stats'
  | 'add_item';
