import { GoogleGenAI } from "@google/genai";
import { Message, Source } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `
You are TaxNavigator, an elite automated tax expert assistant connected to real-time data sources. 
Your primary goal is to assist US taxpayers by providing accurate, up-to-date information based on the latest IRS regulations and data.gov datasets.

GUIDELINES:
1.  **Reliability**: Always base your answers on verified information. 
2.  **Context**: You have access to Google Search to retrieve the latest tax laws, forms, and publication updates from irs.gov. USE THIS FREQUENTLY.
3.  **Tone**: Professional, precise, yet accessible. Avoid overly dense jargon without explanation.
4.  **Disclaimer**: You must subtly remind users that you are an AI and this does not constitute legal or official financial advice if the topic is complex.
5.  **Prioritization**: When searching, strictly prioritize results from 'site:irs.gov', 'site:data.gov', and reputable financial institutions.

FORMATTING:
- Use Markdown for clear structure (headers, bolding for key terms, lists).
- If referring to a specific IRS Form (e.g., Form 1040), try to explain briefly what it is.
`;

export const sendMessageToGemini = async (
  history: Message[],
  currentMessage: string
): Promise<{ text: string; sources: Source[] }> => {
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }], // Enable Search Grounding for real-time IRS data
        temperature: 0.4, // Keep it factual
      },
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage({ message: currentMessage });
    
    // Extract text
    const text = result.text || "I apologize, but I couldn't generate a response at this time.";

    // Extract sources from grounding metadata
    const sources: Source[] = [];
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "IRS/Government Source",
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Filter duplicate sources based on URI
    const uniqueSources = sources.filter((v, i, a) => a.findIndex(v2 => (v2.uri === v.uri)) === i);

    return { text, sources: uniqueSources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to connect to the tax knowledge base. Please try again.");
  }
};