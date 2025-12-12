import { useState, useMemo } from 'react';
import { Save, Plus, User, Camera, X } from 'lucide-react';
import { useClothingStore } from '@/hooks/useClothingStore';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { MannequinSlot } from '@/components/outfit/MannequinSlot';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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

// Define mannequin layout positions
const MANNEQUIN_SECTIONS: { section: OutfitSectionConfig; position: string }[] = [
  { section: { id: 'hat', label: 'Hat', category: 'Hat' }, position: 'top-0 left-1/2 -translate-x-1/2' },
  { section: { id: 'accessory', label: 'Accessory', category: 'Accessories' }, position: 'top-4 right-0' },
  { section: { id: 'baseTop', label: 'Base Top', category: 'Top', filterSubcategory: 'Base Layer' }, position: 'top-28 left-0' },
  { section: { id: 'top', label: 'Top', category: 'Top' }, position: 'top-28 left-1/2 -translate-x-1/2' },
  { section: { id: 'outerwear', label: 'Outerwear', category: 'Outerwear' }, position: 'top-28 right-0' },
  { section: { id: 'belt', label: 'Belt', category: 'Belt' }, position: 'top-56 right-0' },
  { section: { id: 'baseBottom', label: 'Base Bottom', category: 'Bottom', filterSubcategory: 'Base Layer' }, position: 'top-56 left-0' },
  { section: { id: 'bottom', label: 'Bottom', category: 'Bottom' }, position: 'top-56 left-1/2 -translate-x-1/2' },
  { section: { id: 'socks', label: 'Socks', category: 'Socks' }, position: 'top-[336px] left-0' },
  { section: { id: 'shoes', label: 'Shoes', category: 'Shoes' }, position: 'top-[336px] left-1/2 -translate-x-1/2' },
];

