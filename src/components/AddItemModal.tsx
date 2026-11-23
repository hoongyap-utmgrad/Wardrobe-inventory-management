import React, { useState } from 'react';
import {
  ClothingCategory,
  ClothingItem,
  FormalityLevel,
  SeasonType,
} from '../types';
import { CameraCapture } from './CameraCapture';
import { SAMPLE_CLOTHING_IMAGES } from '../data/defaultData';
import { X, Check, Plus, Wand2 } from 'lucide-react';

interface AddItemModalProps {
  onSave: (newItem: ClothingItem) => void;
  onClose: () => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ onSave, onClose }) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ClothingCategory>('Tops');
  const [color, setColor] = useState<string>('White');
  const [formality, setFormality] = useState<FormalityLevel>('Casual');
  const [seasons, setSeasons] = useState<SeasonType[]>(['Spring', 'Summer']);
  const [brand, setBrand] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const categories: ClothingCategory[] = [
    'Tops',
    'Bottoms',
    'Outerwear',
    'One-Piece',
    'Footwear',
    'Accessories',
  ];

  const handlePhotoCaptured = async (capturedBase64: string) => {
    setPhotoUrl(capturedBase64);

    // Call AI auto-tagging
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/ai/analyze-clothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: capturedBase64 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.analysis) {
          if (data.analysis.name) setName(data.analysis.name);
          if (data.analysis.category && categories.includes(data.analysis.category)) {
            setCategory(data.analysis.category as ClothingCategory);
          }
          if (data.analysis.color) setColor(data.analysis.color);
          if (data.analysis.formality) setFormality(data.analysis.formality as FormalityLevel);
          if (data.analysis.notes) setNotes(data.analysis.notes);
        }
      }
    } catch (e) {
      console.warn('AI tagging failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPhoto = photoUrl || SAMPLE_CLOTHING_IMAGES.white_tee;

    const newItem: ClothingItem = {
      id: `item-${Date.now()}`,
      name: name || `${color} ${category}`,
      category,
      color: color || 'Neutral',
      photoUrl: finalPhoto,
      season: seasons.length > 0 ? seasons : ['All Season'],
      formality,
      status: 'AVAILABLE',
      timesWorn: 0,
      lastWornDate: null,
      addedAt: new Date().toISOString(),
      brand: brand || undefined,
      notes: notes || undefined,
    };

    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="font-bold text-base text-slate-900">Add Garment to Closet</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Photo Capture Section */}
          {!photoUrl ? (
            <CameraCapture onCapture={handlePhotoCaptured} defaultCategory={category} />
          ) : (
            <div className="relative aspect-square w-full max-w-[220px] mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
              <img src={photoUrl} alt="Preview" className="w-full h-full object-contain p-2" />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-2">
                  <Wand2 className="w-6 h-6 text-indigo-400 animate-spin mb-1" />
                  <span className="text-[11px] font-semibold">Gemini Auto-Tagging...</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded-md backdrop-blur"
              >
                Change
              </button>
            </div>
          )}

          {/* Garment Details */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Garment Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Blue Denim Jacket"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ClothingCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Navy Blue"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Formality
              </label>
              <select
                value={formality}
                onChange={(e) => setFormality(e.target.value as FormalityLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Casual">Casual</option>
                <option value="Smart Casual">Smart Casual</option>
                <option value="Formal">Formal</option>
                <option value="Sporty">Sporty</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Brand
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Uniqlo, Nike"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dry clean only, soft cotton"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow flex items-center justify-center gap-1.5 transition-all mt-2"
          >
            <Check className="w-4 h-4" /> Save Garment to Closet
          </button>
        </form>
      </div>
    </div>
  );
};
