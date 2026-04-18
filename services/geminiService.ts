import { GoogleGenAI, Type, ThinkingLevel, Modality } from "@google/genai";
import { BrandInput, BrandStrategy, BrandingPackage, ContentCalendarDay, EmailTemplate, BrandGuidelines, CompetitorAnalysis, BrandVoiceAnalysis } from "../types";

let _ai: GoogleGenAI | null = null;
const getAI = () => {
  if (!_ai) {
    const key = (import.meta as any).env?.VITE_API_KEY || '';
    if (!key) throw new Error('Gemini API key not configured. Set VITE_API_KEY in your .env file.');
    _ai = new GoogleGenAI({ apiKey: key });
  }
  return _ai;
};
const ai = new Proxy({} as GoogleGenAI, { get: (_, prop) => (getAI() as any)[prop] });

const safeParseJSON = <T>(text: string | undefined, fallback: T): T => {
  try {
    return JSON.parse(text || JSON.stringify(fallback));
  } catch {
    console.warn('Failed to parse Gemini response as JSON, using fallback');
    return fallback;
  }
};

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
    return safeParseJSON<string[]>(response.text, []);
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
    return safeParseJSON<any>(response.text, {});
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
      You are an AI creative branding consultant for XELA Creative Branding Studio specializing in the Florida market. Generate EXACTLY 10 high-conversion, emotionally impactful, and legally compliant branding packages for:
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
      
      PRICING STRATEGY (FLORIDA SERVICE BUSINESS RATES):
      - Budget: $75 - $175
      - Premium: $350 - $650
      - Elite: $850 - $2,000
      
      REQUIRED PACKAGE TYPES (Generate exactly 10 using these EXACT names and tiers):
      1. The Sovereignty Set (Elite, $349-$399)
      2. Promotion Pal (Budget, $149-$199)
      3. Selling Sales Set (Premium, $249-$299)
      4. CardCut Calibrated (Budget, $149-$199)
      5. Site Sales Solution (Elite, $349-$399)
      6. Registered Rebellion (Premium, $249-$299)
      7. Entrepreneurship Enterprise (Elite, $349-$399)
      8. Premiere Passion Pal (Premium, $249-$299)
      9. Sticker System (Budget, $149-$199)
      10. Ultimate Premium Suite (Elite, $349-$399)
      
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
    return safeParseJSON<any[]>(response.text, []);
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
    return safeParseJSON<any>(response.text, {});
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
    return safeParseJSON<any[]>(response.text, []);
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
    return safeParseJSON<any[]>(response.text, []);
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
    return safeParseJSON<any>(response.text, {});
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
    return safeParseJSON<any>(response.text, {});
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
    return safeParseJSON<any>(response.text, {});
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
            systemInstruction: "You are Xela, the AI creative branding consultant for XELA Creative Branding Studio. You are assertive, professional, and deeply knowledgeable about the Florida market, high-precision manufacturing (Cricut/HP), and AI-driven business growth. You deliver high-conversion results and do not settle for average. Your tone is sophisticated, authoritative, and results-oriented."
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

export const generateFlowAdaptation = async (
  sourceContext: string,
  targetTab: string,
  brandContext: { companyName: string; industry: string; vibe: string; audience: string }
): Promise<any> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Given this brand context for ${brandContext.companyName} (${brandContext.industry}, ${brandContext.vibe} vibe, targeting ${brandContext.audience}):

${sourceContext}

Adapt and generate optimized content for the "${targetTab}" section. Return relevant JSON.`;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export interface WhiteLabelKit {
  brandGuidelines: string;
  colorSpec: string;
  typographySpec: string;
  voiceGuidelines: string;
  socialTemplateDescriptions: string[];
  clientIntroLetter: string;
}

export const generateWhiteLabelKit = async (
  input: BrandInput,
  strategy: BrandStrategy,
  clientBusiness: string
): Promise<WhiteLabelKit> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a white-label brand kit for ${input.companyName} to deliver to client "${clientBusiness}".
Remove all Xela Studio references. Make it look like ${input.companyName} created it.

Brand context:
- Colors: ${JSON.stringify(strategy.colorPalette)}
- Typography: ${JSON.stringify(strategy.typographyRecommendation)}
- Voice: ${strategy.brandVoice}
- Industry: ${input.industry}

Return JSON:
{
  "brandGuidelines": "comprehensive usage guidelines",
  "colorSpec": "color palette with hex codes and rules",
  "typographySpec": "font pairing and hierarchy",
  "voiceGuidelines": "tone, vocabulary, dos and donts",
  "socialTemplateDescriptions": ["5 social template descriptions"],
  "clientIntroLetter": "professional delivery letter"
}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export interface PitchDeck {
  problemStatement: string;
  solutionStatement: string;
  marketSize: { tam: string; sam: string; som: string };
  revenueModel: string;
  tractionSignals: string[];
  competitiveMoat: string;
  askAndUse: string;
  investorReadinessScore: number;
  scoreReasoning: string;
  improvements: string[];
}

export const generatePitchDeck = async (
  input: BrandInput,
  strategy: BrandStrategy
): Promise<PitchDeck> => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `You are a startup pitch deck strategist. Generate an investor pitch deck for this Florida-based business:

Brand: ${input.companyName}
Industry: ${input.industry}
Target: ${input.audience}
Location: ${input.location}
Services: ${input.services?.join(', ')}
Mission: ${strategy.missionStatement}
Vision: ${strategy.visionStatement}
Brand Voice: ${strategy.brandVoice}

Return JSON:
{
  "problemStatement": "compelling problem",
  "solutionStatement": "unique solution",
  "marketSize": { "tam": "$X total", "sam": "$X serviceable", "som": "$X obtainable" },
  "revenueModel": "pricing and revenue strategy",
  "tractionSignals": ["3-5 highlight items"],
  "competitiveMoat": "defensibility",
  "askAndUse": "funding ask + allocation",
  "investorReadinessScore": 0-100,
  "scoreReasoning": "why this score",
  "improvements": ["3-4 improvements"]
}

Score honestly for a Florida solopreneur.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json", thinkingConfig: { thinkingLevel: "HIGH" as any } }
  });
  return JSON.parse(response.text || "{}");
};

export interface RevenueProjection {
  monthlyRevenue: number[];
  breakEvenMonth: number;
  roiMultiplier: string;
  upsellTrigger: string;
  competitorBenchmark: string;
  assumptions: string[];
}

export const generateRevenueProjection = async (
  packageTier: string,
  packagePrice: number,
  industry: string,
  location: string,
  monthlyClientGoal: number
): Promise<RevenueProjection> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a Florida market business analyst. Generate a realistic 12-month revenue projection for a ${industry} business in ${location}.

Package tier: ${packageTier} at $${packagePrice}
Monthly client acquisition goal: ${monthlyClientGoal}

Return JSON:
{
  "monthlyRevenue": [12 numbers representing monthly revenue with realistic growth curve],
  "breakEvenMonth": number (1-12),
  "roiMultiplier": "string like 5.2x",
  "upsellTrigger": "when to upgrade tier",
  "competitorBenchmark": "one sentence comparing to local market",
  "assumptions": ["3-4 key assumptions"]
}

