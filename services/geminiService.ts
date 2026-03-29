import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";
import { BrandInput, BrandStrategy, BrandingPackage, ContentCalendarDay, EmailTemplate, BrandGuidelines, CompetitorAnalysis, BrandVoiceAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Core Branding Functions ---

export const generateBusinessNames = async (industry: string, vibe: string, location: string, keywords?: string): Promise<string[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Brainstorm 10 creative, memorable, and available-sounding business names for a new company.
      Industry: ${industry}
      Vibe: ${vibe}
      Location: ${location}
      Keywords: ${keywords || "N/A"}
      
      Return ONLY a JSON array of strings.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }]
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generateMottos = async (industry: string, vibe: string, companyName: string, context?: string): Promise<string[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Generate 8 mottos for ${companyName}. Industry: ${industry}. Vibe: ${vibe}. Context: ${context || 'N/A'}. Return JSON array of strings.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
};

export const generateStickerSlogans = async (industry: string, companyName: string): Promise<string[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Generate 6 sticker slogans for ${companyName} (${industry}). Return JSON array of strings.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
};

export const generateBrandStrategy = async (input: BrandInput): Promise<BrandStrategy> => {
    const model = "gemini-3.1-pro-preview";
    const prompt = `
      Create a comprehensive brand strategy for:
      Company: ${input.companyName}
      Industry: ${input.industry}
      Vibe: ${input.vibe}
      Location: ${input.location}
      Target Audience: ${input.audience}
      Notes: ${input.additionalNotes || "N/A"}
      
      Return a JSON object with:
      - taglines: string[] (5 catchphrases)
      - missionStatement: string
      - visionStatement: string
      - colorPalette: { primary: string, secondary: string, accent: string, background: string, explanation: string } (Hex codes)
      - typographyRecommendation: { headingFont: string, bodyFont: string, reasoning: string } (Google Font names)
      - targetAudienceProfile: string
      - brandVoice: string
      - brandValues: string[]
      - competitiveAdvantage: string
      - socialMediaPostIdeas: [{ platform: string, caption: string, visualIdea: string }]
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const regenerateTaglines = async (input: BrandInput): Promise<string[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Generate 8 new taglines for ${input.companyName}. Vibe: ${input.vibe}. Return JSON array of strings.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
};

export const generateFlyerCopy = async (input: BrandInput, strategy: BrandStrategy): Promise<{headline: string, hook: string, callToAction: string}> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Write flyer copy for ${input.companyName}. Vibe: ${input.vibe}. Return JSON: {headline, hook, callToAction}.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const generateClassifiedAd = async (input: BrandInput, strategy: BrandStrategy): Promise<{title: string, body: string}> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Write a classified ad for ${input.companyName}. Return JSON: {title, body}.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const generateBrandingPackages = async (input: BrandInput): Promise<BrandingPackage[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      You are an elite AI creative studio consultant specializing in the Florida market. Generate EXACTLY 10 high-conversion, emotionally impactful, and legally compliant branding packages for:
      Company: ${input.companyName} (${input.industry})
      Vibe: ${input.vibe}
      User Selected Tier: ${input.selectedTier || "Any"}
      
      PRICING RESEARCH & LOGIC (FLORIDA MARKET - HIGH PRECISION):
      - LLC Filing (Sunbiz): $125 (Fixed Cost)
      - Registered Agent: ~$50-$150 (Annual)
      - Software Stack (Adobe, Gemini Pro, Canva Pro, Shopify): ~$150/mo (Amortized per client)
      - Material Costs (Premium Vinyl, 100lb Cardstock, UV Lamination, HP Precision Ink): ~$75-$250 per physical package.
      - Competitor Entry Rate (Basic): $800-$2,500 (Local agencies).
      - Competitor Elite Rate (Full Suite): $5,000-$15,000.
      - YOUR EDGE: Xela's AI-driven efficiency + Cricut Explorer 3 precision + HP High-Yield printing allows for disruptive pricing.
      - PROFIT MARGIN GOAL: 50-70% net profit after all expenses.
      - LABOR VALUE: $150/hr for elite creative engineering.
      
      PRICING STRATEGY (DISRUPTIVE AI-DRIVEN RATES):
      - Budget: $149 - $199
      - Premium: $249 - $299
      - Elite: $349 - $399
      
      REQUIRED PACKAGE TYPES (Generate exactly 10):
      1. The Sovereignty Set (Elite)
      2. Promotion Pal (Budget)
      3. Selling Sales Set (Premium)
      4. CardCut Calibrated (Budget)
      5. Site Sales Solution (Elite)
      6. Registered Rebellion (Premium)
      7. Entrepreneurship Enterprise (Elite)
      8. Premiere Passion Pal (Premium)
      9. Sticker System (Budget)
      10. Ultimate Premium Suite (Elite)
      
      EACH PACKAGE MUST INCLUDE:
      - id, name, tier (Budget/Premium/Elite), price (e.g., "$149"), description, deliverables, productionScope, timeline, pricingLogic, targetProfile, legitimacyChecklist, budgetBreakdown (startup, production, marketing, scaling), terms (scope, revisions, payment, refund, ip).
      
      Return ONLY a JSON array of exactly 10 BrandingPackage objects.
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }]
        }
    });
    return JSON.parse(response.text || "[]");
};

export const generateAdAssets = async (input: BrandInput, strategy: BrandStrategy): Promise<any> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Generate "AI-Powered Ad Assets" for:
      Company: ${input.companyName}
      Vibe: ${input.vibe}
      
      Include:
      - 3 Short-form video ad concepts
      - 2 AI-generated promotional song concepts
      - 3 Hook-driven scripts
      - Platform optimization tips
      
      Return JSON: { videoConcepts, songConcepts, scripts, optimizationTips }
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
    });
    return JSON.parse(response.text || "{}");
};

export const generateSalesPitch = async (input: BrandInput, strategy: BrandStrategy, isFriend: boolean = true): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Write a sales pitch for ${input.companyName}. Vibe: ${input.vibe}. Friend discount: ${isFriend}.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text || "";
};

export const generateBrandStory = async (input: BrandInput, strategy: BrandStrategy): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Write a brand story for ${input.companyName}. Vibe: ${input.vibe}.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text || "";
};

export const generateContentCalendar = async (input: BrandInput, strategy: BrandStrategy): Promise<ContentCalendarDay[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Generate a 30-day social media content calendar for:
      Company: ${input.companyName}
      Vibe: ${input.vibe}
      Industry: ${input.industry}
      
      Return a JSON array of 30 objects: { day: number, topic: string, platform: string, caption: string, visualIdea: string }.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
};

export const generateEmailTemplates = async (input: BrandInput, strategy: BrandStrategy): Promise<EmailTemplate[]> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Generate 5 essential email marketing templates for:
      Company: ${input.companyName}
      Vibe: ${input.vibe}
      
      Include: Welcome, Promotional, Newsletter, Abandoned Cart (or Service Follow-up), and Re-engagement.
      Return a JSON array of objects: { type: string, subject: string, body: string }.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
};

export const generateBrandGuidelines = async (input: BrandInput, strategy: BrandStrategy): Promise<BrandGuidelines> => {
    const model = "gemini-3.1-pro-preview";
    const prompt = `
      Generate a formal Brand Guidelines document for:
      Company: ${input.companyName}
      Color Palette: ${JSON.stringify(strategy.colorPalette)}
      Typography: ${JSON.stringify(strategy.typographyRecommendation)}
      Voice: ${strategy.brandVoice}
      
      Return a JSON object: { logoUsage: string, colorUsage: string, typographyUsage: string, voiceAndTone: string, imageryStyle: string }.
      Each field should be a detailed paragraph.
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const analyzeCompetitor = async (input: BrandInput, competitorUrl: string): Promise<CompetitorAnalysis> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Analyze the competitor at ${competitorUrl} and compare them to our brand: ${input.companyName} (${input.industry}).
      
      Return a JSON object:
      {
        "competitorName": "string",
        "url": "${competitorUrl}",
        "strengths": ["string", "string"],
        "weaknesses": ["string", "string"],
        "differentiation": "How we can stand out from them"
      }
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            tools: [{ urlContext: {} }]
        }
    });
    return JSON.parse(response.text || "{}");
};

