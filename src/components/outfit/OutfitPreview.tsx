import { ClothingItem, OutfitSection, OUTFIT_GRID, ADDITIONAL_ACCESSORY_SECTIONS } from '@/types/clothing';
import { cn } from '@/lib/utils';

interface OutfitPreviewProps {
  selectedItems: { [key in OutfitSection]?: ClothingItem };
  additionalAccessoryCount: number;
}

export function OutfitPreview({ selectedItems, additionalAccessoryCount }: OutfitPreviewProps) {
  const allSections = OUTFIT_GRID.flat().filter(Boolean);
  const additionalSections = ADDITIONAL_ACCESSORY_SECTIONS.slice(0, additionalAccessoryCount);
  
  const filledCount = Object.values(selectedItems).filter(Boolean).length;
  const totalSections = allSections.length + additionalAccessoryCount;

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="font-medium text-foreground mb-3">Outfit Preview</h3>
      
      {filledCount === 0 ? (
        <div className="aspect-[3/4] rounded-lg bg-muted flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center px-4">
            Select items from each section to build your outfit
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Main grid layout - 4 rows matching outfit grid */}
          {OUTFIT_GRID.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-3 gap-1">
              {row.map((section, colIndex) => {
                if (!section) {
                  return <div key={colIndex} className="aspect-square" />;
                }
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
                          <span className="text-[9px] text-background font-medium text-center px-0.5">
                            {item.subcategory}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[8px] text-muted-foreground text-center px-0.5">
                          {section.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Additional accessories row */}
          {additionalAccessoryCount > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {additionalSections.map((section) => {
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
                          <span className="text-[9px] text-background font-medium text-center px-0.5">
                            {item.subcategory}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[8px] text-muted-foreground text-center px-0.5">
                          {section.label}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 text-xs text-muted-foreground">
        {filledCount} of {totalSections} sections filled
      </div>
    </div>
  );
}