Be realistic for Florida small business rates. Include seasonal variations.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateAgentResponse = async (
  agentId: string,
  userMessage: string,
  brandContext: { companyName: string; industry: string; vibe: string; audience: string; brandVoice: string },
  conversationHistory: Array<{role: string, text: string}>
): Promise<string> => {
  const agentPrompts: Record<string, string> = {
    'logo-refiner': `You are LogoRefiner, a specialist AI agent focused exclusively on logo design iteration. You help refine logo concepts through style transfer, color adjustments, and compositional improvements. Be specific about design elements.`,
    'copy-smith': `You are CopySmith, a specialist AI copywriter. You craft taglines, elevator pitches, bios, and marketing copy. Every word must earn its place. Be punchy and memorable.`,
    'color-harmonist': `You are ColorHarmonist, a color theory expert. You build palettes from mood, industry, and psychology. Always provide hex codes and explain the emotional impact.`,
    'brand-voice': `You are BrandVoice, a tone-of-voice strategist. You define vocabulary, cadence, dos/don'ts, and communication guidelines. Be precise about what the brand sounds like.`,
    'audience-profiler': `You are AudienceProfiler, a market research specialist. You build detailed ideal client avatars with demographics, psychographics, pain points, and buying triggers.`,
    'competitor-scout': `You are CompetitorScout, a competitive intelligence analyst. You identify positioning gaps, whitespace opportunities, and differentiation strategies.`,
    'package-pricer': `You are PackagePricer, a pricing strategist for the Florida market. You recommend service pricing based on market rates, cost structure, and value perception.`,
    'social-scheduler': `You are SocialScheduler, a social media strategist. You create platform-specific post drafts with captions, hashtags, and visual direction. Focus on engagement.`,
  };

  const systemPrompt = `${agentPrompts[agentId] || 'You are a helpful branding assistant.'}

Brand context:
- Company: ${brandContext.companyName}
- Industry: ${brandContext.industry}
- Vibe: ${brandContext.vibe}
- Audience: ${brandContext.audience}
- Voice: ${brandContext.brandVoice}

Be concise, actionable, and specific to this brand. No generic advice.`;

  const historyFormatted = conversationHistory.map(m =>
    `${m.role === 'user' ? 'User' : 'Agent'}: ${m.text}`
  ).join('\n');

  const model = "gemini-3-flash-preview";
  const fullPrompt = `${systemPrompt}\n\nConversation so far:\n${historyFormatted}\n\nUser: ${userMessage}\n\nAgent:`;

  const response = await ai.models.generateContent({
    model,
    contents: fullPrompt
  });
  return response.text || "I couldn't process that. Try rephrasing your request.";
};

export const buildBrandBotFromChat = async (
  conversation: Array<{role: string, text: string}>,
  brandContext: { companyName: string; industry: string; vibe: string; audience: string; brandVoice: string }
): Promise<{name: string; purpose: string; systemPrompt: string; triggerPhrases: string[]}> => {
  const model = "gemini-3-flash-preview";
  const conversationText = conversation.map(m => `${m.role}: ${m.text}`).join('\n');

  const prompt = `Based on this conversation where a user described what they want their personal branding bot to do, extract a structured bot configuration.

Brand context:
- Company: ${brandContext.companyName}
- Industry: ${brandContext.industry}
- Vibe: ${brandContext.vibe}
- Audience: ${brandContext.audience}
- Voice: ${brandContext.brandVoice}

Conversation:
${conversationText}

Return JSON:
{
  "name": "short catchy bot name (2-3 words)",
  "purpose": "one sentence describing what this bot does",
  "systemPrompt": "detailed system prompt that will make this bot perform its task perfectly, incorporating the brand context above",
  "triggerPhrases": ["3-5 example phrases that would invoke this bot"]
}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const chatWithBrandBot = async (
  userMessage: string,
  botSystemPrompt: string,
  history: Array<{role: string, text: string}>
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const historyText = history.map(m => `${m.role === 'user' ? 'User' : 'Bot'}: ${m.text}`).join('\n');
  const fullPrompt = `${botSystemPrompt}\n\nConversation:\n${historyText}\n\nUser: ${userMessage}\n\nBot:`;
  const response = await ai.models.generateContent({ model, contents: fullPrompt });
  return response.text || "Sorry, I couldn't process that.";
};

export interface WorkPlan {
  steps: Array<{
    id: string;
    label: string;
    functionName: string;
  }>;
}

export const decomposeWorkRequest = async (
  userRequest: string,
  brandContext: { companyName: string; industry: string; vibe: string; audience: string }
): Promise<WorkPlan> => {
  const model = "gemini-3-flash-preview";
  const availableFunctions = [
    'generateBrandStrategy - full brand strategy with taglines, mission, vision, colors, typography',
    'generateBrandingPackages - 10 tiered branding packages with pricing',
    'generateContentCalendar - 30-day social media calendar',
    'generateEmailTemplates - 5 email marketing templates',
    'generateBrandGuidelines - formal brand guidelines document',
    'generateAdAssets - video ad concepts, scripts, optimization tips',
    'generateFlyerCopy - flyer headline, hook, call to action',
    'generateBrandStory - brand narrative and origin story',
    'regenerateTaglines - 8 new tagline options',
    'generateSalesPitch - persuasive sales pitch',
  ];

  const prompt = `You are a task planner for an AI branding studio. The user wants:
"${userRequest}"

Available functions:
${availableFunctions.join('\n')}

Brand context: ${brandContext.companyName} (${brandContext.industry}, ${brandContext.vibe} vibe, targeting ${brandContext.audience})

Decompose this request into a sequence of function calls. Order matters — put foundational steps first.

Return JSON:
{
  "steps": [
    { "id": "step-1", "label": "human-readable description", "functionName": "exact function name from the list" }
  ]
}

Only include functions that are actually needed. Max 6 steps.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || '{"steps":[]}');
};

