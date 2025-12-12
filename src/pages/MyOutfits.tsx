import { useState } from 'react';
import { Archive, Trash2, Calendar } from 'lucide-react';
import { useOutfitStore } from '@/hooks/useOutfitStore';
import { useClothingStore } from '@/hooks/useClothingStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
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
import { OUTFIT_GRID, ADDITIONAL_ACCESSORY_SECTIONS, OutfitSection } from '@/types/clothing';
import { format } from 'date-fns';

const MyOutfits = () => {
  const { outfits, deleteOutfit } = useOutfitStore();
  const { items } = useClothingStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getItemById = (id: string) => items.find(item => item.id === id);

  const getAllSections = () => {
    const gridSections = OUTFIT_GRID.flat().filter(Boolean);
    return [...gridSections, ...ADDITIONAL_ACCESSORY_SECTIONS];
  };

  const getOutfitItemCount = (outfitItems: { [key in OutfitSection]?: string }) => {
    return Object.values(outfitItems).filter(Boolean).length;
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteOutfit(deleteId);
      setDeleteId(null);
    }
  };

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
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="glass-card rounded-xl p-4 space-y-3"
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
                  onClick={() => setDeleteId(outfit.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Item thumbnails */}
              <div className="flex flex-wrap gap-1.5">
                {getAllSections().map((section) => {
                  if (!section) return null;
                  const itemId = outfit.items[section.id];
                  const item = itemId ? getItemById(itemId) : null;
                  
                  if (!item) return null;
                  
                  return (
                    <div
                      key={section.id}
                      className="w-12 h-12 rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={item.image}
                        alt={item.subcategory}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                {getOutfitItemCount(outfit.items)} item{getOutfitItemCount(outfit.items) !== 1 ? 's' : ''}
              </p>
            </div>
          ))}
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
