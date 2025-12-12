import { ClothingItem, OutfitSection, OUTFIT_SECTIONS } from '@/types/clothing';
import { cn } from '@/lib/utils';

interface OutfitPreviewProps {
  selectedItems: { [key in OutfitSection]?: ClothingItem };
  accessoriesEnabled: boolean;
}

export function OutfitPreview({ selectedItems, accessoriesEnabled }: OutfitPreviewProps) {
  const filledSections = OUTFIT_SECTIONS.filter(section => {
    if (section.id === 'accessories' && !accessoriesEnabled) return false;
    return selectedItems[section.id];
  });

  const isEmpty = filledSections.length === 0;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="font-medium text-foreground mb-3">Outfit Preview</h3>
      
      {isEmpty ? (
        <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center px-4">
            Select items from each section to build your outfit
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {OUTFIT_SECTIONS.map((section) => {
            if (section.id === 'accessories' && !accessoriesEnabled) return null;
            const item = selectedItems[section.id];
            
            return (
              <div
                key={section.id}
                className={cn(
                  "aspect-square rounded-lg overflow-hidden border border-border",
                  item ? "bg-card" : "bg-muted/50"
                )}
              >
                {item ? (
                  <div className="relative w-full h-full group">
                    <img
                      src={item.image}
                      alt={item.subcategory}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-background font-medium text-center px-1">
                        {item.subcategory}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground text-center px-1">
                      {section.label.split(' / ')[0]}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        {filledSections.length} of {accessoriesEnabled ? 7 : 6} sections filled
      </div>
    </div>
  );
}
