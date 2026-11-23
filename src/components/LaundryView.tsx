import React, { useState } from 'react';
import { ClothingItem, ClothingStatus } from '../types';
import { RotateCcw, CheckCircle2, Shirt, Sparkles, Check, Droplets, Waves, AlertCircle } from 'lucide-react';

interface LaundryViewProps {
  items: ClothingItem[];
  onWashItems: (itemIds: string[]) => void;
  onWashAll: () => void;
}

export const LaundryView: React.FC<LaundryViewProps> = ({
  items,
  onWashItems,
  onWashAll,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [washToast, setWashToast] = useState<string | null>(null);

  const dirtyItems = items.filter(
    (i) => i.status === 'WORN_UNAVAILABLE' || i.status === 'IN_LAUNDRY'
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleWashSelected = () => {
    if (selectedIds.length === 0) return;
    onWashItems(selectedIds);
    setWashToast(`Washed ${selectedIds.length} garments! Now clean and available in closet.`);
    setSelectedIds([]);
    setTimeout(() => setWashToast(null), 4000);
  };

  const handleWashAllClick = () => {
    if (dirtyItems.length === 0) return;
    onWashAll();
    setWashToast('Washed all dirty garments! Entire closet is clean and ready.');
    setSelectedIds([]);
    setTimeout(() => setWashToast(null), 4000);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Toast */}
      {washToast && (
        <div className="bg-emerald-600 text-white p-3 rounded-2xl text-xs font-semibold shadow-xl flex items-center justify-between animate-bounce">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 bg-white/20 rounded-full p-0.5" />
            {washToast}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" /> Laundry Room
          </h1>
          <p className="text-xs text-slate-500">
            {dirtyItems.length} garments currently unavailable / dirty
          </p>
        </div>

        {dirtyItems.length > 0 && (
          <button
            onClick={handleWashAllClick}
            className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Waves className="w-4 h-4" /> Wash All Clothes
          </button>
        )}
      </div>

      {/* Empty Laundry State */}
      {dirtyItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800">Your laundry basket is empty!</h3>
            <p className="text-xs text-slate-400 mt-1">
              All your clothes are clean, fresh, and available in your digital closet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Action Bar for Batch Selection */}
          <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">
                Selected: {selectedIds.length} / {dirtyItems.length}
              </span>
            </div>

            <button
              onClick={handleWashSelected}
              disabled={selectedIds.length === 0}
              className="py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" /> Wash Selected ({selectedIds.length})
            </button>
          </div>

          {/* List of Dirty / Unavailable Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {dirtyItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(item.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl p-1 shrink-0 flex items-center justify-center border border-slate-200">
                      <img
                        src={item.photoUrl}
                        alt={item.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-800 truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {item.color} • {item.category} • Worn {item.timesWorn}x
                      </p>
                      <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-2 py-0.2 rounded-full">
                        Unavailable
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
