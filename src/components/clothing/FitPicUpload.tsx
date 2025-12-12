import { useState, useRef, useCallback } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FitPicUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FitPicUpload({ value, onChange, className }: FitPicUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
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
