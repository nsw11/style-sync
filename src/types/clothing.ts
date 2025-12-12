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
  filterSubcategory?: string; // Filter for specific subcategory prefix
}

// Grid layout: 4 rows x 3 columns
// Row 1: [empty], Hat, Accessory
// Row 2: Base Top, Top, Outerwear  
// Row 3: Base Bottom, Bottom, Belt
// Row 4: Socks, Shoes, [additional accessories]
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
    null, // Placeholder for additional accessories button
  ],
];

export const ADDITIONAL_ACCESSORY_SECTIONS: OutfitSectionConfig[] = [
  { id: 'additionalAccessory1', label: 'Accessory 2', category: 'Accessories' },
  { id: 'additionalAccessory2', label: 'Accessory 3', category: 'Accessories' },
  { id: 'additionalAccessory3', label: 'Accessory 4', category: 'Accessories' },
];

export interface Outfit {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    [key in OutfitSection]?: string; // clothing item ID
  };
}

export type OutfitSortOption = 'recent' | 'mostWorn' | 'alphabetical' | 'category';
