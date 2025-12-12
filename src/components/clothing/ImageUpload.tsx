import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      
      {value ? (
        <div className="relative group aspect-square rounded-lg overflow-hidden border border-border">
          <img
            src={value}
            alt="Clothing item"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-background rounded-full hover:bg-background/90 transition-colors"
            >
              <Upload className="w-4 h-4 text-foreground" />
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
            >
              <X className="w-4 h-4 text-destructive-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'aspect-square rounded-lg border-2 border-dashed cursor-pointer transition-all',
            'flex flex-col items-center justify-center gap-2',
            'hover:border-primary hover:bg-primary/5',
            isDragging ? 'border-primary bg-primary/10' : 'border-border'
          )}
        >
          <div className="p-3 rounded-full bg-muted">
            <ImageIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center px-4">
            <p className="text-sm font-medium text-foreground">Upload image</p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag & drop or click to browse
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
