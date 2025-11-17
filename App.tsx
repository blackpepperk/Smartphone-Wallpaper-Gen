import React, { useState, useCallback, useEffect } from 'react';
import { generateWallpapers, testApiKey } from './services/geminiService';
import { clearApiKey, loadAndDecryptApiKey } from './services/cryptoService';
import { GeneratedImage } from './types';
import ImageGrid from './components/ImageGrid';
import ImageViewer from './components/ImageViewer';
import LoadingSpinner from './components/LoadingSpinner';
import ApiKeyManager from './components/ApiKeyManager';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalPrompt, setOriginalPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeyLoading, setIsKeyLoading] = useState<boolean>(true);
  const [showApiKeyManager, setShowApiKeyManager] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      setIsKeyLoading(true);
      const key = await loadAndDecryptApiKey();
      if (key) {
        // Verify if the loaded key is still valid
        const isValid = await testApiKey(key);
        if (isValid) {
          setApiKey(key);
        } else {
          await clearApiKey(); // Clear invalid key
        }
      }
      setIsKeyLoading(false);
    };
    checkApiKey();
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading || !apiKey) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const images = await generateWallpapers(prompt, apiKey);
      setGeneratedImages(images);
      setOriginalPrompt(prompt);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes("API key not valid") ||
          errorMessage.includes("Request had invalid authentication credentials") ||
          errorMessage.includes("API_KEY가 제공되지 않았습니다")) {
        setError("API 키가 유효하지 않습니다. 새 키를 설정해주세요.");
        await clearApiKey();
        setApiKey(null); // This will trigger the setup screen
      } else {
        setError('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, apiKey]);

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
  
  const handleKeySaved = async () => {
    const key = await loadAndDecryptApiKey();
    setApiKey(key);
    setShowApiKeyManager(false);
    setError(null); // Clear previous errors
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

  const SetupScreen: React.FC<{ onManageKey: () => void }> = ({ onManageKey }) => (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans items-center justify-center text-white">
      <div className="text-center p-8 flex flex-col items-center justify-center">
        <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
           <i className="fas fa-key text-5xl text-white"></i>
        </div>
        <h2 className="text-2xl font-bold mb-2">Gemini API 키 설정</h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-6">
          배경화면을 생성하려면 Google AI Studio에서 발급받은 Gemini API 키가 필요합니다.
        </p>
        <button
          onClick={onManageKey}
          className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-500 transition-colors duration-200 shadow-lg text-lg"
        >
          API 키 설정하기
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </div>
    </div>
  );
  
  if (isKeyLoading) {
    return (
       <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
         <LoadingSpinner/>
       </div>
    );
  }

  if (!apiKey) {
    return (
      <>
        <SetupScreen onManageKey={() => setShowApiKeyManager(true)} />
        {showApiKeyManager && (
          <ApiKeyManager
            onClose={() => setShowApiKeyManager(false)}
            onKeySaved={handleKeySaved}
            hasExistingKey={!!apiKey}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col font-sans">
      <header className="relative text-center p-4 border-b border-gray-700 shadow-md">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          AI 배경화면 생성기
        </h1>
        <button 
            onClick={() => setShowApiKeyManager(true)}
            title="API 키 관리"
            className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            aria-label="API 키 관리"
        >
            <i className="fas fa-key"></i>
        </button>
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
      {showApiKeyManager && (
        <ApiKeyManager
            onClose={() => setShowApiKeyManager(false)}
            onKeySaved={handleKeySaved}
            hasExistingKey={!!apiKey}
        />
      )}
    </div>
  );
};

export default App;