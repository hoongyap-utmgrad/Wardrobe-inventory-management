import React, { useState } from 'react';
import {
  ClothingCategory,
  ClothingItem,
  ClothingStatus,
  FormalityLevel,
  WeatherInfo,
  WearLogEntry,
} from '../types';
import { checkOutfitWeatherSuitability } from '../utils/weatherSuitability';
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Shirt,
  Clock,
  Sparkles,
  Tag,
  Calendar,
  X,
  Trash2,
  RotateCcw,
  Eye,
  Check,
  AlertCircle,
  AlertTriangle,
  CloudSun,
  Thermometer,
} from 'lucide-react';

interface ClosetViewProps {
  items: ClothingItem[];
  currentWeather?: WeatherInfo;
  latestLog?: WearLogEntry | null;
  onUpdateStatus: (itemId: string, newStatus: ClothingStatus) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItemClick: () => void;
  onMarkWornToday: (itemId: string) => void;
  onNavigate?: (view: string) => void;
  onOpenWeatherPicker?: () => void;
}

export const ClosetView: React.FC<ClosetViewProps> = ({
  items,
  currentWeather,
  latestLog,
  onUpdateStatus,
  onDeleteItem,
  onAddItemClick,
  onMarkWornToday,
  onNavigate,
  onOpenWeatherPicker,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);

  const categories = ['All', 'Tops', 'Bottoms', 'Outerwear', 'One-Piece', 'Footwear', 'Accessories'];
  const statuses = ['All', 'AVAILABLE', 'WORN_UNAVAILABLE', 'IN_LAUNDRY'];

  const wornItems = items.filter((i) => i.status === 'WORN_UNAVAILABLE');

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ClothingStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Ready / Clean
          </span>
        );
      case 'WORN_UNAVAILABLE':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
            <Clock className="w-3 h-3" /> Worn (Unavailable)
          </span>
        );
      case 'IN_LAUNDRY':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-500/10 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20">
            <RotateCcw className="w-3 h-3" /> In Laundry
          </span>
        );
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never worn';
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 0) return 'Worn Today';
    if (diffDays === 1) return 'Worn Yesterday';
    return `Worn ${diffDays} days ago`;
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Search Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Digital Closet</h1>
          <p className="text-xs text-slate-500">{items.length} garments in inventory</p>
        </div>
        <button
          onClick={onAddItemClick}
          className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items by name, color, brand..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active Worn Outfit vs Weather Status Card */}
      {wornItems.length > 0 && currentWeather && (() => {
        const check = checkOutfitWeatherSuitability(wornItems, currentWeather);
        return (
          <div
            className={`p-3 rounded-2xl border transition-all text-xs space-y-1.5 ${
              check.severity === 'severe_warning'
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : check.severity === 'mild_warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                {check.severity === 'severe_warning' ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : check.severity === 'mild_warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>Active Worn Fit ({wornItems.length} items)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[11px] opacity-80">
                  {currentWeather.locationName}: {currentWeather.temperature}°C
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                    check.severity === 'severe_warning'
                      ? 'bg-rose-200 text-rose-800'
                      : check.severity === 'mild_warning'
                      ? 'bg-amber-200 text-amber-800'
                      : 'bg-emerald-200 text-emerald-800'
                  }`}
                >
                  {check.score}% Match
                </span>
              </div>
            </div>

            {check.severity !== 'optimal' && check.reasons.length > 0 && (
              <div className="text-[11px] opacity-90 pl-5">
                <span className="font-semibold">Notice:</span> {check.reasons[0]}
              </div>
            )}

            {onNavigate && check.severity !== 'optimal' && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('stylist')}
                  className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-white/70 hover:bg-white px-2 py-0.5 rounded-lg border border-black/10 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" /> Get Weather Recommendations
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Category Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px] bg-slate-100 p-1 rounded-xl">
        <span className="text-slate-400 font-medium pl-2 pr-1">Status:</span>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedStatus === st
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st === 'All' && 'All Statuses'}
            {st === 'AVAILABLE' && 'Clean / Ready'}
            {st === 'WORN_UNAVAILABLE' && 'Worn'}
            {st === 'IN_LAUNDRY' && 'In Laundry'}
          </button>
        ))}
      </div>

      {/* Garments Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
          <Shirt className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-semibold text-sm text-slate-700">No items match your filters</p>
          <p className="text-xs text-slate-400">
            Try clearing search filters or add a new clothing item to your inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all group relative"
            >
              {/* Photo Area */}
              <div
                onClick={() => setSelectedItem(item)}
                className="relative aspect-square bg-slate-100 cursor-pointer overflow-hidden flex items-center justify-center p-3"
              >
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badge */}
                <div className="absolute top-2 left-2">{getStatusBadge(item.status)}</div>

                {/* Times Worn Badge */}
                <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {item.timesWorn}x worn
                </div>
              </div>

              {/* Item Info */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setSelectedItem(item)}
                    className="font-bold text-xs text-slate-800 truncate cursor-pointer hover:text-indigo-600"
                  >
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <span className="font-medium text-slate-700">{item.color}</span>
                    <span>•</span>
                    <span>{item.category}</span>
                  </div>
                </div>

                {/* Card Quick Action */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                  {item.status === 'AVAILABLE' ? (
                    <button
                      onClick={() => onMarkWornToday(item.id)}
                      className="w-full py-1 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Mark Worn
                    </button>
                  ) : item.status === 'WORN_UNAVAILABLE' ? (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'IN_LAUNDRY')}
                      className="w-full py-1 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> To Laundry
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpdateStatus(item.id, 'AVAILABLE')}
                      className="w-full py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Clean
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Garment Profile
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-center justify-center">
              <img
                src={selectedItem.photoUrl}
                alt={selectedItem.name}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-base text-slate-900">{selectedItem.name}</h2>
                  <p className="text-xs text-slate-500">
                    {selectedItem.brand ? `${selectedItem.brand} • ` : ''}
                    {selectedItem.color} {selectedItem.category}
                  </p>
                </div>
                <div>{getStatusBadge(selectedItem.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                    Usage Count
                  </span>
                  <span className="font-bold text-slate-800">{selectedItem.timesWorn} times worn</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                    Last Worn
                  </span>
                  <span className="font-bold text-slate-800">
                    {formatDate(selectedItem.lastWornDate)}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                    Formality
                  </span>
                  <span className="font-bold text-slate-800">{selectedItem.formality}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                    Seasons
                  </span>
                  <span className="font-bold text-slate-800">
                    {selectedItem.season.join(', ')}
                  </span>
                </div>
              </div>

              {selectedItem.notes && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
                  {selectedItem.notes}
                </div>
              )}
            </div>

            {/* Actions in Modal */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {selectedItem.status === 'AVAILABLE' ? (
                <button
                  onClick={() => {
                    onMarkWornToday(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Check className="w-4 h-4" /> Wear Today (Mark Unavailable)
                </button>
              ) : selectedItem.status === 'WORN_UNAVAILABLE' ? (
                <button
                  onClick={() => {
                    onUpdateStatus(selectedItem.id, 'IN_LAUNDRY');
                    setSelectedItem(null);
                  }}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                >
                  <RotateCcw className="w-4 h-4" /> Move to Laundry
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUpdateStatus(selectedItem.id, 'AVAILABLE');
                    setSelectedItem(null);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark Clean & Available
                </button>
              )}

              <button
                onClick={() => {
                  onDeleteItem(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="w-full py-2 text-rose-600 hover:bg-rose-50 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Garment from Closet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
