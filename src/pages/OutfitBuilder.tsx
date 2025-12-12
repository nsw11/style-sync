import { useState, useMemo } from 'react';
import { Save, Plus } from 'lucide-react';
import { useClothingStore } from '@/hooks/useClothingStore';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { OutfitSectionCard } from '@/components/outfit/OutfitSectionCard';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  OutfitSection, 
  OUTFIT_GRID,
  ADDITIONAL_ACCESSORY_SECTIONS,
  ClothingItem, 
  OutfitSortOption,
  OutfitSectionConfig,
} from '@/types/clothing';

const OutfitBuilder = () => {
  const { items, isLoaded: clothingLoaded } = useClothingStore();
  const { addOutfit } = useOutfitStore();
  const { toast } = useToast();

  const [selectedItems, setSelectedItems] = useState<{ [key in OutfitSection]?: string }>({});
  const [sortOptions, setSortOptions] = useState<{ [key in OutfitSection]: OutfitSortOption }>({
    baseTop: 'recent',
    top: 'recent',
    outerwear: 'recent',
    baseBottom: 'recent',
    bottom: 'recent',
    belt: 'recent',
    socks: 'recent',
    shoes: 'recent',
    hat: 'recent',
    accessory: 'recent',
    additionalAccessory1: 'recent',
    additionalAccessory2: 'recent',
    additionalAccessory3: 'recent',
  });
  const [additionalAccessoryCount, setAdditionalAccessoryCount] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [outfitName, setOutfitName] = useState('');

  const getItemsForSection = (section: OutfitSectionConfig): ClothingItem[] => {
    return items.filter(item => {
      if (item.category !== section.category) return false;
      
      if (section.filterSubcategory) {
        return item.subcategory.startsWith(section.filterSubcategory);
      }
      
      if (section.category === 'Top' || section.category === 'Bottom') {
        return !item.subcategory.startsWith('Base Layer');
      }
      
      return true;
    });
  };

  const selectedItemObjects = useMemo(() => {
    const result: { [key in OutfitSection]?: ClothingItem } = {};
    Object.entries(selectedItems).forEach(([section, itemId]) => {
      if (itemId) {
        const item = items.find(i => i.id === itemId);
        if (item) {
          result[section as OutfitSection] = item;
        }
      }
    });
    return result;
  }, [selectedItems, items]);

  const handleSelectItem = (sectionId: OutfitSection, itemId: string | undefined) => {
    setSelectedItems(prev => ({
      ...prev,
      [sectionId]: itemId,
    }));
  };

  const handleSortChange = (sectionId: OutfitSection, sort: OutfitSortOption) => {
    setSortOptions(prev => ({
      ...prev,
      [sectionId]: sort,
    }));
  };

  const handleAddAccessory = () => {
    if (additionalAccessoryCount < 3) {
      setAdditionalAccessoryCount(prev => prev + 1);
    }
  };

  const handleSave = () => {
    if (!outfitName.trim()) {
      toast({ 
        title: 'Name required', 
        description: 'Please enter a name for your outfit', 
        variant: 'destructive' 
      });
      return;
    }

    addOutfit({
      name: outfitName.trim(),
      items: selectedItems,
    });

    toast({ 
      title: 'Outfit saved!', 
      description: `"${outfitName}" has been added to your collection` 
    });

    setShowSaveDialog(false);
    setOutfitName('');
    setSelectedItems({});
    setAdditionalAccessoryCount(0);
  };

  const hasAnySelection = Object.values(selectedItems).some(id => id);

  const allSections: OutfitSectionConfig[] = [
    ...OUTFIT_GRID.flat().filter(Boolean) as OutfitSectionConfig[],
    ...ADDITIONAL_ACCESSORY_SECTIONS.slice(0, additionalAccessoryCount),
  ];

  if (!clothingLoaded) {
    return (
      <AppLayout title="Outfit Builder" subtitle="Loading...">
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Outfit Builder"
      subtitle="Create a new outfit combination"
      actions={
        <Button 
          onClick={() => setShowSaveDialog(true)}
          disabled={!hasAnySelection}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save Outfit</span>
        </Button>
      }
    >
      <div className="max-w-4xl mx-auto space-y-3">
        {OUTFIT_GRID.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-3">
            {row.map((section, colIndex) => {
              if (!section) {
                if (rowIndex === 3 && colIndex === 2) {
                  return (
                    <div key="add-accessory" className="glass-card rounded-xl p-3 flex flex-col items-center justify-center">
                      <p className="text-xs text-muted-foreground mb-2 text-center">Add Accessories</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddAccessory}
                        disabled={additionalAccessoryCount >= 3}
                        className="gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add ({additionalAccessoryCount}/3)
                      </Button>
                    </div>
                  );
                }
                return (
                  <div key={`empty-${rowIndex}-${colIndex}`} className="glass-card rounded-xl p-3 opacity-30 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">—</span>
                  </div>
                );
              }

              return (
                <OutfitSectionCard
                  key={section.id}
                  section={section}
                  items={getItemsForSection(section)}
                  selectedItemId={selectedItems[section.id]}
                  onSelect={(itemId) => handleSelectItem(section.id, itemId)}
                  sortOption={sortOptions[section.id]}
                  onSortChange={(sort) => handleSortChange(section.id, sort)}
                  compact
                />
              );
            })}
          </div>
        ))}

        {additionalAccessoryCount > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {ADDITIONAL_ACCESSORY_SECTIONS.slice(0, additionalAccessoryCount).map((section) => (
              <OutfitSectionCard
                key={section.id}
                section={section}
                items={getItemsForSection(section)}
                selectedItemId={selectedItems[section.id]}
                onSelect={(itemId) => handleSelectItem(section.id, itemId)}
                sortOption={sortOptions[section.id]}
                onSortChange={(sort) => handleSortChange(section.id, sort)}
                compact
              />
            ))}
          </div>
        )}
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm bg-popover">
          <DialogHeader>
            <DialogTitle>Save Outfit</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="outfit-name" className="mb-2 block">Outfit Name *</Label>
              <Input
                id="outfit-name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="e.g., Casual Friday, Summer Look"
                className="bg-background"
                autoFocus
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>This outfit includes:</p>
              <ul className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                {allSections.map(section => {
                  const item = selectedItemObjects[section.id];
                  return (
                    <li key={section.id} className="flex items-center gap-2">
                      <span className={item ? 'text-primary' : 'text-muted-foreground/50'}>
                        {item ? '✓' : '○'}
                      </span>
                      <span>{section.label}: {item?.subcategory || 'None'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="flex-1"
                onClick={handleSave}
              >
                Save Outfit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default OutfitBuilder;
