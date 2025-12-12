import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, Plus, Layers, Database } from 'lucide-react';
import { useClothingStore } from '@/hooks/useClothingStore';
import { AddClothingDialog } from '@/components/clothing/AddClothingDialog';
import { ClothingCard } from '@/components/clothing/ClothingCard';
import { FilterBar } from '@/components/clothing/FilterBar';
import { EmptyState } from '@/components/clothing/EmptyState';
import { Button } from '@/components/ui/button';
import { ClothingItem, SortOption, ViewMode, FilterState } from '@/types/clothing';
import { cn } from '@/lib/utils';
import { DEMO_CLOTHING_ITEMS } from '@/lib/demoData';
import { toast } from 'sonner';

const Index = () => {
  const {
    items,
    isLoaded,
    addItem,
    updateItem,
    deleteItem,
    incrementWearCount,
    getSubcategoriesForCategory,
    addCustomSubcategory,
  } = useClothingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    subcategories: [],
    hasCost: 'all',
  });
  const [editItem, setEditItem] = useState<ClothingItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Search filter
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

    // Category filter
    if (filters.categories.length > 0) {
      result = result.filter((item) => filters.categories.includes(item.category));
    }

    // Subcategory filter
    if (filters.subcategories.length > 0) {
      result = result.filter((item) => filters.subcategories.includes(item.subcategory));
    }

    // Cost filter
    if (filters.hasCost === 'with') {
      result = result.filter((item) => item.cost !== undefined);
    } else if (filters.hasCost === 'without') {
      result = result.filter((item) => item.cost === undefined);
    }

    // Sorting
    switch (sortOption) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'subcategory':
        result.sort((a, b) => a.subcategory.localeCompare(b.subcategory));
        break;
      case 'mostWorn':
        result.sort((a, b) => b.wearCount - a.wearCount);
        break;
      case 'leastWorn':
        result.sort((a, b) => a.wearCount - b.wearCount);
        break;
      case 'costHigh':
        result.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
        break;
      case 'costLow':
        result.sort((a, b) => (a.cost ?? 0) - (b.cost ?? 0));
        break;
    }

    return result;
  }, [items, searchQuery, sortOption, filters]);

  const handleEdit = (item: ClothingItem) => {
    setEditItem(item);
    setShowAddDialog(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setShowAddDialog(open);
    if (!open) setEditItem(null);
  };

  const isFiltered = searchQuery || filters.categories.length > 0 || filters.subcategories.length > 0 || filters.hasCost !== 'all';

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Shirt className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Loading your closet...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shirt className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">My Closet</h1>
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  DEMO_CLOTHING_ITEMS.forEach((item) => addItem(item));
                  toast.success(`Added ${DEMO_CLOTHING_ITEMS.length} demo items to your closet`);
                }}
                className="gap-2"
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Load Demo</span>
              </Button>

              <Link to="/outfit-builder">
                <Button variant="outline" className="gap-2">
                  <Layers className="w-4 h-4" />
                  <span className="hidden sm:inline">Outfit Builder</span>
                </Button>
              </Link>

              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Item</span>
              </Button>
            </div>

            <AddClothingDialog
              onAdd={addItem}
              getSubcategoriesForCategory={getSubcategoriesForCategory}
              addCustomSubcategory={addCustomSubcategory}
              editItem={editItem}
              onUpdate={updateItem}
              open={showAddDialog}
              onOpenChange={handleCloseDialog}
              triggerButton={false}
            />
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        {items.length > 0 && (
          <div className="mb-6">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortOption={sortOption}
              onSortChange={setSortOption}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              filters={filters}
              onFiltersChange={setFilters}
              items={items}
            />
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState onAddClick={() => setShowAddDialog(true)} />
        ) : filteredAndSortedItems.length === 0 ? (
          <EmptyState onAddClick={() => setShowAddDialog(true)} isFiltered />
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                : 'flex flex-col gap-3'
            )}
          >
            {filteredAndSortedItems.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                viewMode={viewMode}
                onEdit={handleEdit}
                onDelete={deleteItem}
                onWear={incrementWearCount}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
