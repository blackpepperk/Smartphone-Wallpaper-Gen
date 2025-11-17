
import React, { useState, useCallback } from 'react';
import { generateWallpapers } from './services/geminiService';
import { GeneratedImage } from './types';
import ImageGrid from './components/ImageGrid';
import ImageViewer from './components/ImageViewer';
import LoadingSpinner from './components/LoadingSpinner';
import { DownloadIcon, RemixIcon } from './components/Icons';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const images = await generateWallpapers(prompt);
      setGeneratedImages(images);
      setOriginalPrompt(prompt);
    } catch (err) {
      setError('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  const handleImageSelect = (image: GeneratedImage) => {
    setSelectedImage(image);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
  };

  const handleDownload = () => {
    if (!selectedImage) return;
    const link = document.createElement('a');
    link.href = selectedImage.url;
    link.download = `ai-wallpaper-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemix = () => {
    if (!originalPrompt) return;
    setPrompt(originalPrompt);
    setSelectedImage(null);
  };

  const WelcomeScreen: React.FC = () => (
    <div className="text-center p-8 flex flex-col items-center justify-center h-full">
      <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
        <i className="fas fa-magic-wand-sparkles text-5xl text-white"></i>
      </div>
      <h2 className="text-2xl font-bold mb-2">AI 배경화면 생성기</h2>
      <p className="text-gray-400">
        원하는 분위기를 설명하고<br/>세상에 단 하나뿐인 배경화면을 만들어보세요.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <header className="text-center p-4 border-b border-gray-700 shadow-md">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          AI 배경화면 생성기
        </h1>
      </header>

      <main className="flex-grow overflow-y-auto p-4 pb-32">
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center text-red-400 mt-10">{error}</div>
        ) : generatedImages.length > 0 ? (
          <ImageGrid images={generatedImages} onImageSelect={handleImageSelect} />
        ) : (
          <WelcomeScreen />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800/80 backdrop-blur-sm p-4 border-t border-gray-700">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 밤하늘의 오로라, 사이버펑크 도시의 밤거리"
            className="flex-grow bg-gray-700 text-white placeholder-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none h-12 leading-tight"
            rows={1}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg"
          >
            생성
          </button>
        </div>
      </footer>

      {selectedImage && (
        <ImageViewer
          image={selectedImage}
          onClose={handleCloseViewer}
          onDownload={handleDownload}
          onRemix={handleRemix}
        />
      )}
    </div>
  );
};

export default App;
