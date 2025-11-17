import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";

export const generateWallpapers = async (prompt: string, apiKey: string): Promise<GeneratedImage[]> => {
  if (!apiKey) {
    throw new Error("API_KEY가 제공되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `${prompt}, mobile wallpaper, high resolution, photorealistic, 9:16 aspect ratio`,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/png',
        aspectRatio: '9:16',
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("API가 이미지를 반환하지 않았습니다.");
    }
    
    return response.generatedImages.map((img, index) => ({
      id: `image-${Date.now()}-${index}`,
      url: `data:image/png;base64,${img.image.imageBytes}`,
    }));
  } catch (error) {
    console.error("Gemini API 호출 오류:", error);
    if (error instanceof Error) {
        // Re-throw specific errors to be handled by the UI
        if (error.message.includes('API key not valid')) {
            throw new Error('API key not valid. Please check your key.');
        }
    }
    throw new Error("이미지 생성 중 알 수 없는 오류가 발생했습니다.");
  }
};

/**
 * Checks if the provided API key is valid by making a simple, non-image generation call.
 * @param apiKey The Gemini API key to test.
 * @returns True if the key is valid, false otherwise.
 */
export const testApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a simple and fast model for the test
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: "hello" }] }],
    });
    return true;
  } catch (error) {
    console.error("API 키 테스트 실패:", error);
    return false;
  }
};
