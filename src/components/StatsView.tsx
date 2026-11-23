import React from 'react';
import { ClothingItem, WearLogEntry } from '../types';
import { checkOutfitWeatherSuitability } from '../utils/weatherSuitability';
import {
  BarChart2,
  TrendingUp,
  Sparkles,
  PieChart,
  Shirt,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface StatsViewProps {
  items: ClothingItem[];
  logs: WearLogEntry[];
}

export const StatsView: React.FC<StatsViewProps> = ({ items, logs }) => {
  // Most worn items
  const sortedByWear = [...items].sort((a, b) => b.timesWorn - a.timesWorn);
  const mostWorn = sortedByWear.slice(0, 3);
  const leastWorn = sortedByWear.slice(-3).reverse();

  // Availability Counts
  const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;
  const wornCount = items.filter((i) => i.status === 'WORN_UNAVAILABLE').length;
  const laundryCount = items.filter((i) => i.status === 'IN_LAUNDRY').length;

  const totalItems = items.length || 1;

  // Category counts
  const categories = ['Tops', 'Bottoms', 'Outerwear', 'One-Piece', 'Footwear', 'Accessories'];
  const categoryStats = categories.map((cat) => {
    const count = items.filter((i) => i.category === cat).length;
    const totalWorn = items
      .filter((i) => i.category === cat)
      .reduce((acc, curr) => acc + curr.timesWorn, 0);
    return { category: cat, count, totalWorn };
  });

  // Weather Suitability Stats on Past Logs
  const weatherStats = logs.map((log) => {
    const logGarments = items.filter((i) => log.itemIds.includes(i.id));
    const check = checkOutfitWeatherSuitability(logGarments, log.weather);
    return { log, check };
  });

  const optimalCount = weatherStats.filter((ws) => ws.check.severity === 'optimal').length;
  const warningCount = weatherStats.filter((ws) => ws.check.severity !== 'optimal').length;

  return (
    <div className="space-y-4 pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" /> Wardrobe Analytics
        </h1>
        <p className="text-xs text-slate-500">
          Wear frequency insights, weather suitability history, and closet stats
        </p>
      </div>

      {/* Weather Appropriateness Score Card */}
      {logs.length > 0 && (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Weather Suitability Rate
            </span>
            <span className="text-xs font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
              {Math.round((optimalCount / (logs.length || 1)) * 100)}% Weather Aligned
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
              <span className="text-lg font-black text-emerald-400 block">{optimalCount}</span>
              <span className="text-[10px] text-slate-300 font-medium">Optimal Weather Fits</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/10">
              <span className="text-lg font-black text-amber-400 block">{warningCount}</span>
              <span className="text-[10px] text-slate-300 font-medium">Mismatches / Layer Warnings</span>
            </div>
          </div>
        </div>
      )}

      {/* Availability Status Card */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <PieChart className="w-4 h-4 text-indigo-600" /> Closet Availability Status
        </h3>

        {/* Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all"
            style={{ width: `${(availableCount / totalItems) * 100}%` }}
            title="Clean / Available"
          />
          <div
            className="bg-amber-500 h-full transition-all"
            style={{ width: `${(wornCount / totalItems) * 100}%` }}
            title="Worn / Unavailable"
          />
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${(laundryCount / totalItems) * 100}%` }}
            title="In Laundry"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
          <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-2xl">
            <span className="block font-bold text-emerald-800 text-sm">{availableCount}</span>
            <span className="text-[10px] font-semibold text-emerald-600">Clean / Available</span>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-2 rounded-2xl">
            <span className="block font-bold text-amber-800 text-sm">{wornCount}</span>
            <span className="text-[10px] font-semibold text-amber-600">Worn Today</span>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-2 rounded-2xl">
            <span className="block font-bold text-blue-800 text-sm">{laundryCount}</span>
            <span className="text-[10px] font-semibold text-blue-600">In Laundry</span>
          </div>
        </div>
      </div>

      {/* Most Worn vs Least Worn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Most Worn */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-amber-500" /> Most Worn Favorites
          </h3>
          <div className="space-y-2">
            {mostWorn.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
              >
                <span className="font-bold text-slate-400 w-4 text-center">#{idx + 1}</span>
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-9 h-9 object-contain bg-white rounded-xl p-0.5 border"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.category}</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.timesWorn}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Least Worn */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" /> Underrated / Hidden Gems
          </h3>
          <div className="space-y-2">
            {leastWorn.map((item, idx) => (
              <div
                key={item.id}
                className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-2xl border border-slate-100 text-xs"
              >
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-9 h-9 object-contain bg-white rounded-xl p-0.5 border"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.category}</p>
                </div>
                <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.timesWorn}x worn
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800">Category Usage Breakdown</h3>
        <div className="space-y-2 text-xs">
          {categoryStats.map((cs) => (
            <div key={cs.category} className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                <span>{cs.category}</span>
                <span className="text-slate-500">
                  {cs.count} items • {cs.totalWorn} total wears
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min(100, (cs.count / totalItems) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Wear Log History */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600" /> Outfit Wear History Logs ({logs.length})
        </h3>

        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No outfit history logged yet.</p>
        ) : (
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {weatherStats.map(({ log, check }) => {
              const logGarments = items.filter((i) => log.itemIds.includes(i.id));

              return (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {log.outfitName || 'Daily Fit'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 font-medium">
                      {log.weather.locationName}: {log.weather.temperature}°C {log.weather.condition}
                    </span>

                    {/* Weather Appropriateness Badge */}
                    {check.severity === 'optimal' ? (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Ideal Fit ({check.score}%)
                      </span>
                    ) : check.severity === 'mild_warning' ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Weather Warning ({check.score}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Severe Mismatch ({check.score}%)
                      </span>
                    )}
                  </div>

                  {check.reasons.length > 0 && (
                    <div className="text-[10px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-100">
                      <span className="font-bold">Weather Warning:</span> {check.reasons.join(', ')}
                    </div>
                  )}

                  {/* Garment Thumbs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                    {logGarments.map((g) => (
                      <div
                        key={g.id}
                        className="bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center gap-1.5 px-2"
                      >
                        <img src={g.photoUrl} alt={g.name} className="w-5 h-5 object-contain" />
                        <span className="text-[10px] font-medium text-slate-700">{g.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
