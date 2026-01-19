
import { GoogleGenAI } from "@google/genai";
import { GenerationParams } from "./types";

export const generateSunoLyrics = async (params: GenerationParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
  You are a professional world-class lyricist specialized in Suno AI music generation prompts.
  Your goal is to create lyrics that are not only emotionally resonant but also perfectly formatted for Suno's AI engine.

  CONTEXT:
  - Topic: ${params.topic}
  - Description: ${params.topicDescription || "N/A"}
  - Vocalist Persona: ${params.vocalist}
  - Vocalist Detail: ${params.vocalistDetail}
  - Producer/Production Style: ${params.producer || "N/A"}
  - Producer Detail: ${params.producerDetail || "N/A"}
  - Rhyme Scheme/Constraint: ${params.rhymeScheme || "Standard"}
  - Rhyme Detail: ${params.rhymeSchemeDetail || "N/A"}
  - Additional Style: ${params.customStyle || "None"}

  CRITICAL SYNTAX RULES FOR SUNO AI:
  1. Use bracketed commands for structure: [Intro: Mood], [Verse 1: Technique], [Chorus: Energy], [Bridge: Shift], [Outro: Fade].
  2. RAP SECTIONS: Use hyphens to connect words to force rhythmic flow (e.g., "The-grind-don't-stop-the-climb-is-the-top"). Use double-time or triplets if requested.
  3. SINGING SECTIONS: Use ellipses (...) and elongated vowels (e.g., "Waitiiiing... for the sun-rise...") to guide the AI's melodic phrasing.
  4. AD-LIBS: Use parentheses for backing vocals or ad-libs like (Yeah), (I see you), (Check).
  5. BREAKS: Use ( . . . ) to indicate instrumental solos or atmospheric pauses.
  6. STYLE ALIGNMENT: The vocabulary and tone must match the specific persona of ${params.vocalist}.
  7. RHYME EXECUTION: Adhere strictly to the requested rhyme scheme: ${params.rhymeSchemeDetail}.

  TASK:
  Generate 4-6 sections of professional lyrics. 
  Each section must have a bracketed header defining the style (e.g., [Verse 1: Fast Rap] or [Chorus: Melodic R&B]).
  Ensure the content matches the depth of the provided topic and the specific vocal qualities of the chosen persona.

  OUTPUT:
  Return ONLY the lyrics. Do not include introductory text or explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });

    return response.text?.trim() || "Failed to generate lyrics.";
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to connect to AI service. Please try again.");
  }
};
