import React, { useState } from 'react';
import { AppView, WeatherInfo } from '../types';
import { WeatherAlertData } from './WeatherNotificationToast';
import {
  Shirt,
  Sparkles,
  CheckSquare,
  RotateCcw,
  BarChart2,
  Maximize2,
  Minimize2,
  Wifi,
  Battery,
  Plus,
  RefreshCw,
  CloudSun,
  Bell,
  AlertTriangle,
} from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  dirtyCount: number;
  availableCount: number;
  currentWeather: WeatherInfo;
  activeAlert: WeatherAlertData | null;
  onResetDemo: () => void;
  onOpenWeatherPicker: () => void;
  onShowAlert: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  currentView,
  onNavigate,
  dirtyCount,
  availableCount,
  currentWeather,
  activeAlert,
  onResetDemo,
  onOpenWeatherPicker,
  onShowAlert,
}) => {
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 font-sans text-slate-900">
      {/* Top Desktop Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 text-xs text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Android Digital Closet</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWeatherPicker}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-lg border border-indigo-500/30 font-medium flex items-center gap-1.5 transition-colors"
            title="Change weather location"
          >
            <CloudSun className="w-3.5 h-3.5" />
            <span>{currentWeather.locationName.split(',')[0]} ({currentWeather.temperature}°C)</span>
          </button>

          <button
            onClick={onResetDemo}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 font-medium transition-colors"
            title="Reset to sample closet data"
          >
            Reset
          </button>

          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-medium flex items-center gap-1 transition-colors"
          >
            {isMobileFrame ? (
              <>
                <Maximize2 className="w-3.5 h-3.5" /> Expanded
              </>
            ) : (
              <>
                <Minimize2 className="w-3.5 h-3.5" /> Mobile View
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Container - Android Phone Shell or Expanded Web */}
      <div
        className={`w-full transition-all duration-300 bg-slate-50 overflow-hidden flex flex-col justify-between ${
          isMobileFrame
            ? 'max-w-[420px] min-h-[780px] h-[90vh] max-h-[880px] rounded-[42px] border-[10px] border-slate-800 shadow-2xl shadow-indigo-950/50 ring-1 ring-slate-700 relative'
            : 'max-w-4xl min-h-[700px] rounded-3xl border border-slate-800 shadow-2xl relative'
        }`}
      >
        {/* Android Top Notch & Camera Hole */}
        {isMobileFrame && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-b-2xl z-50 flex items-center justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
          </div>
        )}

        {/* Android Status Bar */}
        <div className="bg-slate-900 text-slate-200 px-5 pt-3 pb-1.5 text-[11px] font-semibold flex items-center justify-between select-none z-40">
          <div className="flex items-center gap-2">
            <span>09:41</span>
            {/* Weather Notification Status Indicator in Status Bar */}
            {activeAlert ? (
              <button
                onClick={onShowAlert}
                className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded-full text-[9px] animate-pulse cursor-pointer hover:bg-amber-500/30"
                title="Weather Alert for your outfit - Tap to view"
              >
                <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                <span>Weather Alert</span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Weather Status Pill in Android Status Bar */}
            <button
              onClick={onOpenWeatherPicker}
              className="flex items-center gap-1 text-[10px] text-slate-300 bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded-md transition-colors"
              title="Tap to change weather profile"
            >
              <span>{currentWeather.temperature}°C</span>
              <span className="text-[9px] text-slate-400">{currentWeather.condition.split(' ')[0]}</span>
            </button>

            <span className="text-[10px] font-bold text-slate-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1">
              <span>96%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
        </div>

        {/* Scrollable Screen Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 no-scrollbar relative">
          {children}
        </div>

        {/* Android Bottom App Navigation Bar */}
        {currentView !== 'onboarding' && (
          <div className="bg-white border-t border-slate-200 px-2 py-2 select-none shadow-lg z-40">
            <div className="grid grid-cols-5 gap-1">
              {/* Tab 1: Closet */}
              <button
                onClick={() => onNavigate('closet')}
                className={`py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  currentView === 'closet'
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Shirt className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Closet</span>
              </button>

              {/* Tab 2: AI Stylist */}
              <button
                onClick={() => onNavigate('stylist')}
                className={`py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  currentView === 'stylist'
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Sparkles className="w-5 h-5 mb-0.5 text-indigo-500" />
                <span className="text-[10px]">AI Stylist</span>
                {availableCount > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                )}
              </button>

              {/* Tab 3: Log Fit */}
              <button
                onClick={() => onNavigate('log_fit')}
                className={`py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  currentView === 'log_fit'
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <CheckSquare className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Log Fit</span>
                {activeAlert && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-bounce" />
                )}
              </button>

              {/* Tab 4: Laundry */}
              <button
                onClick={() => onNavigate('laundry')}
                className={`py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all relative ${
                  currentView === 'laundry'
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <RotateCcw className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Laundry</span>
                {dirtyCount > 0 && (
                  <span className="absolute top-1 right-2 bg-amber-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {dirtyCount}
                  </span>
                )}
              </button>

              {/* Tab 5: Stats */}
              <button
                onClick={() => onNavigate('stats')}
                className={`py-1.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  currentView === 'stats'
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <BarChart2 className="w-5 h-5 mb-0.5" />
                <span className="text-[10px]">Stats</span>
              </button>
            </div>

            {/* Android Gesture Navigation Indicator Line */}
            <div className="w-28 h-1 bg-slate-300 rounded-full mx-auto mt-2 mb-0.5" />
          </div>
        )}
      </div>
    </div>
  );
};
