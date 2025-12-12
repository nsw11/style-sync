import { Search, Grid3X3, List, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Category, CATEGORIES, SortOption, ViewMode, FilterState } from '@/types/clothing';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableSubcategories: string[];
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'alphabetical', label: 'Alphabetically' },
  { value: 'category', label: 'By Category' },
  { value: 'subcategory', label: 'By Subcategory' },
  { value: 'mostWorn', label: 'Most Worn' },
  { value: 'leastWorn', label: 'Least Worn' },
  { value: 'costHigh', label: 'Cost: High to Low' },
  { value: 'costLow', label: 'Cost: Low to High' },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  availableSubcategories,
}: FilterBarProps) {
  const activeFilterCount = filters.categories.length + filters.subcategories.length + (filters.hasCost !== 'all' ? 1 : 0);

  const toggleCategory = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleSubcategory = (subcategory: string) => {
    const newSubcategories = filters.subcategories.includes(subcategory)
      ? filters.subcategories.filter(s => s !== subcategory)
      : [...filters.subcategories, subcategory];
    onFiltersChange({ ...filters, subcategories: newSubcategories });
  };

  const clearFilters = () => {
    onFiltersChange({ categories: [], subcategories: [], hasCost: 'all' });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search your closet..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-background"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative bg-background">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 bg-popover z-50" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Filters</h4>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-primary hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div>
                <Label className="text-sm mb-2 block">Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                      />
                      {category}
                    </label>
                  ))}
                </div>
              </div>

              {availableSubcategories.length > 0 && (
                <div>
                  <Label className="text-sm mb-2 block">Subcategories</Label>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {availableSubcategories.map((subcategory) => (
                      <label
                        key={subcategory}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={filters.subcategories.includes(subcategory)}
                          onCheckedChange={() => toggleSubcategory(subcategory)}
                        />
                        {subcategory}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm mb-2 block">Cost Data</Label>
                <Select
                  value={filters.hasCost}
                  onValueChange={(v: 'all' | 'with' | 'without') =>
                    onFiltersChange({ ...filters, hasCost: v })
                  }
                >
                  <SelectTrigger className="w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="all">All items</SelectItem>
                    <SelectItem value="with">With cost</SelectItem>
                    <SelectItem value="without">Without cost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex border border-border rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
