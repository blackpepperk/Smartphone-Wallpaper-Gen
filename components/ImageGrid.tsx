
import React from 'react';
import { GeneratedImage } from '../types';

interface ImageGridProps {
  images: GeneratedImage[];
  onImageSelect: (image: GeneratedImage) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className="aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 shadow-lg"
          onClick={() => onImageSelect(image)}
        >
          <img
            src={image.url}
            alt="AI 생성 배경화면"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
