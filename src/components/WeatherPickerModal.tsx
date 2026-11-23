import React from 'react';
import { WeatherInfo } from '../types';
import { PRESET_WEATHER_PROFILES } from '../data/defaultData';
import {
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Flame,
  X,
  Check,
  Compass,
  Thermometer,
  CloudSun,
} from 'lucide-react';

interface WeatherPickerModalProps {
  currentWeather: WeatherInfo;
  onSelectWeather: (weather: WeatherInfo) => void;
  onClose: () => void;
}

export const WeatherPickerModal: React.FC<WeatherPickerModalProps> = ({
  currentWeather,
  onSelectWeather,
  onClose,
}) => {
  const getWeatherIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (c.includes('snow') || c.includes('cold')) return <Snowflake className="w-5 h-5 text-cyan-500" />;
    if (c.includes('chilly') || c.includes('wind')) return <Wind className="w-5 h-5 text-teal-500" />;
    if (c.includes('hot')) return <Flame className="w-5 h-5 text-amber-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <CloudSun className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Change Current Weather</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Switch weather location &amp; profile to test automated weather alerts and outfit suitability warnings.
        </p>

        <div className="space-y-2">
          {PRESET_WEATHER_PROFILES.map((profile) => {
            const isSelected = profile.locationName === currentWeather.locationName;

            return (
              <div
                key={profile.locationName}
                onClick={() => {
                  onSelectWeather(profile);
                  onClose();
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-600 shadow-sm ring-1 ring-indigo-500/30'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                    {getWeatherIcon(profile.condition)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-900">{profile.locationName}</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-md">
                        {profile.condition}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{profile.summary}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-sm text-slate-800">{profile.temperature}°C</span>
                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 bg-white" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