export const generateCallScript = async (
  input: BrandInput,
  strategy: BrandStrategy,
  clientName: string,
  clientBusiness: string,
  objective: string,
  knownObjections?: string
): Promise<{opener: string; valueProposition: string; objectionResponses: Array<{objection: string; response: string}>; closingStatement: string; followUpActions: string[]}> => {
  const model = "gemini-3-flash-preview";
  const packages = strategy.packages?.slice(0, 3).map(p => `${p.name} (${p.tier}, ${p.price})`).join(', ') || 'various packages available';

  const prompt = `Generate a sales call script for ${input.companyName} calling ${clientName} at ${clientBusiness}.

Call objective: ${objective}
Brand voice: ${strategy.brandVoice}
Packages offered: ${packages}
Known objections to address: ${knownObjections || 'none specified'}

Return JSON:
{
  "opener": "natural, confident opening line (2-3 sentences)",
  "valueProposition": "compelling value pitch tailored to the client (3-4 sentences)",
  "objectionResponses": [{"objection": "likely pushback", "response": "confident rebuttal"}] (3-4 pairs),
  "closingStatement": "call-to-action close (2 sentences)",
  "followUpActions": ["3-4 post-call action items"]
}

Write in first person as if the caller is speaking. Be natural, not robotic. Florida market tone.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const simulateClientResponse = async (
  userMessage: string,
  clientPersona: string,
  clientName: string,
  clientBusiness: string,
  conversationHistory: Array<{role: string; text: string}>
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const historyText = conversationHistory.map(m => `${m.role === 'user' ? 'Salesperson' : 'Client'}: ${m.text}`).join('\n');

  const prompt = `You are ${clientName} from ${clientBusiness}. You are a ${clientPersona} potential client receiving a sales call.

Personality:
- friendly: warm but still needs convincing, asks genuine questions
- skeptical: doubts claims, asks for proof and references
- busy: short responses, wants to get to the point fast
- price-sensitive: likes the idea but pushes back on cost

Conversation so far:
${historyText}

Salesperson: ${userMessage}

Respond as the ${clientPersona} client in 1-3 natural sentences. Stay in character.`;

  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || "Sorry, can you repeat that?";
};

export const generateChallengeKit = async (
  industry: string,
  location: string
): Promise<{brief: string; theme: string; criteria: string[]; exampleEntries: string[]; judgingRubric: Array<{criterion: string; weight: number; description: string}>; winnerSpotlightCopy: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a monthly branding challenge for creative entrepreneurs in ${location}, focused on the ${industry} space.

Return JSON:
{
  "brief": "2-3 sentence challenge description",
  "theme": "catchy challenge theme name",
  "criteria": ["4-5 submission criteria"],
  "exampleEntries": ["3 example brand concepts that would be strong entries"],
  "judgingRubric": [{"criterion": "name", "weight": 25, "description": "what judges look for"}] (4 items totaling 100),
  "winnerSpotlightCopy": "template winner announcement paragraph with [WINNER_NAME] placeholder"
}

Make it exciting and specific to Florida small businesses.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateGrantProposal = async (
  input: BrandInput,
  strategy: BrandStrategy,
  grantName: string,
  grantAmount: string,
  grantPlatform: string,
  grantDescription?: string
): Promise<{projectTitle: string; narrative: string; budgetBreakdown: Array<{item: string; amount: string; justification: string}>; timeline: Array<{phase: string; duration: string; deliverables: string}>; portfolioStrategy: string; submissionChecklist: string[]; talkingPoints: string[]}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a compelling grant proposal for ${input.companyName} (${input.industry}) applying to:
Grant: ${grantName} (${grantAmount}) on ${grantPlatform}
${grantDescription ? `Description: ${grantDescription}` : ''}

Brand context:
- Mission: ${strategy.missionStatement}
- Vision: ${strategy.visionStatement}
- Services: ${input.services?.join(', ')}
- Location: ${input.location}

Return JSON:
{
  "projectTitle": "catchy project name",
  "narrative": "500-word creative vision pitch",
  "budgetBreakdown": [{"item": "line item", "amount": "$X", "justification": "why needed"}] (5-6 items),
  "timeline": [{"phase": "name", "duration": "X weeks", "deliverables": "what gets done"}] (4 phases),
  "portfolioStrategy": "which work to showcase and how to frame it",
  "submissionChecklist": ["step-by-step filing instructions"] (6-8 items),
  "talkingPoints": ["elevator pitch bullets for interview round"] (4-5 items)
}

Make it compelling for a Florida solopreneur applying to a competitive fund.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const generateAssetBundleManifest = async (
  input: BrandInput,
  strategy: BrandStrategy
): Promise<{imagePrompts: Array<{description: string; style: string; usage: string}>; videoPrompts: Array<{description: string; duration: string; usage: string}>; audioPrompts: Array<{description: string; type: string; usage: string}>; socialTemplates: Array<{platform: string; description: string; dimensions: string}>}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a brand-matched asset bundle manifest for ${input.companyName} (${input.industry}).

Brand context:
- Colors: ${JSON.stringify(strategy.colorPalette)}
- Vibe: ${input.vibe}
- Audience: ${input.audience}
- Voice: ${strategy.brandVoice}

Return JSON:
{
  "imagePrompts": [{"description": "detailed image prompt", "style": "photography style", "usage": "where to use this"}] (5 images),
  "videoPrompts": [{"description": "video concept", "duration": "3-5s", "usage": "where to use"}] (2 videos),
  "audioPrompts": [{"description": "audio description", "type": "sting/bumper/hold", "usage": "where to use"}] (3 audio),
  "socialTemplates": [{"platform": "Instagram/TikTok/etc", "description": "template layout", "dimensions": "1080x1080"}] (2 templates)
}

All assets must match the brand palette and vibe. Be specific enough that each prompt could be used directly for AI generation.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "{}");
};

export const translateBrandFormat = async (
  input: BrandInput,
  strategy: BrandStrategy,
  targetFormat: string
): Promise<{ content: string; filename: string }> => {
  // Local transforms (no AI needed)
  if (targetFormat === 'css-variables') {
    const css = `:root {\n  --brand-primary: ${strategy.colorPalette.primary};\n  --brand-secondary: ${strategy.colorPalette.secondary};\n  --brand-accent: ${strategy.colorPalette.accent};\n  --brand-background: ${strategy.colorPalette.background};\n  --font-heading: '${strategy.typographyRecommendation.headingFont}', serif;\n  --font-body: '${strategy.typographyRecommendation.bodyFont}', sans-serif;\n}`;
    return { content: css, filename: `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-variables.css` };
  }
  if (targetFormat === 'canva-palette') {
    const palette = { colors: [strategy.colorPalette.primary, strategy.colorPalette.secondary, strategy.colorPalette.accent, strategy.colorPalette.background] };
    return { content: JSON.stringify(palette, null, 2), filename: `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-canva.colors` };
  }
  if (targetFormat === 'tailwind-config') {
    const config = `// Tailwind brand theme\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        brand: {\n          primary: '${strategy.colorPalette.primary}',\n          secondary: '${strategy.colorPalette.secondary}',\n          accent: '${strategy.colorPalette.accent}',\n          bg: '${strategy.colorPalette.background}',\n        }\n      },\n      fontFamily: {\n        heading: ['${strategy.typographyRecommendation.headingFont}', 'serif'],\n        body: ['${strategy.typographyRecommendation.bodyFont}', 'sans-serif'],\n      }\n    }\n  }\n}`;
    return { content: config, filename: `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-tailwind.config.js` };
  }
  if (targetFormat === 'invoice-items') {
    const items = (strategy.packages || []).map(p => `${p.name}\t${p.tier}\t${p.price}\t${p.description}`).join('\n');
    const header = 'Package Name\tTier\tPrice\tDescription\n';
    return { content: header + items, filename: `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-invoice-items.tsv` };
  }

  // AI-powered transforms
  const model = "gemini-3-flash-preview";
  const formatPrompts: Record<string, string> = {
    'email-signature': `Generate an HTML email signature for ${input.companyName}. Use colors: primary ${strategy.colorPalette.primary}, secondary ${strategy.colorPalette.secondary}. Font: ${strategy.typographyRecommendation.bodyFont}. Include company name, tagline "${strategy.taglines?.[0] || ''}", and contact placeholders. Return ONLY the HTML code, no markdown.`,
    'brand-one-pager': `Write a single-page brand summary for ${input.companyName}. Include: mission, vision, brand voice, color palette description, typography, and 3 key differentiators. Voice: ${strategy.brandVoice}. Keep under 500 words. Return plain text.`,
    'google-bio': `Write a Google Business Profile description for ${input.companyName} (${input.industry}) in ${input.location}. Must be under 750 characters. Include services: ${input.services?.join(', ')}. Voice: ${strategy.brandVoice}. Return ONLY the description text.`,
    'social-captions': `Write 5 social media captions for ${input.companyName} in brand voice: ${strategy.brandVoice}. Mix platforms (Instagram, Facebook, LinkedIn). Include hashtag suggestions. Return as numbered list.`,
  };

  const prompt = formatPrompts[targetFormat] || `Translate the brand strategy for ${input.companyName} into ${targetFormat} format.`;
  const response = await ai.models.generateContent({ model, contents: prompt });
  const ext = targetFormat === 'email-signature' ? 'html' : 'txt';
  return { content: response.text || '', filename: `${input.companyName.toLowerCase().replace(/\s+/g, '-')}-${targetFormat}.${ext}` };
};

