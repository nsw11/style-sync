import { Shirt, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddClick: () => void;
  isFiltered?: boolean;
}

export function EmptyState({ onAddClick, isFiltered }: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Shirt className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">No items found</h3>
        <p className="text-muted-foreground max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
        <Shirt className="w-10 h-10 text-accent-foreground" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">Your closet is empty</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start building your digital wardrobe by adding your first clothing item.
      </p>
      <Button onClick={onAddClick} className="gap-2">
        <Plus className="w-4 h-4" />
        Add Your First Item
      </Button>
    </div>
  );
}
