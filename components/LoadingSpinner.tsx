
import React, { useState, useEffect } from 'react';

const messages = [
  "AI가 창의력을 발휘하고 있습니다...",
  "최고의 배경화면을 만들고 있습니다...",
  "잠시만 기다려주세요, 거의 다 됐습니다...",
  "픽셀 하나하나에 마법을 불어넣는 중...",
];

const LoadingSpinner: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center mt-10">
      <div className="w-16 h-16 border-4 border-t-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="mt-6 text-lg text-gray-300">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
