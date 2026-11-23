import React, { useState } from 'react';
import { ClothingItem, WeatherInfo, AppView } from '../types';
import { WeatherSuitabilityCheck } from '../utils/weatherSuitability';
import {
  AlertTriangle,
  AlertCircle,
  CloudRain,
  Snowflake,
  Sun,
  Wind,
  Flame,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Shirt,
  CheckCircle2,
  Thermometer,
} from 'lucide-react';

export interface WeatherAlertData {
  id: string;
  timestamp: string;
  outfitName: string;
  outfitItems: ClothingItem[];
  previousWeather?: WeatherInfo;
  currentWeather: WeatherInfo;
  check: WeatherSuitabilityCheck;
}

interface WeatherNotificationToastProps {
  alert: WeatherAlertData | null;
  onDismiss: () => void;
  onNavigate: (view: AppView) => void;
  onOpenWeatherPicker?: () => void;
}

export const WeatherNotificationToast: React.FC<WeatherNotificationToastProps> = ({
  alert,
  onDismiss,
  onNavigate,
  onOpenWeatherPicker,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  if (!alert) return null;

  const { outfitName, outfitItems, currentWeather, check } = alert;
  const isSevere = check.severity === 'severe_warning';

  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-4 h-4 text-blue-400" />;
    if (c.includes('snow') || c.includes('cold')) return <Snowflake className="w-4 h-4 text-cyan-300" />;
    if (c.includes('chilly') || c.includes('wind')) return <Wind className="w-4 h-4 text-teal-300" />;
    if (c.includes('hot')) return <Flame className="w-4 h-4 text-amber-400" />;
    return <Sun className="w-4 h-4 text-amber-300" />;
  };

  return (
    <div className="fixed top-12 left-3 right-3 sm:left-auto sm:right-auto sm:w-[390px] z-50 animate-in fade-in slide-in-from-top-4 duration-300">
      <div
        className={`rounded-3xl p-3.5 shadow-2xl border backdrop-blur-xl transition-all ${
          isSevere
            ? 'bg-slate-900/95 text-white border-rose-500/50 shadow-rose-950/40 ring-1 ring-rose-500/30'
            : 'bg-slate-900/95 text-white border-amber-500/40 shadow-amber-950/30 ring-1 ring-amber-500/20'
        }`}
      >
        {/* Top Header: Android Push Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full animate-ping ${
                isSevere ? 'bg-rose-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`font-black uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isSevere
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}
            >
              {isSevere ? (
                <AlertTriangle className="w-3 h-3 text-rose-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-400" />
              )}
              Weather Incompatibility Warning
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">Just now</span>
            <button
              onClick={onDismiss}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="pt-2.5 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-xs text-white leading-tight flex items-center gap-1.5">
                {check.title}
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Logged outfit <span className="font-semibold text-indigo-300">"{outfitName}"</span> is unsuitable for current{' '}
                <span className="font-bold text-white">
                  {currentWeather.temperature}°C {currentWeather.condition}
                </span>{' '}
                weather in {currentWeather.locationName}.
              </p>
            </div>

            <div className="p-2 bg-white/10 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-white/10 text-center min-w-[52px]">
              {getWeatherIcon(currentWeather.condition)}
              <span className="text-[11px] font-black text-white mt-0.5">
                {currentWeather.temperature}°C
              </span>
            </div>
          </div>

          {/* Conflict Summary Badges */}
          {check.reasons.length > 0 && (
            <div className="bg-white/5 rounded-2xl p-2.5 border border-white/10 space-y-1.5 text-[11px]">
              <div className="font-semibold text-slate-300 flex items-center gap-1 text-[10px] uppercase tracking-wider">
                <Thermometer className="w-3 h-3 text-indigo-400" /> Detected Conflicts:
              </div>
              <ul className="space-y-1">
                {check.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-slate-200 text-[11px]">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Expandable Recommendations Section */}
          {check.recommendations.length > 0 && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-[11px] text-indigo-300 hover:text-indigo-200 py-1 font-semibold"
              >
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  {isExpanded ? 'Hide Stylist Advice' : 'View Recommended Fixes'} (
                  {check.recommendations.length})
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {isExpanded && (
                <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-2xl p-2.5 mt-1 space-y-1.5 text-[11px] animate-in fade-in">
                  <span className="font-bold text-indigo-200 block text-[10px] uppercase tracking-wider">
                    Recommended Adjustments:
                  </span>
                  <ul className="space-y-1">
                    {check.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onNavigate('stylist');
                onDismiss();
              }}
              className="py-2 px-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-[11px] shadow-md flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Find Weather Fit
            </button>

            <button
              onClick={() => {
                onNavigate('log_fit');
                onDismiss();
              }}
              className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-[11px] border border-white/10 flex items-center justify-center gap-1 transition-all"
            >
              <Shirt className="w-3.5 h-3.5 text-indigo-300" /> Log Different Fit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