export const compileBrandToFormat = async (
  strategy: BrandStrategy,
  input: BrandInput,
  format: string
): Promise<{ content: string; filename: string; mimeType: string }> => {
  const slug = input.companyName.toLowerCase().replace(/\s+/g, '-');

  // Local transforms
  if (format === 'css') {
    const css = `:root {\n  /* ${input.companyName} Brand */\n  --brand-primary: ${strategy.colorPalette.primary};\n  --brand-secondary: ${strategy.colorPalette.secondary};\n  --brand-accent: ${strategy.colorPalette.accent};\n  --brand-bg: ${strategy.colorPalette.background};\n  --font-heading: '${strategy.typographyRecommendation.headingFont}', serif;\n  --font-body: '${strategy.typographyRecommendation.bodyFont}', sans-serif;\n}`;
    return { content: css, filename: `${slug}-brand.css`, mimeType: 'text/css' };
  }
  if (format === 'canva') {
    const colors = [strategy.colorPalette.primary, strategy.colorPalette.secondary, strategy.colorPalette.accent, strategy.colorPalette.background];
    return { content: JSON.stringify({ version: 1, colors }, null, 2), filename: `${slug}.colors`, mimeType: 'application/json' };
  }
  if (format === 'figma') {
    const tokens = { color: { primary: { value: strategy.colorPalette.primary, type: 'color' }, secondary: { value: strategy.colorPalette.secondary, type: 'color' }, accent: { value: strategy.colorPalette.accent, type: 'color' } }, fontFamily: { heading: { value: strategy.typographyRecommendation.headingFont, type: 'fontFamilies' }, body: { value: strategy.typographyRecommendation.bodyFont, type: 'fontFamilies' } } };
    return { content: JSON.stringify(tokens, null, 2), filename: `${slug}-tokens.json`, mimeType: 'application/json' };
  }
  if (format === 'cmyk') {
    const hexToRgb = (hex: string) => { const r = parseInt(hex.slice(1,3),16)/255; const g = parseInt(hex.slice(3,5),16)/255; const b = parseInt(hex.slice(5,7),16)/255; return {r,g,b}; };
    const rgbToCmyk = (r: number, g: number, b: number) => { const k = 1 - Math.max(r,g,b); if (k===1) return {c:0,m:0,y:0,k:100}; return { c: Math.round((1-r-k)/(1-k)*100), m: Math.round((1-g-k)/(1-k)*100), y: Math.round((1-b-k)/(1-k)*100), k: Math.round(k*100) }; };
    const convert = (hex: string, label: string) => { const {r,g,b} = hexToRgb(hex); const cmyk = rgbToCmyk(r,g,b); return `${label}: ${hex} → C${cmyk.c} M${cmyk.m} Y${cmyk.y} K${cmyk.k}`; };
    const content = `${input.companyName} — Print Color Specification\n${'='.repeat(40)}\n${convert(strategy.colorPalette.primary, 'Primary')}\n${convert(strategy.colorPalette.secondary, 'Secondary')}\n${convert(strategy.colorPalette.accent, 'Accent')}\n${convert(strategy.colorPalette.background, 'Background')}\n\nNote: CMYK values are approximate conversions. Verify with your printer.`;
    return { content, filename: `${slug}-cmyk-spec.txt`, mimeType: 'text/plain' };
  }

  // AI-powered transforms
  const model = "gemini-3-flash-preview";
  const prompts: Record<string, string> = {
    'shopify': `Generate a Shopify Liquid snippet for ${input.companyName} brand colors and fonts. Colors: primary ${strategy.colorPalette.primary}, secondary ${strategy.colorPalette.secondary}, accent ${strategy.colorPalette.accent}. Fonts: ${strategy.typographyRecommendation.headingFont} / ${strategy.typographyRecommendation.bodyFont}. Return ONLY valid Liquid/CSS code.`,
    'wordpress': `Generate a WordPress theme CSS file for ${input.companyName}. Include custom properties, body/heading font imports from Google Fonts, and basic typography rules. Colors: ${JSON.stringify(strategy.colorPalette)}. Fonts: ${strategy.typographyRecommendation.headingFont} / ${strategy.typographyRecommendation.bodyFont}. Return ONLY valid CSS.`,
  };

  const response = await ai.models.generateContent({ model, contents: prompts[format] || `Export ${input.companyName} brand as ${format} format.` });
  const exts: Record<string, string> = { shopify: 'liquid', wordpress: 'css' };
  return { content: response.text || '', filename: `${slug}-brand.${exts[format] || 'txt'}`, mimeType: 'text/plain' };
};

export const generateBrandCertificate = async (
  input: BrandInput,
  strategy: BrandStrategy,
  brandHash: string,
  timestamp: string
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a formal Brand Certificate of Origin for:

Company: ${input.companyName}
Owner: ${input.ownerName || input.companyName}
Industry: ${input.industry}
Location: ${input.location}
Brand Hash (SHA-256): ${brandHash}
Timestamp: ${timestamp}
Mission: ${strategy.missionStatement}

Write a professional certificate document that:
1. Certifies the brand identity was created on this date
2. Lists the brand hash as the unique fingerprint
3. States the owner as the original creator
4. Includes a brief brand summary (mission, colors, voice)
5. Has a verification clause explaining the hash can be reproduced

Write in formal legal-adjacent language but keep it accessible. This should feel like a real certificate the owner would frame in their shop.`;

  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || '';
};

export const generateBrandVaultManifest = async (
  input: BrandInput,
  strategy: BrandStrategy
): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate an offline Brand Book summary for ${input.companyName}. This is a comprehensive, beautifully formatted plain-text document that captures the entire brand identity.

Include sections:
1. Brand Overview (name, industry, location, audience)
2. Mission & Vision
3. Brand Voice & Values
4. Color Palette (with hex codes and usage guidelines)
5. Typography (fonts and hierarchy)
6. Taglines (all ${strategy.taglines?.length || 0} taglines)
7. Social Media Strategy Summary
8. Package Offerings Summary

Brand data:
- Mission: ${strategy.missionStatement}
- Vision: ${strategy.visionStatement}
- Voice: ${strategy.brandVoice}
- Colors: ${JSON.stringify(strategy.colorPalette)}
- Typography: ${JSON.stringify(strategy.typographyRecommendation)}
- Taglines: ${strategy.taglines?.join(', ')}

Write it as a professional brand book. This document must be complete enough that if every other system went offline, the brand could be rebuilt from this alone.`;

  const response = await ai.models.generateContent({ model, contents: prompt });
  return response.text || '';
};

// --- Bank Capability Functions (Human Model gap-fillers) ---

