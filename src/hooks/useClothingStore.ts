import { useState, useEffect, useCallback } from 'react';
import { ClothingItem, Category, DEFAULT_SUBCATEGORIES } from '@/types/clothing';

const STORAGE_KEY = 'clothing-tracker-items';
const CUSTOM_SUBCATEGORIES_KEY = 'clothing-tracker-custom-subcategories';

export function useClothingStore() {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [customSubcategories, setCustomSubcategories] = useState<Record<Category, string[]>>(() => {
    const stored = localStorage.getItem(CUSTOM_SUBCATEGORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      'Hat': [],
      'Top': [],
      'Outerwear': [],
      'Belt': [],
      'Bottom': [],
      'Shoes': [],
      'Socks': [],
      'Base Layer': [],
      'Accessories': [],
    };
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setItems(parsed.map((item: ClothingItem) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      })));
    }
    setIsLoaded(true);
  }, []);

  // Save items to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Save custom subcategories
  useEffect(() => {
    localStorage.setItem(CUSTOM_SUBCATEGORIES_KEY, JSON.stringify(customSubcategories));
  }, [customSubcategories]);

  const getSubcategoriesForCategory = useCallback((category: Category): string[] => {
    const defaults = DEFAULT_SUBCATEGORIES[category] || [];
    const customs = customSubcategories[category] || [];
    return [...defaults, ...customs, 'Other/Custom'];
  }, [customSubcategories]);

  const addCustomSubcategory = useCallback((category: Category, subcategory: string) => {
    setCustomSubcategories(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), subcategory],
    }));
  }, []);

  const addItem = useCallback((item: Omit<ClothingItem, 'id' | 'wearCount' | 'createdAt' | 'updatedAt'>) => {
    const newItem: ClothingItem = {
      ...item,
      id: crypto.randomUUID(),
      wearCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setItems(prev => [newItem, ...prev]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Omit<ClothingItem, 'id' | 'createdAt'>>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    ));
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const incrementWearCount = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, wearCount: item.wearCount + 1, updatedAt: new Date() }
        : item
    ));
  }, []);

  return {
    items,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    incrementWearCount,
    getSubcategoriesForCategory,
    addCustomSubcategory,
    customSubcategories,
  };
}
