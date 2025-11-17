
import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon, RemixIcon, CloseIcon } from './Icons';

interface ImageViewerProps {
  image: GeneratedImage;
  onClose: () => void;
  onDownload: () => void;
  onRemix: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, onDownload, onRemix }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
      
      <button 
        className="absolute top-4 right-4 text-white text-3xl z-50"
        onClick={onClose}
      >
        <CloseIcon />
      </button>

      <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-sm max-h-full aspect-[9/16] flex items-center justify-center">
            <img 
                src={image.url} 
                alt="선택된 배경화면" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
        </div>

        <div className="absolute bottom-6 flex space-x-4">
          <button 
            onClick={onDownload}
            className="flex items-center gap-2 bg-white text-gray-900 font-bold py-3 px-6 rounded-full shadow-lg hover:bg-gray-200 transition-colors"
          >
            <DownloadIcon />
            다운로드
          </button>
          <button 
            onClick={onRemix}
            className="flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-indigo-500 transition-colors"
          >
            <RemixIcon />
            Remix
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageViewer;
