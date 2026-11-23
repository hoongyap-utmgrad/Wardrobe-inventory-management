import React, { useState, useEffect, useCallback } from 'react';
import {
  ClothingItem,
  ClothingStatus,
  WearLogEntry,
  WeatherInfo,
  AppView,
} from './types';
import { INITIAL_SAMPLE_CLOSET, PRESET_WEATHER_PROFILES } from './data/defaultData';
import { checkOutfitWeatherSuitability } from './utils/weatherSuitability';
import { AndroidFrame } from './components/AndroidFrame';
import { BatchRecordWizard } from './components/BatchRecordWizard';
import { ClosetView } from './components/ClosetView';
import { OutfitStylistView } from './components/OutfitStylistView';
import { LogFitView } from './components/LogFitView';
import { LaundryView } from './components/LaundryView';
import { StatsView } from './components/StatsView';
import { AddItemModal } from './components/AddItemModal';
import {
  WeatherNotificationToast,
  WeatherAlertData,
} from './components/WeatherNotificationToast';
import { WeatherPickerModal } from './components/WeatherPickerModal';

const STORAGE_KEY_ITEMS = 'digital_closet_inventory_v2';
const STORAGE_KEY_LOGS = 'digital_closet_logs_v2';

export default function App() {
  // Load initial data from localStorage or default
  const [items, setItems] = useState<ClothingItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage parse error:', e);
    }
    return INITIAL_SAMPLE_CLOSET;
  });

  const [logs, setLogs] = useState<WearLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('LocalStorage logs parse error:', e);
    }
    return [
      {
        id: 'log-1',
        date: new Date(Date.now() - 86400000 * 3).toISOString(),
        itemIds: ['item-top-1', 'item-bottom-1', 'item-shoes-1'],
        outfitName: 'Classic Casual Fit',
        weather: PRESET_WEATHER_PROFILES[0],
        vibe: 'Casual Everyday',
      },
      {
        id: 'log-2',
        date: new Date(Date.now() - 86400000 * 1).toISOString(),
        itemIds: ['item-top-2', 'item-bottom-1', 'item-outer-1', 'item-shoes-1'],
        outfitName: 'Fleece Hoodie & Bomber Layer',
        weather: PRESET_WEATHER_PROFILES[1],
        vibe: 'Casual Everyday',
      },
    ];
  });

  const [currentView, setCurrentView] = useState<AppView>('closet');
  const [currentWeather, setCurrentWeather] = useState<WeatherInfo>(PRESET_WEATHER_PROFILES[0]);
  const [isAddItemOpen, setIsAddItemOpen] = useState<boolean>(false);
  const [isWeatherPickerOpen, setIsWeatherPickerOpen] = useState<boolean>(false);

  // Weather Incompatibility Notification System
  const [activeWeatherAlert, setActiveWeatherAlert] = useState<WeatherAlertData | null>(null);
  const [showToastBanner, setShowToastBanner] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save items to localStorage:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to save logs to localStorage:', e);
    }
  }, [logs]);

  // Weather evaluation helper on logged outfits
  const evaluateWeatherChangeForLoggedFit = useCallback(
    (newWeather: WeatherInfo, previousWeather?: WeatherInfo) => {
      // Find currently worn items or latest logged outfit
      const wornGarments = items.filter((i) => i.status === 'WORN_UNAVAILABLE');
      let targetOutfitItems: ClothingItem[] = [];
      let targetOutfitName = 'Today\'s Active Outfit';

      if (wornGarments.length > 0) {
        targetOutfitItems = wornGarments;
      } else if (logs.length > 0) {
        const latest = logs[0];
        targetOutfitItems = items.filter((i) => latest.itemIds.includes(i.id));
        if (latest.outfitName) targetOutfitName = latest.outfitName;
      }

      if (targetOutfitItems.length === 0) return;

      const check = checkOutfitWeatherSuitability(targetOutfitItems, newWeather);

      if (!check.isAppropriate || check.severity !== 'optimal') {
        const alertData: WeatherAlertData = {
          id: `alert-${Date.now()}`,
          timestamp: new Date().toISOString(),
          outfitName: targetOutfitName,
          outfitItems: targetOutfitItems,
          previousWeather,
          currentWeather: newWeather,
          check,
        };
        setActiveWeatherAlert(alertData);
        setShowToastBanner(true);
      } else {
        // Outfit matches new weather well; clear severe alert if matching
        setActiveWeatherAlert(null);
        setShowToastBanner(false);
      }
    },
    [items, logs]
  );

  const handleWeatherChange = (newWeather: WeatherInfo) => {
    const prev = currentWeather;
    setCurrentWeather(newWeather);
    evaluateWeatherChangeForLoggedFit(newWeather, prev);
  };

  // Handlers
  const handleOnboardingComplete = (newBatchItems: ClothingItem[]) => {
    setItems(newBatchItems);
    setCurrentView('closet');
  };

  const handleLoadSampleDemo = () => {
    setItems(INITIAL_SAMPLE_CLOSET);
    setCurrentView('closet');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset closet data to default sample inventory?')) {
      setItems(INITIAL_SAMPLE_CLOSET);
      setLogs([]);
      setActiveWeatherAlert(null);
      setCurrentView('closet');
    }
  };

  const handleUpdateItemStatus = (itemId: string, newStatus: ClothingStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );
  };

  const handleMarkWornToday = (itemId: string) => {
    const nowIso = new Date().toISOString();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'WORN_UNAVAILABLE',
            timesWorn: item.timesWorn + 1,
            lastWornDate: nowIso,
          };
        }
        return item;
      })
    );

    // Create log entry
    const targetItem = items.find((i) => i.id === itemId);
    if (targetItem) {
      const newLog: WearLogEntry = {
        id: `log-${Date.now()}`,
        date: nowIso,
        itemIds: [itemId],
        outfitName: `${targetItem.name}`,
        weather: currentWeather,
        vibe: 'Daily Wear',
      };
      setLogs((prev) => [newLog, ...prev]);

      // Check suitability
      const check = checkOutfitWeatherSuitability([targetItem], currentWeather);
      if (!check.isAppropriate) {
        setActiveWeatherAlert({
          id: `alert-${Date.now()}`,
          timestamp: nowIso,
          outfitName: targetItem.name,
          outfitItems: [targetItem],
          currentWeather,
          check,
        });
        setShowToastBanner(true);
      }
    }
  };

  const handleWearOutfit = (
    outfitGarments: ClothingItem[],
    outfitName: string,
    vibe: string
  ) => {
    const garmentIds = outfitGarments.map((g) => g.id);
    const nowIso = new Date().toISOString();

    setItems((prev) =>
      prev.map((item) => {
        if (garmentIds.includes(item.id)) {
          return {
            ...item,
            status: 'WORN_UNAVAILABLE',
            timesWorn: item.timesWorn + 1,
            lastWornDate: nowIso,
          };
        }
        return item;
      })
    );

    const newLog: WearLogEntry = {
      id: `log-${Date.now()}`,
      date: nowIso,
      itemIds: garmentIds,
      outfitName,
      weather: currentWeather,
      vibe,
    };
    setLogs((prev) => [newLog, ...prev]);

    // Check weather suitability
    const check = checkOutfitWeatherSuitability(outfitGarments, currentWeather);
    if (!check.isAppropriate) {
      setActiveWeatherAlert({
        id: `alert-${Date.now()}`,
        timestamp: nowIso,
        outfitName,
        outfitItems: outfitGarments,
        currentWeather,
        check,
      });
      setShowToastBanner(true);
    } else {
      setActiveWeatherAlert(null);
      setShowToastBanner(false);
    }
  };

  const handleLogCustomOutfit = (
    selectedGarments: ClothingItem[],
    outfitName: string,
    notes: string
  ) => {
    handleWearOutfit(selectedGarments, outfitName, 'Custom Selection');
  };

  const handleWashItems = (itemIds: string[]) => {
    setItems((prev) =>
      prev.map((item) => (itemIds.includes(item.id) ? { ...item, status: 'AVAILABLE' } : item))
    );
    // If all worn items washed, clear active alert
    const remainingWorn = items.filter(
      (i) => i.status === 'WORN_UNAVAILABLE' && !itemIds.includes(i.id)
    );
    if (remainingWorn.length === 0) {
      setActiveWeatherAlert(null);
      setShowToastBanner(false);
    }
  };

  const handleWashAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, status: 'AVAILABLE' })));
    setActiveWeatherAlert(null);
    setShowToastBanner(false);
  };

  const handleAddItem = (newItem: ClothingItem) => {
    setItems((prev) => [newItem, ...prev]);
    setIsAddItemOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const dirtyCount = items.filter(
    (i) => i.status === 'WORN_UNAVAILABLE' || i.status === 'IN_LAUNDRY'
  ).length;

  const availableCount = items.filter((i) => i.status === 'AVAILABLE').length;

  return (
    <AndroidFrame
      currentView={currentView}
      onNavigate={setCurrentView}
      dirtyCount={dirtyCount}
      availableCount={availableCount}
      currentWeather={currentWeather}
      activeAlert={activeWeatherAlert}
      onResetDemo={handleResetDemoData}
      onOpenWeatherPicker={() => setIsWeatherPickerOpen(true)}
      onShowAlert={() => setShowToastBanner(true)}
    >
      {/* Weather Incompatibility Toast Notification */}
      {showToastBanner && activeWeatherAlert && (
        <WeatherNotificationToast
          alert={activeWeatherAlert}
          onDismiss={() => setShowToastBanner(false)}
          onNavigate={setCurrentView}
          onOpenWeatherPicker={() => setIsWeatherPickerOpen(true)}
        />
      )}

      {/* View router */}
      {currentView === 'onboarding' && (
        <BatchRecordWizard
          onComplete={handleOnboardingComplete}
          onLoadSample={handleLoadSampleDemo}
        />
      )}

      {currentView === 'closet' && (
        <ClosetView
          items={items}
          currentWeather={currentWeather}
          latestLog={logs[0] || null}
          onUpdateStatus={handleUpdateItemStatus}
          onDeleteItem={handleDeleteItem}
          onAddItemClick={() => setIsAddItemOpen(true)}
          onMarkWornToday={handleMarkWornToday}
          onNavigate={setCurrentView}
          onOpenWeatherPicker={() => setIsWeatherPickerOpen(true)}
        />
      )}

      {currentView === 'stylist' && (
        <OutfitStylistView
          items={items}
          currentWeather={currentWeather}
          onWeatherChange={handleWeatherChange}
          onWearOutfit={handleWearOutfit}
        />
      )}

      {currentView === 'log_fit' && (
        <LogFitView
          items={items}
          currentWeather={currentWeather}
          onLogCustomOutfit={handleLogCustomOutfit}
          onNavigate={setCurrentView}
          onOpenWeatherPicker={() => setIsWeatherPickerOpen(true)}
        />
      )}

      {currentView === 'laundry' && (
        <LaundryView
          items={items}
          onWashItems={handleWashItems}
          onWashAll={handleWashAll}
        />
      )}

      {currentView === 'stats' && <StatsView items={items} logs={logs} />}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <AddItemModal onSave={handleAddItem} onClose={() => setIsAddItemOpen(false)} />
      )}

      {/* Quick Weather Profile Switcher Modal */}
      {isWeatherPickerOpen && (
        <WeatherPickerModal
          currentWeather={currentWeather}
          onSelectWeather={handleWeatherChange}
          onClose={() => setIsWeatherPickerOpen(false)}
        />
      )}
    </AndroidFrame>
  );
}
