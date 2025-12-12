export type Category = 
  | 'Hat'
  | 'Top'
  | 'Outerwear'
  | 'Belt'
  | 'Bottom'
  | 'Shoes'
  | 'Socks'
  | 'Accessories';

export const CATEGORIES: Category[] = [
  'Hat',
  'Top',
  'Outerwear',
  'Belt',
  'Bottom',
  'Shoes',
  'Socks',
  'Accessories',
];

export const DEFAULT_SUBCATEGORIES: Record<Category, string[]> = {
  'Hat': ['Baseball cap', 'Beanie', 'Sun hat', 'Fedora'],
  'Top': ['T-shirt', 'Blouse', 'Sweater', 'Dress', 'Tank top', 'Button-up', 'Base Layer - Undershirt', 'Base Layer - Tank top', 'Base Layer - Thermal'],
  'Outerwear': ['Jacket', 'Coat', 'Hoodie', 'Blazer', 'Vest'],
  'Belt': ['Leather belt', 'Fabric belt', 'Chain belt'],
  'Bottom': ['Jeans', 'Trousers', 'Skirt', 'Shorts', 'Leggings', 'Base Layer - Thermal', 'Base Layer - Leggings'],
  'Shoes': ['Sneakers', 'Boots', 'Dress shoes', 'Sandals', 'Heels', 'Flats'],
  'Socks': ['Ankle socks', 'Crew socks', 'Knee-high', 'No-show'],
  'Accessories': ['Watch', 'Necklace', 'Ring', 'Bracelet', 'Scarf', 'Bag', 'Sunglasses'],
};

// Wear log for tracking individual item wears
export interface WearLog {
  id: string;
  date: Date;
  outfitId?: string; // Optional link to outfit if worn as part of outfit
}

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
  wearLogs: WearLog[];
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
  | 'baseTop'
  | 'top'
  | 'outerwear'
  | 'baseBottom'
  | 'bottom'
  | 'belt'
  | 'socks'
  | 'shoes'
  | 'hat'
  | 'accessory'
  | 'additionalAccessory1'
  | 'additionalAccessory2'
  | 'additionalAccessory3';

export interface OutfitSectionConfig {
  id: OutfitSection;
  label: string;
  category: Category;
  filterSubcategory?: string;
}

export const OUTFIT_GRID: (OutfitSectionConfig | null)[][] = [
  [
    null,
    { id: 'hat', label: 'Hat', category: 'Hat' },
    { id: 'accessory', label: 'Accessory', category: 'Accessories' },
  ],
  [
    { id: 'baseTop', label: 'Base Top', category: 'Top', filterSubcategory: 'Base Layer' },
    { id: 'top', label: 'Top', category: 'Top' },
    { id: 'outerwear', label: 'Outerwear', category: 'Outerwear' },
  ],
  [
    { id: 'baseBottom', label: 'Base Bottom', category: 'Bottom', filterSubcategory: 'Base Layer' },
    { id: 'bottom', label: 'Bottom', category: 'Bottom' },
    { id: 'belt', label: 'Belt', category: 'Belt' },
  ],
  [
    { id: 'socks', label: 'Socks', category: 'Socks' },
    { id: 'shoes', label: 'Shoes', category: 'Shoes' },
    null,
  ],
];

export const ADDITIONAL_ACCESSORY_SECTIONS: OutfitSectionConfig[] = [
  { id: 'additionalAccessory1', label: 'Accessory 2', category: 'Accessories' },
  { id: 'additionalAccessory2', label: 'Accessory 3', category: 'Accessories' },
  { id: 'additionalAccessory3', label: 'Accessory 4', category: 'Accessories' },
];

// Outfit wear log with optional photo
export interface OutfitWearLog {
  id: string;
  date: Date;
  photo?: string; // Base64 or URL
}

export interface Outfit {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    [key in OutfitSection]?: string;
  };
  wearCount: number;
  wearLogs: OutfitWearLog[];
}

export type OutfitSortOption = 'recent' | 'mostWorn' | 'alphabetical' | 'category';

// Stats types
export type StatsSortOption = 'mostWorn' | 'leastWorn' | 'bestValue' | 'worstValue' | 'recent';
