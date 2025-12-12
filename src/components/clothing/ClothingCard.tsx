import { useState } from 'react';
import { MoreVertical, Edit, Trash2, Shirt } from 'lucide-react';
import { ClothingItem, ViewMode } from '@/types/clothing';
import { CategoryBadge } from './CategoryBadge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface ClothingCardProps {
  item: ClothingItem;
  viewMode: ViewMode;
  onEdit: (item: ClothingItem) => void;
  onDelete: (id: string) => void;
  onWear: (id: string) => void;
}

export function ClothingCard({ item, viewMode, onEdit, onDelete, onWear }: ClothingCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteDialog(false);
  };

  if (viewMode === 'list') {
    return (
      <>
        <div className="glass-card rounded-lg p-3 flex items-center gap-4 hover-lift animate-fade-in">
          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
            <img src={item.image} alt={item.title || item.category} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{item.title || item.category}</h3>
              <CategoryBadge category={item.category} />
            </div>
            <p className="text-sm text-muted-foreground truncate mb-1">{item.subcategory}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {item.size && <span>Size: {item.size}</span>}
              {item.cost !== undefined && <span>${item.cost.toFixed(2)}</span>}
              <span className="flex items-center gap-1">
                <Shirt className="w-3 h-3" />
                {item.wearCount} wears
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-2 rounded-md hover:bg-muted transition-colors">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover z-50">
              <DropdownMenuItem onClick={() => onWear(item.id)}>
                <Shirt className="w-4 h-4 mr-2" />
                Log wear
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-popover">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this {item.subcategory.toLowerCase()} from your closet.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
      <div className="glass-card rounded-lg overflow-hidden hover-lift animate-fade-in group">
        <div className="aspect-square relative bg-muted">
          <img src={item.image} alt={item.title || item.category} className="w-full h-full object-cover" />
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 rounded-md bg-background/90 backdrop-blur-sm hover:bg-background transition-colors">
                <MoreVertical className="w-4 h-4 text-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover z-50">
                <DropdownMenuItem onClick={() => onWear(item.id)}>
                  <Shirt className="w-4 h-4 mr-2" />
                  Log wear
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(item)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="absolute bottom-2 left-2">
            <CategoryBadge category={item.category} className="bg-background/90 backdrop-blur-sm" />
          </div>
        </div>
        
        <div className="p-3">
          <h3 className="font-medium text-foreground truncate">{item.title || item.category}</h3>
          <p className="text-xs text-muted-foreground truncate">{item.subcategory}</p>
          <div className="flex items-center justify-between mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Shirt className="w-3 h-3" />
              {item.wearCount}
            </span>
            {item.cost !== undefined && <span>${item.cost.toFixed(2)}</span>}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-popover">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this {item.subcategory.toLowerCase()} from your closet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
