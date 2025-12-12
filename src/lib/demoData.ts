import { Category } from '@/types/clothing';

interface DemoItem {
  image: string;
  category: Category;
  subcategory: string;
  size?: string;
  origin?: string;
  cost?: number;
  description?: string;
  wearCount: number;
}

export const DEMO_CLOTHING_ITEMS: DemoItem[] = [
  // Hats
  {
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
    category: 'Hat',
    subcategory: 'Baseball cap',
    size: 'One Size',
    origin: 'Nike',
    cost: 35,
    description: 'Classic black Nike cap with embroidered swoosh',
    wearCount: 24,
  },
  {
    image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&h=400&fit=crop',
    category: 'Hat',
    subcategory: 'Beanie',
    wearCount: 12,
  },
  
  // Tops
  {
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    category: 'Top',
    subcategory: 'T-shirt',
    size: 'M',
    origin: 'Uniqlo',
    cost: 15,
    description: 'Plain white cotton tee',
    wearCount: 45,
  },
  {
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop',
    category: 'Top',
    subcategory: 'Button-up',
    size: 'M',
    origin: 'J.Crew',
    cost: 78,
    wearCount: 18,
  },
  {
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop',
    category: 'Top',
    subcategory: 'Sweater',
    size: 'L',
    description: 'Cozy knit sweater for fall',
    wearCount: 9,
  },
  {
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
    category: 'Top',
    subcategory: 'Base Layer - Undershirt',
    size: 'M',
    wearCount: 30,
  },
  
  // Outerwear
  {
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop',
    category: 'Outerwear',
    subcategory: 'Jacket',
    size: 'M',
    origin: 'Levi\'s',
    cost: 120,
    description: 'Classic denim trucker jacket',
    wearCount: 32,
  },
  {
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
    category: 'Outerwear',
    subcategory: 'Coat',
    size: 'L',
    cost: 250,
    wearCount: 15,
  },
  {
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
    category: 'Outerwear',
    subcategory: 'Hoodie',
    size: 'L',
    origin: 'Champion',
    wearCount: 42,
  },
  
  // Belts
  {
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&h=400&fit=crop',
    category: 'Belt',
    subcategory: 'Leather belt',
    size: '34',
    origin: 'Coach',
    cost: 85,
    description: 'Brown leather dress belt',
    wearCount: 56,
  },
  {
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop',
    category: 'Belt',
    subcategory: 'Fabric belt',
    wearCount: 8,
  },
  
  // Bottoms
  {
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
    category: 'Bottom',
    subcategory: 'Jeans',
    size: '32x32',
    origin: 'Levi\'s 501',
    cost: 89,
    description: 'Classic straight fit jeans',
    wearCount: 67,
  },
  {
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=400&fit=crop',
    category: 'Bottom',
    subcategory: 'Trousers',
    size: '32',
    origin: 'Banana Republic',
    cost: 98,
    wearCount: 23,
  },
  {
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop',
    category: 'Bottom',
    subcategory: 'Shorts',
    size: 'M',
    wearCount: 14,
  },
  {
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=400&fit=crop',
    category: 'Bottom',
    subcategory: 'Base Layer - Leggings',
    size: 'M',
    cost: 45,
    wearCount: 5,
  },
  
  // Shoes
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop',
    category: 'Shoes',
    subcategory: 'Sneakers',
    size: '10',
    origin: 'Nike Air Max',
    cost: 180,
    description: 'Red running sneakers',
    wearCount: 89,
  },
  {
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&h=400&fit=crop',
    category: 'Shoes',
    subcategory: 'Boots',
    size: '10',
    origin: 'Dr. Martens',
    cost: 170,
    wearCount: 34,
  },
  {
    image: 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&h=400&fit=crop',
    category: 'Shoes',
    subcategory: 'Dress shoes',
    size: '10',
    description: 'Oxford dress shoes for formal occasions',
    wearCount: 11,
  },
  
  // Socks
  {
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&h=400&fit=crop',
    category: 'Socks',
    subcategory: 'Crew socks',
    size: 'M',
    origin: 'Happy Socks',
    cost: 14,
    description: 'Colorful patterned crew socks',
    wearCount: 28,
  },
  {
    image: 'https://images.unsplash.com/photo-1631006254555-de53b06dab53?w=400&h=400&fit=crop',
    category: 'Socks',
    subcategory: 'Ankle socks',
    wearCount: 50,
  },
  {
    image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400&h=400&fit=crop',
    category: 'Socks',
    subcategory: 'No-show',
    size: 'M',
    cost: 8,
    wearCount: 35,
  },
  
  // Accessories
  {
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop',
    category: 'Accessories',
    subcategory: 'Watch',
    origin: 'Seiko',
    cost: 450,
    description: 'Automatic dress watch with leather strap',
    wearCount: 120,
  },
  {
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop',
    category: 'Accessories',
    subcategory: 'Sunglasses',
    origin: 'Ray-Ban',
    cost: 165,
    wearCount: 45,
  },
  {
    image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=400&fit=crop',
    category: 'Accessories',
    subcategory: 'Scarf',
    description: 'Wool scarf for winter',
    wearCount: 7,
  },
  {
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    category: 'Accessories',
    subcategory: 'Bag',
    origin: 'Herschel',
    cost: 80,
    description: 'Canvas backpack',
    wearCount: 92,
  },
];
