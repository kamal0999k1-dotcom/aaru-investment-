import React, { useRef, useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { validateFile } from '../utils/fileUtils';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onImageSelect(file);
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onImageSelect]);

  const onAreaClick = () => {
    fileInputRef.current?.click();
  };

  const dragClasses = isDragging ? 'border-[#0d9488] bg-teal-50' : 'border-gray-300 hover:border-[#0d9488] bg-gray-50/50';

  return (
    <div
      className={`w-full p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${dragClasses}`}
      onClick={onAreaClick}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <div className="flex flex-col items-center justify-center space-y-4 text-slate-500">
        <div className="p-4 bg-white rounded-full shadow-sm border border-gray-100 text-[#0d9488]">
          <UploadIcon />
        </div>
        <p className="text-lg font-semibold">
          <span className="text-[#0d9488]">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm font-medium text-gray-400 tracking-wide">PNG, JPG, or WEBP (Max 5MB)</p>
        {error && (
          <div className="mt-2 p-2 bg-red-900/40 border border-red-500/50 rounded text-red-400 text-sm animate-fade-in">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
