import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { requireEnv } from '../_lib/validateEnv';
import { handleCors } from '../_lib/cors';

const ai = new GoogleGenAI({ apiKey: requireEnv('GEMINI_API_KEY') });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, ...params } = req.body;

  try {
    switch (action) {
      case 'names': {
        const { industry, vibe, location, keywords } = params;
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Brainstorm 10 creative, memorable, and available-sounding business names.
Industry: ${industry}
Vibe: ${vibe}
Location: ${location}
Keywords: ${keywords || 'N/A'}

Return ONLY a JSON array of strings.`,
          config: { responseMimeType: 'application/json' },
        });
        return res.json(JSON.parse(response.text || '[]'));
      }

      case 'mottos': {
        const { industry, vibe, companyName, context } = params;
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Generate 8 mottos for ${companyName}. Industry: ${industry}. Vibe: ${vibe}. Context: ${context || 'N/A'}. Return JSON array of strings.`,
          config: { responseMimeType: 'application/json' },
        });
        return res.json(JSON.parse(response.text || '[]'));
      }

      case 'slogans': {
        const { industry, companyName } = params;
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Generate 6 sticker slogans for ${companyName} (${industry}). Return JSON array of strings.`,
          config: { responseMimeType: 'application/json' },
        });
        return res.json(JSON.parse(response.text || '[]'));
      }

      case 'strategy': {
        const { companyName, industry, vibe, location, audience, additionalNotes } = params;
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Create a comprehensive brand strategy as JSON for:
Company: ${companyName}
Industry: ${industry}
Vibe: ${vibe}
Location: ${location}
Target Audience: ${audience}
Notes: ${additionalNotes || 'N/A'}

Return JSON with fields: mission, vision, values (array), voiceTone, colorPalette (array of hex), typography (heading, body), targetAudience, uniqueSellingPoints (array), competitiveAdvantage, socialMediaStrategy, elevatorPitch`,
          config: { responseMimeType: 'application/json' },
        });
        return res.json(JSON.parse(response.text || '{}'));
      }

      case 'logos': {
        const { companyName, industry, vibe, colorPalette } = params;
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: `Generate 4 logo concepts as JSON for ${companyName} (${industry}, ${vibe}).
Colors: ${colorPalette?.join(', ') || 'brand colors'}

Return JSON array of objects with: name, description, style (minimalist|bold|playful|elegant), iconSuggestion, layoutSuggestion`,
          config: { responseMimeType: 'application/json' },
        });
        return res.json(JSON.parse(response.text || '[]'));
      }

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI generation failed';
    return res.status(500).json({ error: message });
  }
}
