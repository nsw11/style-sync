import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { ClothingItem, OutfitSection, OutfitSectionConfig, OutfitSortOption } from '@/types/clothing';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMemo } from 'react';

interface OutfitSectionCardProps {
  section: OutfitSectionConfig;
  items: ClothingItem[];
  selectedItemId?: string;
  onSelect: (itemId: string | undefined) => void;
  sortOption: OutfitSortOption;
  onSortChange: (sort: OutfitSortOption) => void;
  disabled?: boolean;
  compact?: boolean;
}

const sortOptions: { value: OutfitSortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'mostWorn', label: 'Most Worn' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'category', label: 'By Category' },
];

export function OutfitSectionCard({
  section,
  items,
  selectedItemId,
  onSelect,
  sortOption,
  onSortChange,
  disabled = false,
  compact = false,
}: OutfitSectionCardProps) {
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortOption) {
      case 'recent':
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'mostWorn':
        sorted.sort((a, b) => b.wearCount - a.wearCount);
        break;
      case 'alphabetical':
        sorted.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
        break;
      case 'category':
        sorted.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category);
          if (catCompare !== 0) return catCompare;
          return a.subcategory.localeCompare(b.subcategory);
        });
        break;
    }
    return sorted;
  }, [items, sortOption]);

  const currentIndex = selectedItemId 
    ? sortedItems.findIndex(item => item.id === selectedItemId)
    : -1;
  
  const selectedItem = currentIndex >= 0 ? sortedItems[currentIndex] : null;

  const handlePrev = () => {
    if (sortedItems.length === 0) return;
    if (currentIndex <= 0) {
      onSelect(sortedItems[sortedItems.length - 1].id);
    } else {
      onSelect(sortedItems[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (sortedItems.length === 0) return;
    if (currentIndex === -1 || currentIndex >= sortedItems.length - 1) {
      onSelect(sortedItems[0].id);
    } else {
      onSelect(sortedItems[currentIndex + 1].id);
    }
  };

  const handleClear = () => {
    onSelect(undefined);
  };

  return (
    <div className={cn(
      "glass-card rounded-xl p-3 transition-all",
      disabled && "opacity-50 pointer-events-none",
      compact && "p-2"
    )}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={cn("font-medium text-foreground", compact && "text-sm")}>
          {section.label}
        </h3>
        {!compact && (
          <Select value={sortOption} onValueChange={(v) => onSortChange(v as OutfitSortOption)}>
            <SelectTrigger className="w-[100px] h-7 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handlePrev}
          disabled={sortedItems.length === 0}
          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>

        <div className="flex-1 aspect-square relative rounded-lg overflow-hidden bg-muted border border-border">
          {selectedItem ? (
            <>
              <img
                src={selectedItem.image}
                alt={selectedItem.subcategory}
                className="w-full h-full object-cover animate-scale-in"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-1.5">
                <p className="text-[10px] font-medium text-background truncate">
                  {selectedItem.subcategory}
                </p>
              </div>
              <button
                onClick={handleClear}
                className="absolute top-1 right-1 p-0.5 rounded bg-background/80 hover:bg-background text-foreground text-[10px]"
              >
                ✕
              </button>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ImageOff className="w-6 h-6 mb-1" />
              <p className="text-[10px] text-center px-1">
                {sortedItems.length === 0 
                  ? 'None' 
                  : 'Select'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleNext}
          disabled={sortedItems.length === 0}
          className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      <div className="mt-1 text-center text-[10px] text-muted-foreground">
        {sortedItems.length > 0 ? (
          <span>{currentIndex >= 0 ? currentIndex + 1 : 0} / {sortedItems.length}</span>
        ) : (
          <span>No items</span>
        )}
      </div>
    </div>
  );
}