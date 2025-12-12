import { useState } from 'react';
import { 
  Archive, 
  Trash2, 
  Calendar, 
  Camera, 
  X, 
  ChevronLeft,
  Image as ImageIcon,
  DollarSign
} from 'lucide-react';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { useClothingStore } from '@/hooks/useClothingStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OUTFIT_GRID, ADDITIONAL_ACCESSORY_SECTIONS, OutfitSection, Outfit, ClothingItem } from '@/types/clothing';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const MyOutfits = () => {
  const { outfits, deleteOutfit, logOutfitWear } = useOutfitStore();
  const { items, logWear } = useClothingStore();
  const { toast } = useToast();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showLogWearDialog, setShowLogWearDialog] = useState(false);
  const [fitPic, setFitPic] = useState<string>('');

  const getItemById = (id: string) => items.find(item => item.id === id);

  const getAllSections = () => {
    const gridSections = OUTFIT_GRID.flat().filter(Boolean);
    return [...gridSections, ...ADDITIONAL_ACCESSORY_SECTIONS];
  };

  const getOutfitItems = (outfit: Outfit): ClothingItem[] => {
    return Object.values(outfit.items)
      .filter(Boolean)
      .map(id => getItemById(id as string))
      .filter(Boolean) as ClothingItem[];
  };

  const getOutfitTotalCost = (outfit: Outfit): number => {
    return getOutfitItems(outfit).reduce((sum, item) => sum + (item.cost || 0), 0);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteOutfit(deleteId);
      setDeleteId(null);
      if (selectedOutfit?.id === deleteId) {
        setSelectedOutfit(null);
      }
    }
  };

  const handleLogWear = () => {
    if (!selectedOutfit) return;

    // Get item IDs directly from selectedOutfit.items
    const itemIds = Object.values(selectedOutfit.items).filter(Boolean) as string[];
    
    // Log outfit wear
    logOutfitWear(selectedOutfit.id, fitPic || undefined);
    
    // Log wear for each item
    itemIds.forEach(id => logWear(id, selectedOutfit.id));

    toast({
      title: 'Outfit worn!',
      description: `Logged wear for "${selectedOutfit.name}" and ${itemIds.length} items.`
    });

    // Update the selected outfit to reflect new wear count immediately in UI
    setSelectedOutfit(prev => prev ? {
      ...prev,
      wearCount: (prev.wearCount || 0) + 1,
      wearLogs: [...(prev.wearLogs || []), { id: crypto.randomUUID(), date: new Date(), photo: fitPic || undefined }]
    } : null);

    setShowLogWearDialog(false);
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

  // Detail view for selected outfit
  if (selectedOutfit) {
    const outfitItems = getOutfitItems(selectedOutfit);
    const totalCost = getOutfitTotalCost(selectedOutfit);
    const costPerWear = selectedOutfit.wearCount > 0 ? totalCost / selectedOutfit.wearCount : null;

    return (
      <AppLayout 
        title={selectedOutfit.name} 
        subtitle={`${outfitItems.length} items`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowLogWearDialog(true);
              }}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Log Wear</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(selectedOutfit.id)}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        }
      >
        {/* Back button */}
        <button
          onClick={() => setSelectedOutfit(null)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back to outfits</span>
        </button>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Stats row */}
            <div className="flex flex-wrap gap-4 glass-card rounded-xl p-4">
              <div>
                <p className="text-xs text-muted-foreground">Times Worn</p>
                <p className="text-2xl font-bold text-foreground">{selectedOutfit.wearCount || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(0)}</p>
              </div>
              {costPerWear !== null && (
                <div>
                  <p className="text-xs text-muted-foreground">Cost per Wear</p>
                  <p className="text-2xl font-bold text-foreground">${costPerWear.toFixed(2)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-lg font-medium text-foreground">
                  {format(new Date(selectedOutfit.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            {/* Clothing items grid */}
            <div>
              <h3 className="font-medium text-foreground mb-3">Clothing Items</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {outfitItems.map(item => (
                  <div key={item.id} className="glass-card rounded-xl overflow-hidden">
                    <div className="aspect-square">
                      <img 
                        src={item.image} 
                        alt={item.subcategory} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-foreground truncate">{item.subcategory}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <div className="flex justify-between items-center mt-2 text-xs">
                        <span className="text-muted-foreground">{item.wearCount} wears</span>
                        {item.cost && (
                          <span className="text-muted-foreground flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3" />
                            {item.cost}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Fitpics / Wear History */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-medium text-foreground mb-3">Fitpics</h3>
              {selectedOutfit.wearLogs && selectedOutfit.wearLogs.some(log => log.photo) ? (
                <div className="grid grid-cols-2 gap-2">
                  {selectedOutfit.wearLogs.filter(log => log.photo).map(log => (
                    <div key={log.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img 
                        src={log.photo} 
                        alt="Fitpic" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent p-2">
                        <p className="text-[10px] text-background">
                          {format(new Date(log.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No fitpics yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Log a wear to add photos</p>
                </div>
              )}
            </div>

            {/* Wear History */}
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-medium text-foreground mb-3">Wear History</h3>
              {selectedOutfit.wearLogs && selectedOutfit.wearLogs.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {[...selectedOutfit.wearLogs].reverse().map(log => (
                    <div key={log.id} className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {format(new Date(log.date), 'EEEE, MMM d, yyyy')}
                      </span>
                      {log.photo && <Camera className="w-3 h-3 text-primary" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No wear history yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Log Wear Dialog */}
        <Dialog open={showLogWearDialog} onOpenChange={setShowLogWearDialog}>
          <DialogContent className="max-w-sm bg-popover">
            <DialogHeader>
              <DialogTitle>Log Outfit Wear</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Logging wear for <span className="font-medium text-foreground">{selectedOutfit.name}</span>
              </p>

              <div>
                <Label className="mb-2 block">Fitpic (optional)</Label>
                <div className="flex gap-3">
                  {fitPic ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                      <img src={fitPic} alt="Outfit photo" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setFitPic('')}
                        className="absolute top-1 right-1 p-1 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground"
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
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                This will also log a wear for each item in the outfit.
              </p>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowLogWearDialog(false);
                    setFitPic('');
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleLogWear}>
                  Log Wear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent className="bg-popover">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete outfit?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The outfit will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AppLayout>
    );
  }

  // List view
  return (
    <AppLayout title="My Outfits" subtitle={`${outfits.length} saved outfit${outfits.length !== 1 ? 's' : ''}`}>
      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Archive className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No outfits saved yet</h3>
          <p className="text-muted-foreground max-w-sm">
            Create your first outfit in the Outfit Builder and save it to see it here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => {
            const outfitItems = getOutfitItems(outfit);
            return (
              <button
                key={outfit.id}
                onClick={() => setSelectedOutfit(outfit)}
                className="glass-card rounded-xl p-4 space-y-3 text-left hover:ring-2 hover:ring-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{outfit.name}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(outfit.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(outfit.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Item thumbnails */}
                <div className="flex flex-wrap gap-1.5">
                  {outfitItems.slice(0, 6).map(item => (
                    <div
                      key={item.id}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={item.image}
                        alt={item.subcategory}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {outfitItems.length > 6 && (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      +{outfitItems.length - 6}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{outfitItems.length} item{outfitItems.length !== 1 ? 's' : ''}</span>
                  <span>{outfit.wearCount || 0} wear{(outfit.wearCount || 0) !== 1 ? 's' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The outfit will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default MyOutfits;