const OutfitBuilder = () => {
  const { items, isLoaded: clothingLoaded, logWear } = useClothingStore();
  const { addOutfit, logOutfitWear } = useOutfitStore();
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
  const [logWearOnSave, setLogWearOnSave] = useState(true);
  const [fitPic, setFitPic] = useState<string>('');

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

    const newOutfit = addOutfit({
      name: outfitName.trim(),
      items: selectedItems,
    });

    // If "I wore this outfit" is checked, log wear for outfit and all items
    if (logWearOnSave && newOutfit) {
      const itemIds = logOutfitWear(newOutfit.id, fitPic || undefined);
      itemIds.forEach(id => logWear(id, newOutfit.id));
      
      toast({ 
        title: 'Outfit saved & worn!', 
        description: `"${outfitName}" saved with wear logged for ${itemIds.length} items` 
      });
    } else {
      toast({ 
        title: 'Outfit saved!', 
        description: `"${outfitName}" has been added to your collection` 
      });
    }

    setShowSaveDialog(false);
    setOutfitName('');
    setSelectedItems({});
    setAdditionalAccessoryCount(0);
    setLogWearOnSave(true);
    setFitPic('');
  };

  const handleFitPicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFitPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const hasAnySelection = Object.values(selectedItems).some(id => id);

  const allSections: OutfitSectionConfig[] = [
    ...MANNEQUIN_SECTIONS.map(m => m.section),
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
      subtitle="Click on a slot to add clothing"
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
      <div className="max-w-3xl mx-auto">
        {/* Mannequin layout */}
        <div className="relative bg-gradient-to-b from-muted/30 to-muted/60 rounded-3xl p-8 min-h-[520px]">
          {/* Center silhouette */}
          <div className="absolute left-1/2 top-8 -translate-x-1/2 w-32 h-[420px] flex flex-col items-center opacity-10 pointer-events-none">
            <User className="w-full h-full text-foreground" strokeWidth={0.5} />
          </div>

          {/* Clothing slots grid */}
          <div className="grid grid-cols-3 gap-y-6 gap-x-4 relative z-10">
            {/* Row 1: Hat (center), Accessory (right) */}
            <div /> {/* empty left */}
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'hat', label: 'Hat', category: 'Hat' }}
                items={getItemsForSection({ id: 'hat', label: 'Hat', category: 'Hat' })}
                selectedItemId={selectedItems.hat}
                onSelect={(id) => handleSelectItem('hat', id)}
                sortOption={sortOptions.hat}
                onSortChange={(sort) => handleSortChange('hat', sort)}
              />
            </div>
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'accessory', label: 'Accessory', category: 'Accessories' }}
                items={getItemsForSection({ id: 'accessory', label: 'Accessory', category: 'Accessories' })}
                selectedItemId={selectedItems.accessory}
                onSelect={(id) => handleSelectItem('accessory', id)}
                sortOption={sortOptions.accessory}
                onSortChange={(sort) => handleSortChange('accessory', sort)}
              />
            </div>

            {/* Row 2: Base Top, Top, Outerwear */}
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'baseTop', label: 'Base Top', category: 'Top', filterSubcategory: 'Base Layer' }}
                items={getItemsForSection({ id: 'baseTop', label: 'Base Top', category: 'Top', filterSubcategory: 'Base Layer' })}
                selectedItemId={selectedItems.baseTop}
                onSelect={(id) => handleSelectItem('baseTop', id)}
                sortOption={sortOptions.baseTop}
                onSortChange={(sort) => handleSortChange('baseTop', sort)}
              />
            </div>
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'top', label: 'Top', category: 'Top' }}
                items={getItemsForSection({ id: 'top', label: 'Top', category: 'Top' })}
                selectedItemId={selectedItems.top}
                onSelect={(id) => handleSelectItem('top', id)}
                sortOption={sortOptions.top}
                onSortChange={(sort) => handleSortChange('top', sort)}
              />
            </div>
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'outerwear', label: 'Outerwear', category: 'Outerwear' }}
                items={getItemsForSection({ id: 'outerwear', label: 'Outerwear', category: 'Outerwear' })}
                selectedItemId={selectedItems.outerwear}
                onSelect={(id) => handleSelectItem('outerwear', id)}
                sortOption={sortOptions.outerwear}
                onSortChange={(sort) => handleSortChange('outerwear', sort)}
              />
            </div>

            {/* Row 3: Base Bottom, Bottom, Belt */}
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'baseBottom', label: 'Base Bottom', category: 'Bottom', filterSubcategory: 'Base Layer' }}
                items={getItemsForSection({ id: 'baseBottom', label: 'Base Bottom', category: 'Bottom', filterSubcategory: 'Base Layer' })}
                selectedItemId={selectedItems.baseBottom}
                onSelect={(id) => handleSelectItem('baseBottom', id)}
                sortOption={sortOptions.baseBottom}
                onSortChange={(sort) => handleSortChange('baseBottom', sort)}
              />
            </div>
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'bottom', label: 'Bottom', category: 'Bottom' }}
                items={getItemsForSection({ id: 'bottom', label: 'Bottom', category: 'Bottom' })}
                selectedItemId={selectedItems.bottom}
                onSelect={(id) => handleSelectItem('bottom', id)}
                sortOption={sortOptions.bottom}
                onSortChange={(sort) => handleSortChange('bottom', sort)}
              />
            </div>
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'belt', label: 'Belt', category: 'Belt' }}
                items={getItemsForSection({ id: 'belt', label: 'Belt', category: 'Belt' })}
                selectedItemId={selectedItems.belt}
                onSelect={(id) => handleSelectItem('belt', id)}
                sortOption={sortOptions.belt}
                onSortChange={(sort) => handleSortChange('belt', sort)}
              />
            </div>

            {/* Row 4: Socks, Shoes, Add Accessories */}
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'socks', label: 'Socks', category: 'Socks' }}
                items={getItemsForSection({ id: 'socks', label: 'Socks', category: 'Socks' })}
                selectedItemId={selectedItems.socks}
                onSelect={(id) => handleSelectItem('socks', id)}
                sortOption={sortOptions.socks}
                onSortChange={(sort) => handleSortChange('socks', sort)}
              />
            </div>
            <div className="flex justify-center">
              <MannequinSlot
                section={{ id: 'shoes', label: 'Shoes', category: 'Shoes' }}
                items={getItemsForSection({ id: 'shoes', label: 'Shoes', category: 'Shoes' })}
                selectedItemId={selectedItems.shoes}
                onSelect={(id) => handleSelectItem('shoes', id)}
                sortOption={sortOptions.shoes}
                onSortChange={(sort) => handleSortChange('shoes', sort)}
              />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                More
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddAccessory}
                disabled={additionalAccessoryCount >= 3}
                className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col gap-1"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px]">{additionalAccessoryCount}/3</span>
              </Button>
            </div>
          </div>

          {/* Additional Accessories */}
          {additionalAccessoryCount > 0 && (
            <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-border/50">
              {ADDITIONAL_ACCESSORY_SECTIONS.slice(0, additionalAccessoryCount).map((section) => (
                <MannequinSlot
                  key={section.id}
                  section={section}
                  items={getItemsForSection(section)}
                  selectedItemId={selectedItems[section.id]}
                  onSelect={(id) => handleSelectItem(section.id, id)}
                  sortOption={sortOptions[section.id]}
                  onSortChange={(sort) => handleSortChange(section.id, sort)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md bg-popover">
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

            {/* I wore this outfit checkbox */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Checkbox 
                id="log-wear" 
                checked={logWearOnSave}
                onCheckedChange={(checked) => setLogWearOnSave(checked as boolean)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <Label htmlFor="log-wear" className="cursor-pointer font-medium text-foreground">
                  I wore this outfit
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Log a wear for each clothing item in this outfit
                </p>
              </div>
            </div>

            {/* Fit pic upload (only show if logging wear) */}
            {logWearOnSave && (
              <div>
                <Label className="mb-2 block">Fitpic (optional)</Label>
                <div className="flex gap-3">
                  {fitPic ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <img src={fitPic} alt="Outfit photo" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFitPic('')}
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Add photo</span>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFitPicUpload}
                      />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground flex-1">
                    Add a photo of yourself wearing this outfit
                  </p>
                </div>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <p>This outfit includes:</p>
              <ul className="mt-1 space-y-1 max-h-32 overflow-y-auto">
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
                {logWearOnSave ? 'Save & Log Wear' : 'Save Outfit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default OutfitBuilder;