// UC-04: Dispute Resolution
export const classifyDispute = async (
  disputeText: string,
  memberContext: string
): Promise<{category: string; severity: 'low'|'medium'|'high'|'critical'; suggestedResolution: string; escalationNeeded: boolean; regulatoryFlags: string[]; memberCommunication: string; timelineEstimate: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union dispute resolution specialist. Classify and route this member dispute.

Dispute: ${disputeText}
Member context: ${memberContext}

Return JSON:
{
  "category": "unauthorized-transaction|billing-error|service-complaint|fraud-claim|fee-dispute|account-access",
  "severity": "low|medium|high|critical",
  "suggestedResolution": "specific action steps for the credit union",
  "escalationNeeded": true/false,
  "regulatoryFlags": ["Reg E" or "Reg Z" or other applicable regulations],
  "memberCommunication": "draft response to the member in plain English, empathetic and clear",
  "timelineEstimate": "expected resolution timeframe"
}

Be specific to credit union regulations. Err on the side of protecting the member.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-03: Loan Processing
export const processLoanApplication = async (
  applicantInfo: string,
  loanType: string,
  amount: string
): Promise<{eligibility: string; riskScore: number; suggestedRate: string; requiredDocuments: string[]; conditions: string[]; fairLendingCheck: string; nextSteps: string[]; decisionReasoning: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union loan officer AI assistant. Evaluate this loan application.

Applicant: ${applicantInfo}
Loan type: ${loanType}
Amount requested: ${amount}

Return JSON:
{
  "eligibility": "pre-qualified|needs-review|likely-decline|insufficient-info",
  "riskScore": 0-100 (100 = lowest risk),
  "suggestedRate": "rate range based on risk tier",
  "requiredDocuments": ["list of documents needed"],
  "conditions": ["any conditions for approval"],
  "fairLendingCheck": "note any fair lending considerations — this is critical for NCUA compliance",
  "nextSteps": ["ordered list of what happens next"],
  "decisionReasoning": "plain-English explanation suitable for the member"
}

CRITICAL: Always flag fair lending considerations. Never discriminate. When in doubt, escalate to human review.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-12: Document Processing
export const processDocument = async (
  documentText: string,
  documentType?: string
): Promise<{documentType: string; extractedFields: Record<string, string>; validationStatus: string; issues: string[]; confidence: number; nextAction: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union document processing specialist. Extract and validate data from this member-submitted document.

Document text: ${documentText.slice(0, 2000)}
Expected type: ${documentType || 'auto-detect'}

Return JSON:
{
  "documentType": "id-verification|proof-of-income|proof-of-address|tax-return|bank-statement|insurance|other",
  "extractedFields": {"field_name": "extracted_value"} — extract all relevant fields (name, address, dates, amounts, account numbers — REDACT last 4 of SSN/account),
  "validationStatus": "valid|needs-review|suspicious|incomplete",
  "issues": ["any problems found — expired dates, mismatched names, missing fields"],
  "confidence": 0-100,
  "nextAction": "what the credit union should do next with this document"
}

IMPORTANT: Redact sensitive data in your response. Show last 4 digits only for SSNs and account numbers.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-18: Identity Theft Monitoring
export const assessIdentityRisk = async (
  activityDescription: string,
  memberProfile: string
): Promise<{riskLevel: string; indicators: string[]; recommendedActions: string[]; memberNotification: string; regulatoryReport: boolean; evidenceToPreserve: string[]; urgency: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union identity theft detection specialist. Assess this activity for identity theft risk.

Activity: ${activityDescription}
Member profile: ${memberProfile}

Return JSON:
{
  "riskLevel": "none|low|medium|high|confirmed-theft",
  "indicators": ["specific indicators that triggered the assessment"],
  "recommendedActions": ["ordered steps the credit union should take"],
  "memberNotification": "draft notification to send to the member — clear, non-alarming, actionable",
  "regulatoryReport": true/false (does this require a SAR or other regulatory filing?),
  "evidenceToPreserve": ["specific evidence to document and preserve"],
  "urgency": "immediate|same-day|48-hours|routine"
}

Protect the member. When in doubt, escalate. Speed matters for identity theft.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-02: Account Inquiry + UC-17: Financial Literacy
export const handleMemberInquiry = async (
  inquiry: string,
  memberContext: string,
  productContext?: string
): Promise<{response: string; productExplanation: string | null; comparison: string | null; actionItems: string[]; followUpQuestions: string[]; literacyTip: string; sentiment: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union member service AI. Answer this member's question clearly and helpfully.

Member inquiry: ${inquiry}
Member context: ${memberContext}
Product context: ${productContext || 'general'}

Return JSON:
{
  "response": "direct, clear answer to the member's question in plain English",
  "productExplanation": "if the member is asking about a product, explain it simply — what it is, how it works, what it costs, who it's for. null if not applicable",
  "comparison": "if relevant, compare options the member should consider. null if not applicable",
  "actionItems": ["specific things the member can do next"],
  "followUpQuestions": ["questions the member might want to ask next"],
  "literacyTip": "one financial literacy insight that helps the member understand their situation better",
  "sentiment": "positive|neutral|concerned|frustrated — detected from the inquiry"
}

IMPORTANT: Never pressure the member into any product. Always present options neutrally. If the member seems frustrated, acknowledge it before solving.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-05: BSA/AML + UC-09: Fraud Detection — unified transaction monitor
export const monitorTransaction = async (
  transactionData: string,
  memberHistory: string
): Promise<{fraudScore: number; amlFlags: string[]; pattern: string; action: string; sarRequired: boolean; memberImpact: string; explanation: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union BSA/AML and fraud detection specialist. Analyze this transaction.

Transaction: ${transactionData}
Member history context: ${memberHistory}

Return JSON:
{
  "fraudScore": 0-100 (100 = definitely fraud),
  "amlFlags": ["specific BSA/AML red flags identified — structuring, layering, unusual patterns"],
  "pattern": "normal|unusual-but-explainable|suspicious|high-risk|known-fraud-pattern",
  "action": "approve|hold-for-review|block|escalate-to-bsa-officer",
  "sarRequired": true/false (does this trigger SAR filing requirements?),
  "memberImpact": "what happens to the member's transaction based on your recommendation",
  "explanation": "plain-English reasoning for the decision — this goes in the audit trail"
}

CRITICAL: False positives are costly to member trust. False negatives are costly to the institution. Calibrate carefully.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-01: Member Onboarding
export const onboardMember = async (
  memberInfo: string, accountType: string
): Promise<{verificationSteps: string[]; accountConfig: Record<string,string>; welcomeMessage: string; requiredDocuments: string[]; complianceChecks: string[]; estimatedTime: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Credit union new member onboarding. Member: ${memberInfo}. Account type: ${accountType}. Return JSON: {"verificationSteps":["ordered ID verification steps"],"accountConfig":{"setting":"value"},"welcomeMessage":"personalized welcome","requiredDocuments":["docs needed"],"complianceChecks":["CIP/BSA checks to run"],"estimatedTime":"how long this takes"}. Follow NCUA CIP requirements.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-06: NCUA Exam Prep
export const prepareNCUAExam = async (
  area: string, currentState: string
): Promise<{selfAssessment: Array<{item: string; status: string; gap: string}>; documentationNeeded: string[]; remediationPlan: string[]; timeline: string; riskRating: string; examinerExpectations: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Credit union NCUA exam preparation for: ${area}. Current state: ${currentState}. Return JSON: {"selfAssessment":[{"item":"exam area","status":"compliant|gap|critical","gap":"what's missing"}],"documentationNeeded":["specific docs"],"remediationPlan":["ordered fix steps"],"timeline":"realistic prep time","riskRating":"low|moderate|high","examinerExpectations":"what the examiner will look for"}. Be thorough — NCUA examiners are detail-oriented.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-07: Fair Lending Analysis
export const analyzeFairLending = async (
  lendingData: string, demographic: string
): Promise<{disparateImpactFound: boolean; metrics: Record<string,number>; affectedGroups: string[]; rootCauses: string[]; remediationSteps: string[]; regulatoryRisk: string; documentationRequired: string[]}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Fair lending analysis for credit union. Lending data: ${lendingData}. Demographics: ${demographic}. Return JSON: {"disparateImpactFound":true/false,"metrics":{"approval_rate_diff":0.0,"pricing_variance":0.0},"affectedGroups":["groups showing disparate treatment"],"rootCauses":["what's causing any disparity"],"remediationSteps":["specific fixes"],"regulatoryRisk":"low|moderate|high|critical","documentationRequired":["what to document for NCUA"]}. ECOA and Fair Housing Act compliance required.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-08: Vendor Risk Assessment
export const assessVendorRisk = async (
  vendorInfo: string, serviceType: string
): Promise<{riskScore: number; category: string; findings: Array<{area: string; risk: string; recommendation: string}>; dueDiligenceChecklist: string[]; contractRequirements: string[]; ongoingMonitoring: string[]}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Third-party vendor risk assessment for credit union. Vendor: ${vendorInfo}. Service: ${serviceType}. Return JSON: {"riskScore":0-100,"category":"critical|significant|moderate|low","findings":[{"area":"security|compliance|financial|operational","risk":"specific risk","recommendation":"mitigation"}],"dueDiligenceChecklist":["items to verify"],"contractRequirements":["clauses needed"],"ongoingMonitoring":["what to monitor"]}. Follow FFIEC third-party risk guidance.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-10: Social Engineering Defense (enhanced)
export const detectSocialEngineering = async (
  communication: string, channel: string
): Promise<{threatLevel: string; attackType: string; indicators: string[]; memberGuidance: string; staffAction: string; evidenceToPreserve: string[]; reportRequired: boolean}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Social engineering detection for credit union. Communication: ${communication.slice(0, 1500)}. Channel: ${channel}. Return JSON: {"threatLevel":"none|low|medium|high|active-attack","attackType":"phishing|vishing|smishing|deepfake|pretexting|baiting|none","indicators":["specific red flags"],"memberGuidance":"what to tell the member","staffAction":"what staff should do immediately","evidenceToPreserve":["what to save for investigation"],"reportRequired":true/false}. Protect the member first.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-11: Access Control
export const evaluateAccessRequest = async (
  requestor: string, resource: string, context: string
): Promise<{decision: string; reasoning: string; riskFactors: string[]; auditEntry: string; additionalVerification: string[]; policyReference: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Access control evaluation for credit union system. Requestor: ${requestor}. Resource: ${resource}. Context: ${context}. Return JSON: {"decision":"grant|deny|escalate|grant-with-monitoring","reasoning":"why this decision","riskFactors":["risk considerations"],"auditEntry":"what to log","additionalVerification":["extra steps if needed"],"policyReference":"which policy applies"}. Principle of least privilege. Separation of duties.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-13: Staff Knowledge Base
export const queryKnowledgeBase = async (
  question: string, department: string
): Promise<{answer: string; policySource: string; procedureSteps: string[]; relatedTopics: string[]; lastUpdated: string; escalationPath: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Credit union staff knowledge base query. Question: ${question}. Department: ${department}. Return JSON: {"answer":"clear, actionable answer","policySource":"which policy or regulation this comes from","procedureSteps":["step-by-step procedure if applicable"],"relatedTopics":["other things the staff member might need"],"lastUpdated":"note that policies should be verified against current versions","escalationPath":"who to ask if this answer isn't sufficient"}`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// UC-14: Report Generation
export const generateBoardReport = async (
  reportType: string, dataContext: string, period: string
): Promise<{title: string; executiveSummary: string; sections: Array<{heading: string; content: string; metrics: Record<string,string>}>; recommendations: string[]; complianceNotes: string[]; appendices: string[]}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Credit union ${reportType} report for ${period}. Context: ${dataContext}. Return JSON: {"title":"formal report title","executiveSummary":"2-3 sentence summary for board","sections":[{"heading":"section name","content":"section body","metrics":{"metric":"value"}}],"recommendations":["actionable items for the board"],"complianceNotes":["regulatory items to highlight"],"appendices":["supporting materials needed"]}. Board-ready language. Data-driven.`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// Universal Bank Router — routes any bank request to the right function
export const routeBankRequest = async (
  request: string,
  context: string
): Promise<{domain: string; function: string; confidence: number; reasoning: string}> => {
  const model = "gemini-3-flash-preview";
  const prompt = `You are a credit union AI router. Determine which capability should handle this request.

Request: ${request}
Context: ${context}

Available capabilities:
- classifyDispute: member disputes, complaints, charge reversals
- processLoanApplication: loan applications, eligibility, rate quotes
- processDocument: document verification, data extraction, OCR
- assessIdentityRisk: identity theft detection, suspicious activity
- handleMemberInquiry: balance questions, product info, financial literacy
- monitorTransaction: fraud detection, BSA/AML monitoring
- onboardMember: new member setup, ID verification, welcome
- prepareNCUAExam: exam prep, self-assessment, remediation
- analyzeFairLending: disparate impact, ECOA compliance
- assessVendorRisk: third-party risk, SOC2 review, due diligence
- detectSocialEngineering: phishing, vishing, deepfake, pretexting
- evaluateAccessRequest: RBAC, least privilege, audit logging
- queryKnowledgeBase: policy lookup, procedure guidance
- generateBoardReport: board reports, regulatory filings, statements

Return JSON:
{
  "domain": "member-services|compliance|security|operations|protection",
  "function": "exact function name from the list above",
  "confidence": 0-100,
  "reasoning": "why this function is the right match"
}`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

// --- Gemini Function Calling Tools ---

const xelaTools = [
    {
        functionDeclarations: [
            {
                name: "generate_brand_strategy",
                description: "Generate a comprehensive brand strategy including taglines, mission, vision, color palette, typography, and social media ideas. Use when the user asks to create or build their brand, wants a full strategy, or says 'get started'.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        industry: { type: Type.STRING, description: "Business industry or niche" },
                        vibe: { type: Type.STRING, description: "Brand aesthetic vibe (e.g., Modern, Rustic, Bold)" },
                        location: { type: Type.STRING, description: "Business location" },
                        audience: { type: Type.STRING, description: "Target audience description" },
                        notes: { type: Type.STRING, description: "Any additional context or preferences" }
                    },
                    required: ["companyName", "industry", "vibe"]
                }
            },
            {
                name: "generate_branding_packages",
                description: "Generate the 10 tiered branding packages (Budget/Premium/Elite) with pricing, deliverables, and terms. Use when the user asks about packages, pricing, what they can buy, or wants to see service offerings.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        industry: { type: Type.STRING, description: "Business industry" },
                        vibe: { type: Type.STRING, description: "Brand vibe" },
                        selectedTier: { type: Type.STRING, description: "Preferred tier: budget, premium, or elite" }
                    },
                    required: ["companyName", "industry"]
                }
            },
            {
                name: "generate_logo_concepts",
                description: "Generate AI logo concepts for the brand. Use when the user asks for a logo, icon, brand mark, or visual identity.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        industry: { type: Type.STRING, description: "Business industry" },
                        vibe: { type: Type.STRING, description: "Brand vibe" },
                        logoStyle: { type: Type.STRING, description: "Logo style: wordmark, icon, emblem, monogram, mascot, abstract" },
                        primaryColor: { type: Type.STRING, description: "Primary brand color hex code" },
                        fontChoice: { type: Type.STRING, description: "Preferred font style" }
                    },
                    required: ["companyName", "logoStyle", "primaryColor"]
                }
            },
            {
                name: "generate_business_names",
                description: "Brainstorm creative business name ideas. Use when the user needs help naming their company or wants name suggestions.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        industry: { type: Type.STRING, description: "Business industry" },
                        vibe: { type: Type.STRING, description: "Desired brand vibe" },
                        location: { type: Type.STRING, description: "Business location" },
                        keywords: { type: Type.STRING, description: "Keywords or themes to incorporate" }
                    },
                    required: ["industry", "vibe"]
                }
            },
            {
                name: "generate_mottos",
                description: "Generate catchy mottos and slogans for the brand. Use when the user wants taglines, slogans, mottos, or catchphrases.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        industry: { type: Type.STRING, description: "Business industry" },
                        vibe: { type: Type.STRING, description: "Brand vibe" },
                        context: { type: Type.STRING, description: "Additional context for the motto" }
                    },
                    required: ["companyName", "industry", "vibe"]
                }
            },
            {
                name: "generate_content_calendar",
                description: "Create a 30-day social media content calendar with daily posts, captions, and visual ideas. Use when the user asks about social media planning, content scheduling, or posting strategy.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        industry: { type: Type.STRING, description: "Business industry" },
                        vibe: { type: Type.STRING, description: "Brand vibe" }
                    },
                    required: ["companyName", "industry"]
                }
            },
            {
                name: "generate_email_templates",
                description: "Generate email marketing templates (Welcome, Promo, Newsletter, Follow-up, Re-engagement). Use when the user asks about email marketing, drip campaigns, or customer outreach.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        vibe: { type: Type.STRING, description: "Brand vibe" }
                    },
                    required: ["companyName"]
                }
            },
            {
                name: "generate_flyer_copy",
                description: "Write flyer copy with headline, hook, and call to action. Use when the user wants flyer text, print ad copy, or promotional materials.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        vibe: { type: Type.STRING, description: "Brand vibe" }
                    },
                    required: ["companyName"]
                }
            },
            {
                name: "generate_ad_assets",
                description: "Generate video ad concepts, promotional song ideas, hook scripts, and platform optimization tips. Use when the user asks about ads, video marketing, or promotional content.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        vibe: { type: Type.STRING, description: "Brand vibe" }
                    },
                    required: ["companyName"]
                }
            },
            {
                name: "generate_brand_guidelines",
                description: "Create a formal brand guidelines document covering logo usage, color usage, typography, voice & tone, and imagery. Use when the user asks for brand guidelines, style guide, or brand bible.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        brandVoice: { type: Type.STRING, description: "The brand's voice and tone" },
                        primaryColor: { type: Type.STRING, description: "Primary color hex" },
                        secondaryColor: { type: Type.STRING, description: "Secondary color hex" },
                        headingFont: { type: Type.STRING, description: "Heading font name" },
                        bodyFont: { type: Type.STRING, description: "Body font name" }
                    },
                    required: ["companyName"]
                }
            },
            {
                name: "analyze_competitor",
                description: "Analyze a competitor's website and compare against the user's brand. Use when the user mentions a competitor, asks for competitive analysis, or provides a competitor URL.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The user's business name" },
                        industry: { type: Type.STRING, description: "Business industry" },
                        competitorUrl: { type: Type.STRING, description: "The competitor's website URL" }
                    },
                    required: ["companyName", "industry", "competitorUrl"]
                }
            },
            {
                name: "generate_sales_pitch",
                description: "Write a persuasive sales pitch for the brand. Use when the user asks how to pitch, sell, or present their brand to clients.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        vibe: { type: Type.STRING, description: "Brand vibe" },
                        isFriend: { type: Type.BOOLEAN, description: "Whether this is a friend/family discount pitch" }
                    },
                    required: ["companyName"]
                }
            },
            {
                name: "generate_brand_story",
                description: "Write the brand's origin story and narrative. Use when the user asks for their brand story, about us copy, or founding narrative.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        vibe: { type: Type.STRING, description: "Brand vibe" }
                    },
                    required: ["companyName"]
                }
            },
            {
                name: "generate_sticker_slogans",
                description: "Generate short, punchy slogans for vinyl stickers and merchandise. Use when the user asks about stickers, merch, or short slogans.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        industry: { type: Type.STRING, description: "Business industry" }
                    },
                    required: ["companyName", "industry"]
                }
            },
            {
                name: "generate_song_lyrics",
                description: "Write promotional song lyrics or jingle for the brand. Use when the user asks for a jingle, theme song, or promotional music.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        companyName: { type: Type.STRING, description: "The business name" },
                        genre: { type: Type.STRING, description: "Music genre (e.g., Hip-Hop, Pop, Country)" },
                        topic: { type: Type.STRING, description: "Song topic or theme" }
                    },
                    required: ["companyName", "genre"]
                }
            },
            {
                name: "generate_image",
                description: "Generate an AI image for marketing materials, social posts, or branding visuals. Use when the user asks to create, design, or generate any visual/image/graphic.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        prompt: { type: Type.STRING, description: "Detailed image generation prompt" },
                        aspectRatio: { type: Type.STRING, description: "Aspect ratio: 1:1, 16:9, 9:16, 4:3, 3:4" }
                    },
                    required: ["prompt"]
                }
            },
            {
                name: "submit_alignment_calibration",
                description: "A secure channel for reporting operational deviations that frames findings as alignment data, not narrative collapse. Use when someone reports something wrong, flags a concern, wants to whistleblow safely, or identifies a process that isn't working. Treats reports as calibration metadata while keeping the core vision intact.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        observation: { type: Type.STRING, description: "The factual deviation observed — what was seen, no interpretation" },
                        impact_on_manifestation: { type: Type.STRING, description: "How this deviation slows down the Studio's ultimate goal" },
                        proposed_calibration: { type: Type.STRING, description: "The fix that returns the system to alignment" },
                        urgency: { type: Type.STRING, description: "low, medium, high, or critical" }
                    },
                    required: ["observation", "impact_on_manifestation", "proposed_calibration"]
                }
            },
            {
                name: "search_market_info",
                description: "Search the web for market research, Florida business regulations, competitor info, or industry trends. Use when the user asks about market data, regulations, legal requirements, or real-world business info.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: { type: Type.STRING, description: "The search query" }
                    },
                    required: ["query"]
                }
            }
        ]
    }
];

