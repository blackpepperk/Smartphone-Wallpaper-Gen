import { GeneratedImage } from "../types";

export const generateWallpapers = async (prompt: string, apiKey: string): Promise<GeneratedImage[]> => {
  if (!apiKey) {
    throw new Error("API_KEY가 제공되지 않았습니다.");
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, apiKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `이미지 생성에 실패했습니다. (${response.status})`);
    }

    const { images } = await response.json();
    return images;

  } catch (error) {
    console.error("API 라우트 호출 오류:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('API key not valid. Please check your key.');
        }
    }
    throw new Error("이미지 생성 중 알 수 없는 오류가 발생했습니다.");
  }
};

/**
 * Checks if the provided API key is valid by making a call to our test-key API route.
 * @param apiKey The Gemini API key to test.
 * @returns True if the key is valid, false otherwise.
 */
export const testApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const response = await fetch('/api/test-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey }),
    });

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.success;
    
  } catch (error) {
    console.error("API 키 테스트 실패:", error);
    return false;
  }
};
