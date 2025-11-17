import React, { useState } from 'react';
import { testApiKey } from '../services/geminiService';
import { saveApiKey } from '../services/cryptoService';
import { CloseIcon } from './Icons';

interface ApiKeyManagerProps {
  onClose: () => void;
  onKeySaved: () => void;
  hasExistingKey: boolean;
}

type Status = 'idle' | 'testing' | 'success' | 'error';

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onClose, onKeySaved, hasExistingKey }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [isChangingKey, setIsChangingKey] = useState<boolean>(!hasExistingKey);

  const handleTestAndSave = async () => {
    if (!apiKeyInput.trim()) {
      setStatus('error');
      setMessage('API 키를 입력해주세요.');
      return;
    }

    setStatus('testing');
    setMessage('API 키를 확인하는 중...');

    const isValid = await testApiKey(apiKeyInput);

    if (isValid) {
      await saveApiKey(apiKeyInput);
      setStatus('success');
      setMessage('성공! 새 API 키가 저장되었습니다.');
      setTimeout(() => {
        onKeySaved();
      }, 1000);
    } else {
      setStatus('error');
      setMessage('API 키가 유효하지 않습니다. 키를 확인하고 다시 시도해주세요.');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'testing':
        return 'text-yellow-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in"
        onClick={onClose}
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
      <div 
        className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          onClick={onClose}
          aria-label="닫기"
        >
          <CloseIcon />
        </button>
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">API 키 관리</h2>
            <p className="text-gray-400 mt-2">
                {isChangingKey ? 'Google AI Studio에서 발급받은 Gemini API 키를 입력하세요.' : '저장된 API 키를 관리합니다.'}
            </p>
        </div>
        
        {isChangingKey ? (
            <div className="space-y-4">
                <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={hasExistingKey ? "새 API 키를 여기에 붙여넣으세요" : "여기에 API 키를 붙여넣으세요"}
                    className="w-full bg-gray-700 text-white placeholder-gray-500 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow"
                />
                {message && (
                    <p className={`text-sm text-center ${getStatusColor()}`}>{message}</p>
                )}
                <button
                    onClick={handleTestAndSave}
                    disabled={status === 'testing' || status === 'success'}
                    className="w-full bg-indigo-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200 shadow-lg text-lg"
                >
                    {status === 'testing' ? '테스트 중...' : '저장 및 연결 테스트'}
                </button>
            </div>
        ) : (
            <div className="text-center">
                <p className="text-green-400 mb-6 flex items-center justify-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    API 키가 안전하게 저장되어 있습니다.
                </p>
                <button
                    onClick={() => {
                        setIsChangingKey(true);
                        setMessage('');
                        setStatus('idle');
                    }}
                    className="w-full bg-gray-600 text-white font-bold py-3 px-5 rounded-lg hover:bg-gray-500 transition-colors duration-200"
                >
                    다른 API 키로 변경하기
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ApiKeyManager;