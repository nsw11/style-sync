import { useState, useEffect, useCallback } from 'react';
import { Outfit, OutfitWearLog, OutfitSection } from '@/types/clothing';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'clothing-tracker-outfits';

// Safe localStorage save that handles quota exceeded errors
const safeLocalStorageSave = (key: string, data: string): boolean => {
  try {
    localStorage.setItem(key, data);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      toast({
        title: 'Storage Full',
        description: 'Local storage is full. Consider removing some items or photos to free up space.',
        variant: 'destructive',
      });
    }
    return false;
  }
};

export function useOutfitStore() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load outfits from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOutfits(parsed.map((outfit: Outfit) => ({
          ...outfit,
          wearCount: outfit.wearCount || 0,
          wearLogs: (outfit.wearLogs || []).map((log: OutfitWearLog) => ({
            ...log,
            date: new Date(log.date),
          })),
          createdAt: new Date(outfit.createdAt),
          updatedAt: new Date(outfit.updatedAt),
        })));
      }
    } catch (error) {
      console.error('Failed to load outfits:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save outfits to localStorage
  useEffect(() => {
    if (isLoaded) {
      safeLocalStorageSave(STORAGE_KEY, JSON.stringify(outfits));
    }
  }, [outfits, isLoaded]);

  const addOutfit = useCallback((outfit: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt' | 'wearCount' | 'wearLogs'>) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: crypto.randomUUID(),
      wearCount: 0,
      wearLogs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setOutfits(prev => [newOutfit, ...prev]);
    return newOutfit;
  }, []);

  const updateOutfit = useCallback((id: string, updates: Partial<Omit<Outfit, 'id' | 'createdAt'>>) => {
    setOutfits(prev => prev.map(outfit =>
      outfit.id === id
        ? { ...outfit, ...updates, updatedAt: new Date() }
        : outfit
    ));
  }, []);

  const deleteOutfit = useCallback((id: string) => {
    setOutfits(prev => prev.filter(outfit => outfit.id !== id));
  }, []);

  const logOutfitWear = useCallback((id: string, photo?: string): string[] => {
    const wearLog: OutfitWearLog = {
      id: crypto.randomUUID(),
      date: new Date(),
      photo,
    };
    
    let itemIds: string[] = [];
    
    setOutfits(prev => prev.map(outfit => {
      if (outfit.id === id) {
        // Collect item IDs from the outfit
        itemIds = Object.values(outfit.items).filter(Boolean) as string[];
        return {
          ...outfit,
          wearCount: (outfit.wearCount || 0) + 1,
          wearLogs: [...(outfit.wearLogs || []), wearLog],
          updatedAt: new Date(),
        };
      }
      return outfit;
    }));
    
    return itemIds;
  }, []);

  return {
    outfits,
    isLoaded,
    addOutfit,
    updateOutfit,
    deleteOutfit,
    logOutfitWear,
  };
}
