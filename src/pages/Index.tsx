import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useClothingStore } from '@/hooks/useClothingStore';
import { AddClothingDialog } from '@/components/clothing/AddClothingDialog';
import { ClothingCard } from '@/components/clothing/ClothingCard';
import { FilterBar } from '@/components/clothing/FilterBar';
import { EmptyState } from '@/components/clothing/EmptyState';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { ClothingItem, SortOption, ViewMode, FilterState } from '@/types/clothing';
import { cn } from '@/lib/utils';

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

    if (filters.categories.length > 0) {
      result = result.filter((item) => filters.categories.includes(item.category));
    }

    if (filters.subcategories.length > 0) {
      result = result.filter((item) => filters.subcategories.includes(item.subcategory));
    }

    if (filters.hasCost === 'with') {
      result = result.filter((item) => item.cost !== undefined);
    } else if (filters.hasCost === 'without') {
      result = result.filter((item) => item.cost === undefined);
    }

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

  if (!isLoaded) {
    return (
      <AppLayout title="My Closet" subtitle="Loading...">
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-muted-foreground">Loading your closet...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="My Closet"
      subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}
      actions={
        <>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
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
        </>
      }
    >
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
    </AppLayout>
  );
};

export default Index;
