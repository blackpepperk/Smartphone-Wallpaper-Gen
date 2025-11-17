import { GoogleGenAI } from "@google/genai";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    // Use a simple and fast model for the test
    await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: "hello" }] }],
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("API key test failed in /api/test-key:", error);
    res.status(401).json({ success: false, error: 'Invalid API key' });
  }
}
