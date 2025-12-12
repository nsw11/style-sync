import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shirt, ArrowLeft, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { useClothingStore } from '@/hooks/useClothingStore';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { OutfitSectionCard } from '@/components/outfit/OutfitSectionCard';
import { OutfitPreview } from '@/components/outfit/OutfitPreview';
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
  OUTFIT_SECTIONS, 
  ClothingItem, 
  OutfitSortOption 
} from '@/types/clothing';

const OutfitBuilder = () => {
  const { items, isLoaded: clothingLoaded } = useClothingStore();
  const { addOutfit } = useOutfitStore();
  const { toast } = useToast();

  const [selectedItems, setSelectedItems] = useState<{ [key in OutfitSection]?: string }>({});
  const [sortOptions, setSortOptions] = useState<{ [key in OutfitSection]: OutfitSortOption }>({
    hat: 'recent',
    top: 'recent',
    outerwear: 'recent',
    belt: 'recent',
    bottom: 'recent',
    shoes: 'recent',
    accessories: 'recent',
  });
  const [accessoriesEnabled, setAccessoriesEnabled] = useState(true);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [outfitName, setOutfitName] = useState('');

  // Group items by merged categories
  const itemsBySection = useMemo(() => {
    const grouped: { [key in OutfitSection]: ClothingItem[] } = {
      hat: [],
      top: [],
      outerwear: [],
      belt: [],
      bottom: [],
      shoes: [],
      accessories: [],
    };

    items.forEach(item => {
      OUTFIT_SECTIONS.forEach(section => {
        if (section.mergedCategories.includes(item.category)) {
          grouped[section.id].push(item);
        }
      });
    });

    return grouped;
  }, [items]);

  // Get selected items as full objects for preview
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

  const handleSave = () => {
    if (!outfitName.trim()) {
      toast({ 
        title: 'Name required', 
        description: 'Please enter a name for your outfit', 
        variant: 'destructive' 
      });
      return;
    }

    const outfitItems = { ...selectedItems };
    if (!accessoriesEnabled) {
      delete outfitItems.accessories;
    }

    addOutfit({
      name: outfitName.trim(),
      items: outfitItems,
      accessoriesEnabled,
    });

    toast({ 
      title: 'Outfit saved!', 
      description: `"${outfitName}" has been added to your collection` 
    });

    setShowSaveDialog(false);
    setOutfitName('');
    setSelectedItems({});
  };

  const hasAnySelection = Object.values(selectedItems).some(id => id);

  if (!clothingLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Shirt className="w-6 h-6 text-primary" />
          <span className="text-muted-foreground">Loading...</span>
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
              <Link 
                to="/" 
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Outfit Builder</h1>
                <p className="text-sm text-muted-foreground">
                  Create a new outfit combination
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setShowSaveDialog(true)}
              disabled={!hasAnySelection}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Outfit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-4">
            {/* Accessories Toggle */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm text-muted-foreground">Accessories</span>
              <button
                onClick={() => setAccessoriesEnabled(!accessoriesEnabled)}
                className="text-primary"
              >
                {accessoriesEnabled ? (
                  <ToggleRight className="w-8 h-8" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Section Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {OUTFIT_SECTIONS.map((section) => (
                <OutfitSectionCard
                  key={section.id}
                  sectionId={section.id}
                  items={itemsBySection[section.id]}
                  selectedItemId={selectedItems[section.id]}
                  onSelect={(itemId) => handleSelectItem(section.id, itemId)}
                  sortOption={sortOptions[section.id]}
                  onSortChange={(sort) => handleSortChange(section.id, sort)}
                  disabled={section.id === 'accessories' && !accessoriesEnabled}
                />
              ))}
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <OutfitPreview 
              selectedItems={selectedItemObjects} 
              accessoriesEnabled={accessoriesEnabled}
            />
          </div>
        </div>
      </main>

      {/* Save Dialog */}
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
              <ul className="mt-1 space-y-1">
                {OUTFIT_SECTIONS.map(section => {
                  if (section.id === 'accessories' && !accessoriesEnabled) return null;
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
    </div>
  );
};

export default OutfitBuilder;
