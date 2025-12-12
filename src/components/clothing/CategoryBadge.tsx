import { Category } from '@/types/clothing';
import { cn } from '@/lib/utils';

const categoryColors: Record<Category, string> = {
  'Hat': 'bg-category-hat/20 text-category-hat border-category-hat/30',
  'Top': 'bg-category-top/20 text-category-top border-category-top/30',
  'Outerwear': 'bg-category-outerwear/20 text-category-outerwear border-category-outerwear/30',
  'Belt': 'bg-category-belt/20 text-category-belt border-category-belt/30',
  'Bottom': 'bg-category-bottom/20 text-category-bottom border-category-bottom/30',
  'Shoes': 'bg-category-shoes/20 text-category-shoes border-category-shoes/30',
  'Socks': 'bg-category-socks/20 text-category-socks border-category-socks/30',
  'Accessories': 'bg-category-accessories/20 text-category-accessories border-category-accessories/30',
};

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        categoryColors[category],
        className
      )}
    >
      {category}
    </span>
  );
}