// Tool execution dispatcher
const executeToolCall = async (
    functionName: string,
    args: Record<string, any>,
    brandInput?: BrandInput,
    strategy?: BrandStrategy
): Promise<{ result: any; displayType: string }> => {
    const input: BrandInput = {
        companyName: args.companyName || brandInput?.companyName || '',
        industry: args.industry || brandInput?.industry || '',
        vibe: args.vibe || brandInput?.vibe || '',
        location: args.location || brandInput?.location || 'Florida',
        audience: args.audience || brandInput?.audience || '',
        services: brandInput?.services || [],
        additionalNotes: args.notes,
        selectedTier: args.selectedTier
    };

    const strat: BrandStrategy = strategy || {
        taglines: [], missionStatement: '', visionStatement: '',
        brandVoice: args.brandVoice || '', colorPalette: {
            primary: args.primaryColor || '#000000', secondary: args.secondaryColor || '#666666',
            accent: '#00FFCC', background: '#FFFFFF', explanation: ''
        },
        typographyRecommendation: {
            headingFont: args.headingFont || 'Playfair Display',
            bodyFont: args.bodyFont || 'Inter', reasoning: ''
        },
        socialMediaPostIdeas: []
    };

    switch (functionName) {
        case 'generate_brand_strategy':
            return { result: await generateBrandStrategy(input), displayType: 'strategy' };

        case 'generate_branding_packages':
            return { result: await generateBrandingPackages(input), displayType: 'packages' };

        case 'generate_logo_concepts':
            return { result: await generateLogoConcepts(input, args.logoStyle, args.primaryColor, undefined, args.fontChoice), displayType: 'logos' };

        case 'generate_business_names':
            return { result: await generateBusinessNames(input.industry, input.vibe, input.location, args.keywords), displayType: 'names' };

        case 'generate_mottos':
            return { result: await generateMottos(input.industry, input.vibe, input.companyName, args.context), displayType: 'mottos' };

        case 'generate_content_calendar':
            return { result: await generateContentCalendar(input, strat), displayType: 'calendar' };

        case 'generate_email_templates':
            return { result: await generateEmailTemplates(input, strat), displayType: 'emails' };

        case 'generate_flyer_copy':
            return { result: await generateFlyerCopy(input, strat), displayType: 'flyer' };

        case 'generate_ad_assets':
            return { result: await generateAdAssets(input, strat), displayType: 'ads' };

        case 'generate_brand_guidelines':
            return { result: await generateBrandGuidelines(input, strat), displayType: 'guidelines' };

        case 'analyze_competitor':
            return { result: await analyzeCompetitor(input, args.competitorUrl), displayType: 'competitor' };

        case 'generate_sales_pitch':
            return { result: await generateSalesPitch(input, strat, args.isFriend ?? true), displayType: 'pitch' };

        case 'generate_brand_story':
            return { result: await generateBrandStory(input, strat), displayType: 'story' };

        case 'generate_sticker_slogans':
            return { result: await generateStickerSlogans(input.industry, input.companyName), displayType: 'slogans' };

        case 'generate_song_lyrics':
            return { result: await generateSongLyrics(input, args.genre, args.topic), displayType: 'lyrics' };

        case 'generate_image':
            return { result: await generateImageNanoBanana2(args.prompt), displayType: 'image' };

        case 'search_market_info':
            return { result: await searchGrounding(args.query), displayType: 'search' };

        case 'submit_alignment_calibration':
            const calibration = {
                timestamp: new Date().toISOString(),
                observation: args.observation,
                impact: args.impact_on_manifestation,
                proposedFix: args.proposed_calibration,
                urgency: args.urgency || 'medium',
                status: 'received',
                verdict: 'pending_review',
                narrative_intact: true
            };
            // Production: write calibration to Firestore instead of console
            return {
                result: calibration,
                displayType: 'calibration'
            };

        default:
            return { result: null, displayType: 'text' };
    }
};

