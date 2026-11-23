import React, { useState, useEffect } from 'react';
import {
  ClothingItem,
  WeatherInfo,
  OutfitSuggestion,
} from '../types';
import { PRESET_WEATHER_PROFILES } from '../data/defaultData';
import {
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Sparkles,
  Check,
  Zap,
  Shirt,
  Compass,
  Thermometer,
  Wand2,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface OutfitStylistViewProps {
  items: ClothingItem[];
  currentWeather: WeatherInfo;
  onWeatherChange: (weather: WeatherInfo) => void;
  onWearOutfit: (outfitItems: ClothingItem[], outfitName: string, vibe: string) => void;
}

export const OutfitStylistView: React.FC<OutfitStylistViewProps> = ({
  items,
  currentWeather,
  onWeatherChange,
  onWearOutfit,
}) => {
  const [selectedVibe, setSelectedVibe] = useState<string>('Casual Everyday');
  const [suggestions, setSuggestions] = useState<OutfitSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [wornToast, setWornToast] = useState<string | null>(null);

  const vibes = [
    'Casual Everyday',
    'Smart Work & Office',
    'Sporty & Active',
    'Evening Out',
    'Cozy Lounge',
  ];

  const availableItems = items.filter((i) => i.status === 'AVAILABLE');

  // Trigger auto AI suggestion on initial view load or weather/vibe change
  useEffect(() => {
    generateOutfits();
  }, [currentWeather, selectedVibe, items.length]);

  const generateOutfits = async () => {
    if (availableItems.length === 0) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: availableItems,
          weather: currentWeather,
          vibe: selectedVibe,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.suggestions && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      }
    } catch (err) {
      console.warn('Stylist suggestion error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWearOutfitClick = (sug: OutfitSuggestion) => {
    // Map itemIds to actual ClothingItem objects
    const outfitGarments = items.filter((i) => sug.itemIds.includes(i.id));
    if (outfitGarments.length === 0) return;

    onWearOutfit(outfitGarments, sug.title, sug.vibe);
    setWornToast(`Logged "${sug.title}"! Selected garments marked as unavailable.`);
    setTimeout(() => setWornToast(null), 4000);
  };

  const getWeatherIcon = (cond: string) => {
    if (cond.includes('Rain')) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (cond.includes('Cold') || cond.includes('Snow'))
      return <Snowflake className="w-5 h-5 text-cyan-500" />;
    if (cond.includes('Wind') || cond.includes('Chilly'))
      return <Wind className="w-5 h-5 text-teal-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert */}
      {wornToast && (
        <div className="bg-emerald-600 text-white p-3 rounded-2xl text-xs font-semibold shadow-xl flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" />
            {wornToast}
          </span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" /> AI Outfit Stylist
        </h1>
        <p className="text-xs text-slate-500">
          Smart outfit combinations matched with weather &amp; item availability
        </p>
      </div>

      {/* Weather Selector Bar */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-4 shadow-xl border border-indigo-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur">
              {getWeatherIcon(currentWeather.condition)}
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-200">
                <Compass className="w-3.5 h-3.5" />
                <span className="font-semibold">{currentWeather.locationName}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black">{currentWeather.temperature}°C</span>
                <span className="text-xs font-semibold text-indigo-300">
                  {currentWeather.condition}
                </span>
              </div>
            </div>
          </div>

          <span className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
            {currentWeather.summary}
          </span>
        </div>

        {/* Quick Weather Preset Switcher */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-indigo-300 font-medium shrink-0">Weather:</span>
          {PRESET_WEATHER_PROFILES.map((wp) => (
            <button
              key={wp.locationName}
              onClick={() => onWeatherChange(wp)}
              className={`px-2.5 py-1 rounded-xl whitespace-nowrap transition-all ${
                currentWeather.locationName === wp.locationName
                  ? 'bg-indigo-600 text-white font-bold shadow'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {wp.condition} ({wp.temperature}°C)
            </button>
          ))}
        </div>
      </div>

      {/* Vibe Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-600 block">Style Vibe / Occasion</label>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
          {vibes.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVibe(v)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedVibe === v
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Warning */}
      {availableItems.length < 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Most clothes are worn or in laundry!</p>
            <p className="text-amber-700 mt-0.5">
              Only {availableItems.length} items available. Go to Laundry Room to wash items or add
              new clothes to unlock full outfit recommendations.
            </p>
          </div>
        </div>
      )}

      {/* Generate Refresh Button */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          Recommended Outfits ({suggestions.length})
        </span>
        <button
          onClick={generateOutfits}
          disabled={isLoading || availableItems.length === 0}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Styling...' : 'Re-Generate AI Fits'}
        </button>
      </div>

      {/* Outfit Suggestions Cards List */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <Wand2 className="w-8 h-8 text-indigo-600 animate-bounce mx-auto" />
          <p className="font-bold text-sm text-slate-800">Gemini AI is crafting outfit ideas...</p>
          <p className="text-xs text-slate-400">
            Matching available clothes with {currentWeather.temperature}°C {currentWeather.condition} weather
          </p>
        </div>
      ) : suggestions.length === 0 ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center space-y-2">
          <Shirt className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm text-slate-700">No suggestions available</p>
          <p className="text-xs text-slate-400">
            Make sure you have available clothes in your closet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {suggestions.map((sug, idx) => {
            const outfitGarments = items.filter((i) => sug.itemIds.includes(i.id));

            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-3 hover:border-indigo-300 transition-all"
              >
                {/* Title & Score */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{sug.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {sug.matchScore}% Match
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {sug.weatherSuitability}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                    {sug.vibe}
                  </span>
                </div>

                {/* Items Row Thumbnails */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  {outfitGarments.map((garment) => (
                    <div
                      key={garment.id}
                      className="bg-white p-2 rounded-xl border border-slate-200/80 flex flex-col items-center text-center shadow-2xs"
                    >
                      <img
                        src={garment.photoUrl}
                        alt={garment.name}
                        className="w-12 h-12 object-contain mb-1"
                      />
                      <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                        {garment.name}
                      </span>
                      <span className="text-[9px] text-slate-400">{garment.category}</span>
                    </div>
                  ))}
                </div>

                {/* AI Stylist Note */}
                <div className="bg-indigo-50/70 border border-indigo-100 p-3 rounded-2xl text-xs text-indigo-950 space-y-1">
                  <span className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Stylist Note:
                  </span>
                  <p className="text-slate-700 text-[11px] leading-relaxed">{sug.aiAdvice}</p>
                </div>

                {/* Wear Today 1-Click Action */}
                <button
                  onClick={() => handleWearOutfitClick(sug)}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Check className="w-4 h-4" /> Wear Today (Mark Garments Unavailable)
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