export const analyzeBrandVoice = async (sampleText: string): Promise<BrandVoiceAnalysis> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Analyze the following text and extract the brand voice, tone, and style.
      
      Text: "${sampleText}"
      
      Return a JSON object:
      {
        "tone": "string",
        "style": "string",
        "keywords": ["string", "string"],
        "samplePhrases": ["string", "string"]
      }
    `;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

// --- Image & Video Generation (Nano Banana & Veo) ---

export const generateLogoConcepts = async (input: BrandInput, logoStyle: string, primaryColor: string, referenceImage?: string, fontChoice?: string): Promise<Array<{imageUrl: string, description: string}>> => {
  const model = "gemini-2.5-flash-image";
  const parts: any[] = [
    { text: `Professional ${logoStyle} logo for ${input.companyName}. Color: ${primaryColor}. Vibe: ${input.vibe}. Font preference: ${fontChoice || 'Modern'}.` }
  ];

  if (referenceImage) {
    if (referenceImage.startsWith('data:')) {
      parts.push({ inlineData: { mimeType: 'image/png', data: referenceImage.split(',')[1] } });
    } else if (referenceImage.startsWith('input_file_')) {
      // In this environment, we can't easily fetch the file to base64 here without a helper
      // So we'll just add it to the prompt text as a reference for now
      parts[0].text += ` Reference style: ${referenceImage}`;
    }
  }

  const response = await ai.models.generateContent({ 
    model, 
    contents: { parts } 
  });
  
  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  return part ? [{ imageUrl: `data:image/png;base64,${part.inlineData.data}`, description: `Elite ${logoStyle} Concept` }] : [];
};

export const editLogoImage = async (base64Image: string, editInstruction: string): Promise<string> => {
    const model = "gemini-2.5-flash-image";
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] } },
                { text: editInstruction }
            ]
        }
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("Edit failed");
    return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateImageNanoBananaPro = async (prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: string = "1:1"): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio as any,
                imageSize: size
            }
        }
    });
    
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("No image generated");
    return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateImageNanoBanana2 = async (prompt: string, base64Image?: string): Promise<string> => {
    const contents: any = { parts: [{ text: prompt }] };
    if (base64Image) {
        contents.parts.push({
            inlineData: {
                data: base64Image.split(',')[1],
                mimeType: "image/png"
            }
        });
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents,
        config: {
            imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
        }
    });
    
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (!part?.inlineData) throw new Error("No image generated");
    return `data:image/png;base64,${part.inlineData.data}`;
};

export const generateVideoVeo = async (prompt: string, base64Image?: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> => {
    const params: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio
        }
    };
    
    if (base64Image) {
        params.image = {
            imageBytes: base64Image.split(',')[1],
            mimeType: 'image/png'
        };
    }
    
    let operation = await ai.models.generateVideos(params);
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    return operation.response?.generatedVideos?.[0]?.video?.uri || "";
};

// --- Intelligence & Analysis ---

export const chatWithGemini = async (message: string, history: any[] = []): Promise<string> => {
    const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
            systemInstruction: "You are Xela, the elite AI creative consultant for Xela Branding Studio. You are assertive, professional, and deeply knowledgeable about the Florida market, high-precision manufacturing (Cricut/HP), and AI-driven business growth. You deliver high-conversion results and do not settle for average. Your tone is sophisticated, authoritative, and results-oriented."
        }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that.";
};

export const analyzeMedia = async (prompt: string, base64Data: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: {
            parts: [
                { text: prompt },
                { inlineData: { data: base64Data.split(',')[1], mimeType } }
            ]
        }
    });
    return response.text || "Analysis failed.";
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
            parts: [
                { text: "Transcribe this audio accurately." },
                { inlineData: { data: base64Audio.split(',')[1], mimeType: "audio/wav" } }
            ]
        }
    });
    return response.text || "Transcription failed.";
};

export const generateSpeech = async (text: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            }
        }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateSongLyrics = async (input: BrandInput, genre: string, topic?: string): Promise<{title: string, lyrics: string}> => {
    const model = "gemini-3-flash-preview";
    const prompt = `Write song lyrics for ${input.companyName}. Genre: ${genre}. Topic: ${topic || 'N/A'}. Return JSON: {title, lyrics}.`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const searchWithUrlContext = async (prompt: string, urls: string[]): Promise<string> => {
    const fullPrompt = `${prompt}\n\nReference URLs:\n${urls.join('\n')}`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: fullPrompt,
        config: {
            tools: [{ urlContext: {} }]
        }
    });
    return response.text || "Search failed.";
};

export const searchGrounding = async (query: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: query,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response.text || "No search results found.";
};

export const mapsGrounding = async (query: string, lat?: number, lng?: number): Promise<any> => {
    const config: any = { tools: [{ googleMaps: {} }] };
    if (lat && lng) {
        config.toolConfig = { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } };
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config
    });
    return {
        text: response.text,
        links: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
};

export const fastAIResponse = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt
    });
    return response.text || "";
};