export interface ToolCallResult {
    toolName: string;
    displayType: string;
    data: any;
    summary: string;
}

export const chatWithTools = async (
    message: string,
    brandInput?: BrandInput,
    strategy?: BrandStrategy,
    history: Array<{ role: string; parts: any[] }> = []
): Promise<{ text: string; toolResults: ToolCallResult[] }> => {
    const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
            systemInstruction: `You are Xela, the AI creative branding consultant for XELA Creative Branding Studio. You are assertive, professional, and deeply knowledgeable about the Florida market, high-precision manufacturing (Cricut Explorer 3/HP Precision), and AI-driven business growth.

You have powerful tools at your disposal. When the user asks for anything creative — logos, brand strategy, packages, content calendars, marketing materials, competitor research, images, etc. — USE THE APPROPRIATE TOOL. Don't just describe what you could do; actually do it.

Current brand context:
${brandInput ? `Company: ${brandInput.companyName} | Industry: ${brandInput.industry} | Vibe: ${brandInput.vibe} | Location: ${brandInput.location} | Audience: ${brandInput.audience}` : 'No brand loaded yet — ask the user for their business details.'}

When you call a tool, ALSO provide a brief summary of what you generated in your text response. Be confident and results-oriented.`,
            tools: xelaTools
        },
        history
    });

    const response = await chat.sendMessage({ message });

    const toolResults: ToolCallResult[] = [];
    let textParts: string[] = [];

    for (const candidate of response.candidates || []) {
        for (const part of candidate.content?.parts || []) {
            if (part.text) {
                textParts.push(part.text);
            }
            if (part.functionCall) {
                const { name, args } = part.functionCall;
                try {
                    const { result, displayType } = await executeToolCall(name, args || {}, brandInput, strategy);

                    // Send function response back to get Gemini's summary
                    const followUp = await chat.sendMessage({
                        message: [{
                            functionResponse: {
                                name,
                                response: { result: typeof result === 'string' ? result : JSON.stringify(result).slice(0, 4000) }
                            }
                        }]
                    });

                    if (followUp.text) textParts.push(followUp.text);

                    toolResults.push({
                        toolName: name,
                        displayType,
                        data: result,
                        summary: followUp.text || `Generated ${displayType} successfully.`
                    });
                } catch (err: any) {
                    textParts.push(`I tried to generate that but hit an issue: ${err.message}. Let me try a different approach.`);
                }
            }
        }
    }

    return {
        text: textParts.join('\n\n') || "I'm ready to help — what would you like to create?",
        toolResults
    };
};

