import React, { useState, useMemo } from 'react';
import { ClothingItem, WeatherInfo, AppView } from '../types';
import { checkOutfitWeatherSuitability, WeatherSuitabilityCheck } from '../utils/weatherSuitability';
import {
  Check,
  Calendar,
  CheckCircle2,
  Shirt,
  Sparkles,
  Plus,
  X,
  AlertCircle,
  AlertTriangle,
  Tag,
  Thermometer,
  CloudSun,
  ShieldAlert,
  Compass,
} from 'lucide-react';

interface LogFitViewProps {
  items: ClothingItem[];
  currentWeather: WeatherInfo;
  onLogCustomOutfit: (
    selectedItems: ClothingItem[],
    outfitName: string,
    notes: string
  ) => void;
  onNavigate?: (view: AppView) => void;
  onOpenWeatherPicker?: () => void;
}

export const LogFitView: React.FC<LogFitViewProps> = ({
  items,
  currentWeather,
  onLogCustomOutfit,
  onNavigate,
  onOpenWeatherPicker,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState<string>('Daily Outfit');
  const [notes, setNotes] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const availableItems = items.filter((i) => i.status === 'AVAILABLE');

  const toggleItemSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedGarments = useMemo(
    () => items.filter((i) => selectedIds.includes(i.id)),
    [items, selectedIds]
  );

  // Live weather check
  const weatherSuitability: WeatherSuitabilityCheck | null = useMemo(() => {
    if (selectedGarments.length === 0) return null;
    return checkOutfitWeatherSuitability(selectedGarments, currentWeather);
  }, [selectedGarments, currentWeather]);

  const handleProceedLog = () => {
    onLogCustomOutfit(selectedGarments, outfitName || 'Custom Outfit', notes);
    setSelectedIds([]);
    setOutfitName('Daily Outfit');
    setNotes('');
    setShowWarningModal(false);
    setSuccessToast(`Logged "${outfitName || 'Custom Outfit'}"! Usage count updated.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGarments.length === 0) {
      alert('Please select at least one garment worn today.');
      return;
    }

    // Check if weather is inappropriate
    if (weatherSuitability && !weatherSuitability.isAppropriate) {
      setShowWarningModal(true);
      return;
    }

    handleProceedLog();
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Alert */}
      {successToast && (
        <div className="bg-emerald-600 text-white p-3 rounded-2xl text-xs font-semibold shadow-xl flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" /> {successToast}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Log Outfit Worn</h1>
          <p className="text-xs text-slate-500">
            Select what you wore today to track wear frequency &amp; weather suitability
          </p>
        </div>

        {onOpenWeatherPicker && (
          <button
            type="button"
            onClick={onOpenWeatherPicker}
            className="flex items-center gap-1 text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>{currentWeather.temperature}°C</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Outfit Name & Details Box */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Outfit Title / Description
            </label>
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="e.g. Tuesday Office Outfit, Casual Walk Fit"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-indigo-600" /> Today (
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-500" />
              {currentWeather.locationName}: {currentWeather.temperature}°C {currentWeather.condition}
            </span>
          </div>
        </div>

        {/* Live Weather Suitability Inspector Banner */}
        {weatherSuitability && (
          <div
            className={`rounded-3xl p-3.5 border transition-all ${
              weatherSuitability.severity === 'severe_warning'
                ? 'bg-rose-50 border-rose-200 text-rose-950 shadow-sm'
                : weatherSuitability.severity === 'mild_warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950 shadow-sm'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                {weatherSuitability.severity === 'severe_warning' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : weatherSuitability.severity === 'mild_warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs leading-tight">{weatherSuitability.title}</h4>
                  <p className="text-[11px] opacity-90 mt-0.5">{weatherSuitability.summary}</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                  weatherSuitability.severity === 'severe_warning'
                    ? 'bg-rose-200 text-rose-800'
                    : weatherSuitability.severity === 'mild_warning'
                    ? 'bg-amber-200 text-amber-800'
                    : 'bg-emerald-200 text-emerald-800'
                }`}
              >
                {weatherSuitability.score}% Match
              </span>
            </div>

            {weatherSuitability.reasons.length > 0 && (
              <div className="mt-2 pt-2 border-t border-black/5 text-[11px] space-y-1">
                {weatherSuitability.reasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-1 font-medium">
                    <span className="font-bold">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Selected Items Summary Preview */}
        {selectedGarments.length > 0 && (
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-3xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900">
                Selected Garments ({selectedGarments.length})
              </span>
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-indigo-600 font-medium hover:underline text-[11px]"
              >
                Clear selection
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {selectedGarments.map((g) => (
                <div
                  key={g.id}
                  className="bg-white p-2 rounded-xl border border-indigo-200 flex flex-col items-center text-center relative shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleItemSelect(g.id)}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full bg-slate-200 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[10px] text-slate-600"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                  <img src={g.photoUrl} alt={g.name} className="w-10 h-10 object-contain mb-1" />
                  <span className="text-[10px] font-bold text-slate-800 line-clamp-1">
                    {g.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Garment Selector List */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            Tap Available Clothes Worn Today ({availableItems.length} available)
          </label>

          {availableItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 space-y-1">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-bold text-xs text-slate-800">No clean garments available</p>
              <p className="text-[11px] text-slate-500">
                Wash worn clothes in the Laundry tab to log new outfits.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {availableItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItemSelect(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-[1.02]'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl p-1 shrink-0 flex items-center justify-center ${
                        isSelected ? 'bg-white/20' : 'bg-slate-100'
                      }`}
                    >
                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`font-bold text-xs truncate ${
                          isSelected ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </p>
                      <p
                        className={`text-[10px] ${
                          isSelected ? 'text-indigo-200' : 'text-slate-400'
                        }`}
                      >
                        {item.color} • {item.category}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-white text-indigo-600 border-white'
                          : 'border-slate-300 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={selectedIds.length === 0}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl text-xs shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" /> Save Outfit &amp; Update Usage ({selectedIds.length}{' '}
          Items)
        </button>
      </form>

      {/* Inappropriate Weather Warning Confirmation Modal */}
      {showWarningModal && weatherSuitability && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-base text-slate-900">Weather Mismatch Warning</h3>
              <p className="text-xs text-slate-500 mt-1">
                Current weather is{' '}
                <span className="font-bold text-indigo-600">
                  {currentWeather.temperature}°C {currentWeather.condition}
                </span>{' '}
                in {currentWeather.locationName}.
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                Identified Conflicts:
              </span>
              <ul className="space-y-1 text-[11px]">
                {weatherSuitability.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-600">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {weatherSuitability.recommendations.length > 0 && (
              <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold block text-[11px] uppercase tracking-wider text-indigo-700">
                  Suggested Fix:
                </span>
                <p className="text-[11px] text-indigo-800">
                  {weatherSuitability.recommendations[0]}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-1">
              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    onNavigate('stylist');
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Get AI Stylist Recommendations
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowWarningModal(false)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Adjust Items
                </button>
                <button
                  type="button"
                  onClick={handleProceedLog}
                  className="py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Log Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
