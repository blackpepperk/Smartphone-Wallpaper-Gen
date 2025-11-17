
import { GoogleGenAI } from "@google/genai";
import { GeneratedImage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateWallpapers = async (prompt: string): Promise<GeneratedImage[]> => {
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
    throw new Error("이미지 생성 중 오류가 발생했습니다.");
  }
};
