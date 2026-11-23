import React, { useState } from 'react';
import {
  ClothingCategory,
  ClothingItem,
  CategoryCountMap,
  FormalityLevel,
  SeasonType,
} from '../types';
import { CameraCapture } from './CameraCapture';
import { DEFAULT_INITIAL_COUNTS, SAMPLE_CLOTHING_IMAGES } from '../data/defaultData';
import { Shirt, Sparkles, ArrowRight, ArrowLeft, Check, Plus, Minus, Camera, Wand2, Info } from 'lucide-react';

interface BatchRecordWizardProps {
  onComplete: (items: ClothingItem[]) => void;
  onLoadSample: () => void;
}

export const BatchRecordWizard: React.FC<BatchRecordWizardProps> = ({
  onComplete,
  onLoadSample,
}) => {
  const [step, setStep] = useState<'counts' | 'capture'>('counts');

  // Step 1 State: Counts per category
  const [counts, setCounts] = useState<CategoryCountMap>(DEFAULT_INITIAL_COUNTS);

  // Step 2 State: Queue of items to photograph
  const [itemQueue, setItemQueue] = useState<
    Array<{ category: ClothingCategory; categoryIndex: number; totalInCategory: number }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [recordedItems, setRecordedItems] = useState<ClothingItem[]>([]);

  // Current Item Form State
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(null);
  const [itemName, setItemName] = useState<string>('');
  const [itemColor, setItemColor] = useState<string>('Blue');
  const [itemFormality, setItemFormality] = useState<FormalityLevel>('Casual');
  const [itemSeasons, setItemSeasons] = useState<SeasonType[]>(['Spring', 'Summer']);
  const [itemBrand, setItemBrand] = useState<string>('');
  const [itemNotes, setItemNotes] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const categories: ClothingCategory[] = [
    'Tops',
    'Bottoms',
    'Outerwear',
    'One-Piece',
    'Footwear',
    'Accessories',
  ];

  const updateCount = (cat: ClothingCategory, delta: number) => {
    setCounts((prev) => ({
      ...prev,
      [cat]: Math.max(0, prev[cat] + delta),
    }));
  };

  const totalItemsCount = (Object.values(counts) as number[]).reduce((a: number, b: number) => a + b, 0);

  const handleStartCapture = () => {
    if (totalItemsCount === 0) {
      alert('Please select at least 1 clothing item to record.');
      return;
    }

    // Build item queue
    const queue: Array<{ category: ClothingCategory; categoryIndex: number; totalInCategory: number }> =
      [];
    categories.forEach((cat) => {
      const num = counts[cat];
      for (let i = 1; i <= num; i++) {
        queue.push({
          category: cat,
          categoryIndex: i,
          totalInCategory: num,
        });
      }
    });

    setItemQueue(queue);
    setCurrentIndex(0);
    setRecordedItems([]);
    setStep('capture');
    resetCurrentItemForm(queue[0].category, queue[0].categoryIndex);
  };

  const resetCurrentItemForm = (category: ClothingCategory, catIndex: number) => {
    setCurrentPhoto(null);
    setItemName(`${category} #${catIndex}`);
    setItemColor('Black');
    setItemFormality('Casual');
    setItemSeasons(['All Season']);
    setItemBrand('');
    setItemNotes('');
  };

  const handlePhotoCaptured = async (imageDataUrl: string) => {
    setCurrentPhoto(imageDataUrl);

    // Auto AI Tagging call
    try {
      setIsAnalyzing(true);
      const res = await fetch('/api/ai/analyze-clothing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageDataUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.analysis) {
          if (data.analysis.name) setItemName(data.analysis.name);
          if (data.analysis.color) setItemColor(data.analysis.color);
          if (data.analysis.formality) setItemFormality(data.analysis.formality as FormalityLevel);
          if (data.analysis.notes) setItemNotes(data.analysis.notes);
        }
      }
    } catch (err) {
      console.warn('AI analysis skipped:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextItem = () => {
    if (!currentPhoto) {
      // Pick default sample photo if user skipped camera
      const samplePhoto = SAMPLE_CLOTHING_IMAGES.white_tee;
      setCurrentPhoto(samplePhoto);
    }

    const currentQueueItem = itemQueue[currentIndex];

    const newItem: ClothingItem = {
      id: `item-${Date.now()}-${currentIndex}`,
      name: itemName || `${currentQueueItem.category} #${currentQueueItem.categoryIndex}`,
      category: currentQueueItem.category,
      color: itemColor || 'Neutral',
      photoUrl: currentPhoto || SAMPLE_CLOTHING_IMAGES.white_tee,
      season: itemSeasons.length > 0 ? itemSeasons : ['All Season'],
      formality: itemFormality,
      status: 'AVAILABLE',
      timesWorn: 0,
      lastWornDate: null,
      addedAt: new Date().toISOString(),
      brand: itemBrand || undefined,
      notes: itemNotes || undefined,
    };

    const updatedList = [...recordedItems, newItem];
    setRecordedItems(updatedList);

    if (currentIndex + 1 < itemQueue.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQueueItem = itemQueue[nextIdx];
      resetCurrentItemForm(nextQueueItem.category, nextQueueItem.categoryIndex);
    } else {
      // Finished all items!
      onComplete(updatedList);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5">
      {step === 'counts' && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Shirt className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Closet Inventory Setup</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              How many items of each clothing type do you currently have in your closet?
            </p>
          </div>

          {/* Category Count Inputs */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <div
                key={cat}
                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100"
              >
                <div>
                  <span className="font-semibold text-sm text-slate-800">{cat}</span>
                  <p className="text-[11px] text-slate-400">
                    {cat === 'Tops' && 'Shirts, Hoodies, Tees'}
                    {cat === 'Bottoms' && 'Jeans, Shorts, Trousers'}
                    {cat === 'Outerwear' && 'Jackets, Coats, Blazers'}
                    {cat === 'One-Piece' && 'Dresses, Jumpsuits'}
                    {cat === 'Footwear' && 'Sneakers, Boots, Shoes'}
                    {cat === 'Accessories' && 'Hats, Scarves, Bags'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateCount(cat, -1)}
                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-base text-slate-800 w-6 text-center">
                    {counts[cat]}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCount(cat, 1)}
                    className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Total Summary Badge */}
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-900">
            <span className="font-medium flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" /> Total Items to Record
            </span>
            <span className="font-bold bg-indigo-600 text-white px-3 py-1 rounded-full text-xs">
              {totalItemsCount} Garments
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleStartCapture}
              disabled={totalItemsCount === 0}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              Start Photo Capture ({totalItemsCount} Items) <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLoadSample}
              className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors text-center"
            >
              Or load sample wardrobe demo &rarr;
            </button>
          </div>
        </div>
      )}

      {step === 'capture' && itemQueue.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-slate-100 space-y-4">
          {/* Top Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">
                Item {currentIndex + 1} of {itemQueue.length}
              </span>
              <span className="text-indigo-600 font-bold">
                {itemQueue[currentIndex].category} (#{itemQueue[currentIndex].categoryIndex})
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / itemQueue.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Photo Capture Box */}
          {!currentPhoto ? (
            <CameraCapture
              onCapture={handlePhotoCaptured}
              defaultCategory={itemQueue[currentIndex].category}
            />
          ) : (
            <div className="space-y-3">
              <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
                <img
                  src={currentPhoto}
                  alt="Garment preview"
                  className="w-full h-full object-contain p-2"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center">
                    <Wand2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                    <p className="text-xs font-semibold">Gemini AI Auto-Tagging...</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setCurrentPhoto(null)}
                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 hover:bg-black text-white text-[11px] rounded-lg backdrop-blur"
                >
                  Change Photo
                </button>
              </div>

              {/* Item Details Form */}
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Garment Name
                  </label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Navy Fleece Hoodie"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={itemColor}
                      onChange={(e) => setItemColor(e.target.value)}
                      placeholder="e.g. Navy Blue"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Formality
                    </label>
                    <select
                      value={itemFormality}
                      onChange={(e) => setItemFormality(e.target.value as FormalityLevel)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Casual">Casual</option>
                      <option value="Smart Casual">Smart Casual</option>
                      <option value="Formal">Formal</option>
                      <option value="Sporty">Sporty</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Brand (Optional)
                  </label>
                  <input
                    type="text"
                    value={itemBrand}
                    onChange={(e) => setItemBrand(e.target.value)}
                    placeholder="e.g. Uniqlo, Nike, Zara"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextItem}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-3"
              >
                {currentIndex + 1 === itemQueue.length ? (
                  <>
                    <Check className="w-4 h-4" /> Save All to Digital Closet
                  </>
                ) : (
                  <>
                    Save & Next Item ({currentIndex + 2}/{itemQueue.length}){' '}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
