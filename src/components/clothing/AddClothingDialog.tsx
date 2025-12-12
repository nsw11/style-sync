import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageUpload } from './ImageUpload';
import { Category, CATEGORIES, ClothingItem } from '@/types/clothing';
import { useToast } from '@/hooks/use-toast';

interface AddClothingDialogProps {
  onAdd: (item: Omit<ClothingItem, 'id' | 'wearCount' | 'wearLogs' | 'createdAt' | 'updatedAt'>) => void;
  getSubcategoriesForCategory: (category: Category) => string[];
  addCustomSubcategory: (category: Category, subcategory: string) => void;
  editItem?: ClothingItem | null;
  onUpdate?: (id: string, updates: Partial<ClothingItem>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export function AddClothingDialog({
  onAdd,
  getSubcategoriesForCategory,
  addCustomSubcategory,
  editItem,
  onUpdate,
  open,
  onOpenChange,
  triggerButton = true,
}: AddClothingDialogProps) {
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [title, setTitle] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [subcategory, setSubcategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [size, setSize] = useState('');
  const [origin, setOrigin] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');

  const isEditing = !!editItem;

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title || '');
      setImage(editItem.image);
      setCategory(editItem.category);
      setSubcategory(editItem.subcategory);
      setSize(editItem.size || '');
      setOrigin(editItem.origin || '');
      setCost(editItem.cost?.toString() || '');
      setDescription(editItem.description || '');
    }
  }, [editItem]);

  const resetForm = () => {
    setTitle('');
    setImage('');
    setCategory('');
    setSubcategory('');
    setCustomSubcategory('');
    setShowCustomInput(false);
    setSize('');
    setOrigin('');
    setCost('');
    setDescription('');
  };

  const handleCategoryChange = (value: Category) => {
    setCategory(value);
    setSubcategory('');
    setShowCustomInput(false);
    setCustomSubcategory('');
  };

  const handleSubcategoryChange = (value: string) => {
    if (value === 'Other/Custom') {
      setShowCustomInput(true);
      setSubcategory('');
    } else {
      setShowCustomInput(false);
      setSubcategory(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!image) {
      toast({ title: 'Image required', description: 'Please upload an image', variant: 'destructive' });
      return;
    }

    if (!category) {
      toast({ title: 'Category required', description: 'Please select a category', variant: 'destructive' });
      return;
    }

    const finalSubcategory = showCustomInput ? customSubcategory : subcategory;
    if (!finalSubcategory) {
      toast({ title: 'Subcategory required', description: 'Please select or enter a subcategory', variant: 'destructive' });
      return;
    }

    // Add custom subcategory if it's new
    if (showCustomInput && customSubcategory) {
      addCustomSubcategory(category, customSubcategory);
    }

    const itemData = {
      title: title.trim() || undefined,
      image,
      category,
      subcategory: finalSubcategory,
      size: size || undefined,
      origin: origin || undefined,
      cost: cost ? parseFloat(cost) : undefined,
      description: description || undefined,
    };

    if (isEditing && onUpdate) {
      onUpdate(editItem.id, itemData);
      toast({ title: 'Item updated', description: 'Your clothing item has been updated' });
    } else {
      onAdd(itemData);
      toast({ title: 'Item added', description: 'Your clothing item has been added to the closet' });
    }

    resetForm();
    setIsOpen(false);
  };

  const subcategories = category ? getSubcategoriesForCategory(category) : [];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      {triggerButton && !isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-popover">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Clothing Item' : 'Add New Clothing Item'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title" className="mb-2 block">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Vintage denim jacket (defaults to category)"
              className="bg-background"
              maxLength={100}
            />
          </div>

          <div>
            <Label className="mb-2 block">Image *</Label>
            <ImageUpload value={image} onChange={setImage} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="mb-2 block">Category *</Label>
              <Select value={category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subcategory" className="mb-2 block">Subcategory *</Label>
              {showCustomInput ? (
                <Input
                  value={customSubcategory}
                  onChange={(e) => setCustomSubcategory(e.target.value)}
                  placeholder="Enter custom subcategory"
                  className="bg-background"
                />
              ) : (
                <Select 
                  value={subcategory} 
                  onValueChange={handleSubcategoryChange}
                  disabled={!category}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder={category ? "Select subcategory" : "Select category first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {showCustomInput && (
                <button
                  type="button"
                  onClick={() => { setShowCustomInput(false); setCustomSubcategory(''); }}
                  className="text-xs text-primary mt-1 hover:underline"
                >
                  ← Back to list
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="size" className="mb-2 block">Size</Label>
              <Input
                id="size"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., M, 32, 10"
                className="bg-background"
              />
            </div>

            <div>
              <Label htmlFor="cost" className="mb-2 block">Cost</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
                className="bg-background"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="origin" className="mb-2 block">Origin</Label>
            <Input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Store name, brand, gift, etc."
              className="bg-background"
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this item..."
              rows={3}
              className="bg-background resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEditing ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
