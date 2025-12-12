import { useState, useRef, useCallback } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FitPicUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Compress image to reduce storage usage
const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Max dimension 800px
      const maxDim = 800;
      let { width, height } = img;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = (height / width) * maxDim;
          width = maxDim;
        } else {
          width = (width / height) * maxDim;
          height = maxDim;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with 70% quality
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export function FitPicUpload({ value, onChange, className }: FitPicUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch (error) {
      console.error('Failed to compress image:', error);
    }
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (value) {
    return (
      <div className={cn("relative w-24 h-24 rounded-lg overflow-hidden", className)}>
        <img src={value} alt="Outfit photo" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute top-1 right-1 p-1 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "w-full min-h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all p-4",
        isDragging 
          ? "border-primary bg-primary/10" 
          : "border-muted-foreground/30 hover:border-primary/50",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
      {isDragging ? (
        <>
          <Upload className="w-6 h-6 text-primary mb-2" />
          <span className="text-sm text-primary font-medium">Drop image here</span>
        </>
      ) : (
        <>
          <Camera className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground text-center">
            Click or drag & drop
          </span>
        </>
      )}
    </div>
  );
}
