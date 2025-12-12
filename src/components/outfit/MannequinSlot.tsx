import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, Search, X } from 'lucide-react';
import { ClothingItem, OutfitSectionConfig, OutfitSortOption } from '@/types/clothing';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MannequinSlotProps {
  section: OutfitSectionConfig;
  items: ClothingItem[];
  selectedItemId?: string;
  onSelect: (itemId: string | undefined) => void;
  sortOption: OutfitSortOption;
  onSortChange: (sort: OutfitSortOption) => void;
  className?: string;
}

const sortOptions: { value: OutfitSortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'mostWorn', label: 'Most Worn' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'category', label: 'By Category' },
];

export function MannequinSlot({
  section,
  items,
  selectedItemId,
  onSelect,
  sortOption,
  onSortChange,
  className,
}: MannequinSlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.subcategory.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.origin?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortOption) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'mostWorn':
        result.sort((a, b) => b.wearCount - a.wearCount);
        break;
      case 'alphabetical':
        result.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
        break;
      case 'category':
        result.sort((a, b) => {
          const catCompare = a.category.localeCompare(b.category);
          if (catCompare !== 0) return catCompare;
          return a.subcategory.localeCompare(b.subcategory);
        });
        break;
    }
    return result;
  }, [items, sortOption, searchQuery]);

  const selectedItem = selectedItemId ? items.find(i => i.id === selectedItemId) : null;

  const currentIndex = selectedItemId 
    ? filteredAndSortedItems.findIndex(item => item.id === selectedItemId)
    : -1;

  const handlePrev = () => {
    if (filteredAndSortedItems.length === 0) return;
    if (currentIndex <= 0) {
      onSelect(filteredAndSortedItems[filteredAndSortedItems.length - 1].id);
    } else {
      onSelect(filteredAndSortedItems[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (filteredAndSortedItems.length === 0) return;
    if (currentIndex === -1 || currentIndex >= filteredAndSortedItems.length - 1) {
      onSelect(filteredAndSortedItems[0].id);
    } else {
      onSelect(filteredAndSortedItems[currentIndex + 1].id);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(undefined);
  };

  const handleSelectFromGrid = (itemId: string) => {
    onSelect(itemId);
    setIsOpen(false);
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      {/* Label */}
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {section.label}
      </span>

      {/* Slot with popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "w-20 h-20 rounded-xl border-2 border-dashed transition-all duration-200 relative group overflow-hidden",
              selectedItem 
                ? "border-primary bg-card shadow-md" 
                : "border-muted-foreground/30 bg-muted/50 hover:border-primary/50 hover:bg-muted"
            )}
          >
            {selectedItem ? (
              <>
                <img
                  src={selectedItem.image}
                  alt={selectedItem.subcategory}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={handleClear}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-muted-foreground/50" />
              </div>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent 
          className="w-80 p-0 bg-popover border-border shadow-xl z-50" 
          align="center" 
          sideOffset={8}
          collisionPadding={16}
          avoidCollisions={true}
        >
          {/* Header with search and sort */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-foreground">{section.label}</h4>
              <Select value={sortOption} onValueChange={(v) => onSortChange(v as OutfitSortOption)}>
                <SelectTrigger className="w-28 h-7 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover z-[60]">
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 h-8 text-sm bg-background"
              />
            </div>
          </div>

          {/* Navigation arrows */}
          {filteredAndSortedItems.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-background hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <span className="text-xs text-muted-foreground">
                {currentIndex >= 0 ? currentIndex + 1 : 0} / {filteredAndSortedItems.length}
              </span>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-background hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
            </div>
          )}

          {/* Item grid */}
          <div className="p-2 max-h-64 overflow-y-auto">
            {filteredAndSortedItems.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                {items.length === 0 ? 'No items in closet' : 'No matching items'}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {filteredAndSortedItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectFromGrid(item.id)}
                    className={cn(
                      "aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                      selectedItemId === item.id 
                        ? "border-primary ring-2 ring-primary/30" 
                        : "border-transparent hover:border-primary/50"
                    )}
                  >
                    <img
                      src={item.image}
                      alt={item.subcategory}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Clear selection */}
          {selectedItem && (
            <div className="p-2 border-t border-border">
              <button
                onClick={(e) => { handleClear(e); setIsOpen(false); }}
                className="w-full py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear selection
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Item name */}
      {selectedItem && (
        <span className="text-[10px] text-foreground font-medium truncate max-w-20 text-center">
          {selectedItem.subcategory}
        </span>
      )}
    </div>
  );
}
