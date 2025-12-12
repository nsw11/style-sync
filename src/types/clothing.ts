export type Category = 
  | 'Hat'
  | 'Top'
  | 'Outerwear'
  | 'Belt'
  | 'Bottom'
  | 'Shoes'
  | 'Socks'
  | 'Base Layer'
  | 'Accessories';

export const CATEGORIES: Category[] = [
  'Hat',
  'Top',
  'Outerwear',
  'Belt',
  'Bottom',
  'Shoes',
  'Socks',
  'Base Layer',
  'Accessories',
];

export const DEFAULT_SUBCATEGORIES: Record<Category, string[]> = {
  'Hat': ['Baseball cap', 'Beanie', 'Sun hat', 'Fedora'],
  'Top': ['T-shirt', 'Blouse', 'Sweater', 'Dress', 'Tank top', 'Button-up'],
  'Outerwear': ['Jacket', 'Coat', 'Hoodie', 'Blazer', 'Vest'],
  'Belt': ['Leather belt', 'Fabric belt', 'Chain belt'],
  'Bottom': ['Jeans', 'Trousers', 'Skirt', 'Shorts', 'Leggings'],
  'Shoes': ['Sneakers', 'Boots', 'Dress shoes', 'Sandals', 'Heels', 'Flats'],
  'Socks': ['Ankle socks', 'Crew socks', 'Knee-high', 'No-show'],
  'Base Layer': ['Undershirt', 'Tank top', 'Thermal', 'Leggings'],
  'Accessories': ['Watch', 'Necklace', 'Ring', 'Bracelet', 'Scarf', 'Bag', 'Sunglasses'],
};

export interface ClothingItem {
  id: string;
  image: string;
  category: Category;
  subcategory: string;
  size?: string;
  origin?: string;
  cost?: number;
  description?: string;
  wearCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type SortOption = 
  | 'recent'
  | 'alphabetical'
  | 'category'
  | 'subcategory'
  | 'mostWorn'
  | 'leastWorn'
  | 'costHigh'
  | 'costLow';

export type ViewMode = 'grid' | 'list';

export interface FilterState {
  categories: Category[];
  subcategories: string[];
  hasCost: 'all' | 'with' | 'without';
}

// Outfit Builder Types
export type OutfitSection = 
  | 'hat'
  | 'top'
  | 'outerwear'
  | 'belt'
  | 'bottom'
  | 'shoes'
  | 'accessories';

export const OUTFIT_SECTIONS: { id: OutfitSection; label: string; mergedCategories: Category[] }[] = [
  { id: 'hat', label: 'Hat', mergedCategories: ['Hat'] },
  { id: 'top', label: 'Top / Base Layer', mergedCategories: ['Top', 'Base Layer'] },
  { id: 'outerwear', label: 'Outerwear', mergedCategories: ['Outerwear'] },
  { id: 'belt', label: 'Belt', mergedCategories: ['Belt'] },
  { id: 'bottom', label: 'Bottom', mergedCategories: ['Bottom'] },
  { id: 'shoes', label: 'Shoes / Socks', mergedCategories: ['Shoes', 'Socks'] },
  { id: 'accessories', label: 'Accessories', mergedCategories: ['Accessories'] },
];

export interface Outfit {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    [key in OutfitSection]?: string; // clothing item ID
  };
  accessoriesEnabled: boolean;
}

export type OutfitSortOption = 'recent' | 'mostWorn' | 'alphabetical' | 'category';
