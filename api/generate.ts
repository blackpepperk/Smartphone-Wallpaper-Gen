import { GoogleGenAI } from "@google/genai";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, apiKey } = req.body;

  if (!prompt || !apiKey) {
    return res.status(400).json({ error: 'Prompt and API key are required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const apiResponse = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `${prompt}, mobile wallpaper, high resolution, photorealistic, 9:16 aspect ratio`,
      config: {
        numberOfImages: 4,
        outputMimeType: 'image/png',
        aspectRatio: '9:16',
      },
    });

    if (!apiResponse.generatedImages || apiResponse.generatedImages.length === 0) {
      throw new Error("API did not return any images.");
    }
    
    const images = apiResponse.generatedImages.map((img, index) => ({
      id: `image-${Date.now()}-${index}`,
      url: `data:image/png;base64,${img.image.imageBytes}`,
    }));

    res.status(200).json({ images });

  } catch (error) {
    console.error("Gemini API call error in /api/generate:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes('API key not valid')) {
        return res.status(401).json({ error: 'API key not valid. Please check your key.' });
    }
    
    res.status(500).json({ error: 'Failed to generate images.' });
  }
}
