import { useState, useEffect, useCallback } from 'react';
import { Outfit } from '@/types/clothing';

const STORAGE_KEY = 'clothing-tracker-outfits';

export function useOutfitStore() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load outfits from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setOutfits(parsed.map((outfit: Outfit) => ({
        ...outfit,
        createdAt: new Date(outfit.createdAt),
        updatedAt: new Date(outfit.updatedAt),
      })));
    }
    setIsLoaded(true);
  }, []);

  // Save outfits to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(outfits));
    }
  }, [outfits, isLoaded]);

  const addOutfit = useCallback((outfit: Omit<Outfit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOutfit: Outfit = {
      ...outfit,
      id: crypto.randomUUID(),
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

  return {
    outfits,
    isLoaded,
    addOutfit,
    updateOutfit,
    deleteOutfit,
  };
}