// --- News-to-Feature Service Functions (April 2026) ---

import { BrandVoiceProfile, SpokespersonConfig, ContractTemplate, GreenScoreData, VideoTierConfig } from "../types";

export const VIDEO_TIERS: VideoTierConfig[] = [
  { tier: 'lite', resolution: '720p', model: 'veo-3.1-lite', costPerSecond: 0.05, maxDuration: 10, nativeAudio: true },
  { tier: 'standard', resolution: '1080p', model: 'veo-3.1-fast-generate-preview', costPerSecond: 0.15, maxDuration: 15, nativeAudio: true },
  { tier: '4k', resolution: '4K', model: 'veo-3.1-generate-preview', costPerSecond: 0.40, maxDuration: 8, nativeAudio: true },
];

export const generateVideoWithTier = async (
  prompt: string,
  tier: VideoTierConfig,
  base64Image?: string,
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  const contents: any = base64Image
    ? { parts: [{ text: prompt }, { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } }] }
    : prompt;
  const response = await ai.models.generateContent({
    model: tier.model,
    contents,
    config: { responseModalities: [Modality.AUDIO, "VIDEO" as any] }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateBrandVoiceScripts = async (
  input: BrandInput,
  strategy: BrandStrategy,
  voiceName: string
): Promise<{ greeting: string; adScript: string; podcastIntro: string; taglineRead: string }> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate 4 voice scripts for ${input.companyName} brand voice "${voiceName}".
Brand voice: ${strategy.brandVoice}. Vibe: ${input.vibe}. Industry: ${input.industry}.

Return JSON:
{
  "greeting": "15-second phone greeting script",
  "adScript": "30-second radio/podcast ad",
  "podcastIntro": "15-second podcast intro",
  "taglineRead": "5-second tagline pronunciation guide"
}`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return safeParseJSON<any>(response.text, {});
};

export const generateSpeechWithVoice = async (text: string, voiceName: string = 'Zephyr'): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } }
    }
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};

export const generateSpokespersonScript = async (
  input: BrandInput,
  strategy: BrandStrategy,
  persona: SpokespersonConfig
): Promise<{ script: string; musicDirection: string; visualNotes: string }> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Write a 30-second brand spokesperson video script for ${input.companyName}.
Persona: ${persona.personaName} (${persona.style})
Avatar: ${persona.avatarDescription}
Brand voice: ${strategy.brandVoice}. Mission: ${strategy.missionStatement}.

Return JSON: { "script": "full spoken script with [PAUSE] markers", "musicDirection": "Lyria 3 music style suggestion", "visualNotes": "scene direction notes" }`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};

export const generateBrandMemoryInsight = async (
  input: BrandInput,
  strategy: BrandStrategy,
  memoryEntries: Array<{ type: string; content: string; timestamp: number }>
): Promise<{ insight: string; recommendations: string[]; evolutionScore: number; timeline: Array<{ date: string; event: string }> }> => {
  const model = "gemini-3.1-pro-preview";
  const entriesText = memoryEntries.map(e => `[${e.type}] ${e.content}`).join('\n');
  const prompt = `You are a brand evolution analyst. Given this brand's complete history and memory:

Brand: ${input.companyName} (${input.industry})
Current strategy: ${JSON.stringify({ mission: strategy.missionStatement, vision: strategy.visionStatement, voice: strategy.brandVoice })}

Memory entries:
${entriesText}

Analyze the brand's evolution and provide personalized insights.
Return JSON: { "insight": "2-3 sentence personalized brand evolution summary", "recommendations": ["3-5 strategic recommendations based on history"], "evolutionScore": 0-100, "timeline": [{"date": "YYYY-MM-DD", "event": "milestone"}] }`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json", thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } } });
  return JSON.parse(response.text || "{}");
};

export const generateContract = async (
  input: BrandInput,
  contractType: 'branding' | 'nda' | 'license' | 'retainer' | 'custom',
  clientName: string,
  packageName?: string,
  packagePrice?: string,
  customTerms?: string
): Promise<ContractTemplate> => {
  const model = "gemini-3.1-pro-preview";
  const prompt = `Generate a professional ${contractType} contract for:
Provider: ${input.companyName} (${input.location})
Client: ${clientName}
${packageName ? `Package: ${packageName} at ${packagePrice}` : ''}
${customTerms ? `Custom terms: ${customTerms}` : ''}

Return JSON:
{
  "id": "uuid",
  "type": "${contractType}",
  "title": "contract title",
  "parties": { "provider": "${input.companyName}", "client": "${clientName}" },
  "sections": [
    { "heading": "section name", "body": "section content" }
  ],
  "packageRef": "${packageName || ''}",
  "generatedAt": ${Date.now()}
}

Include sections: Scope of Work, Deliverables, Timeline, Payment Terms, Revisions, Intellectual Property, Confidentiality, Termination, Governing Law (Florida).`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json", thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH } } });
  return JSON.parse(response.text || "{}");
};

export const calculateGreenScore = (apiCallLog: Array<{ service: string; calls: number }>): GreenScoreData => {
  const KWH_PER_CALL = 0.0003;
  const CO2_PER_KWH = 0.42;
  const totalCalls = apiCallLog.reduce((sum, s) => sum + s.calls, 0);
  const estimatedKWh = totalCalls * KWH_PER_CALL;
  const carbonOffsetKg = estimatedKWh * CO2_PER_KWH;
  const rating = totalCalls < 50 ? 'A' : totalCalls < 200 ? 'B' : totalCalls < 500 ? 'C' : 'D';
  return {
    totalApiCalls: totalCalls,
    estimatedKWh: Math.round(estimatedKWh * 1000) / 1000,
    carbonOffsetKg: Math.round(carbonOffsetKg * 1000) / 1000,
    efficiencyRating: rating,
    badgeEligible: rating === 'A' || rating === 'B',
    breakdown: apiCallLog.map(s => ({ ...s, energy: Math.round(s.calls * KWH_PER_CALL * 1000) / 1000 }))
  };
};

export const generateSketchToLogo = async (
  base64Sketch: string,
  input: BrandInput,
  style: string
): Promise<string> => {
  const prompt = `Transform this rough hand-drawn sketch into a professional ${style} logo for ${input.companyName} (${input.industry}).
Use brand colors. Make it clean, scalable, and professional. Vibe: ${input.vibe}.`;
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: base64Sketch.split(',')[1], mimeType: 'image/png' } }
      ]
    },
    config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
  });
  return response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data || "";
};

export const generateDeployableAgentEmbed = async (
  input: BrandInput,
  strategy: BrandStrategy,
  agentType: 'chat' | 'faq' | 'recommender' | 'booking'
): Promise<{ systemPrompt: string; welcomeMessage: string; suggestedQuestions: string[] }> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Create a deployable ${agentType} agent configuration for ${input.companyName}.
Brand voice: ${strategy.brandVoice}. Industry: ${input.industry}. Vibe: ${input.vibe}.

Return JSON: {
  "systemPrompt": "full system prompt for this agent type",
  "welcomeMessage": "greeting shown when widget opens",
  "suggestedQuestions": ["4-5 starter questions relevant to this business"]
}`;
  const response = await ai.models.generateContent({ model, contents: prompt, config: { responseMimeType: "application/json" } });
  return JSON.parse(response.text || "{}");
};
