
import { GoogleGenAI, Type } from "@google/genai";
import { Patient, AssessmentResult, AIAnalysisResult, AssessmentScale, GroundingSource } from "../types";

// Always create GoogleGenAI instance right before making an API call to ensure it uses current environment key.

export const analyzePatientData = async (patient: Patient, latestResult: AssessmentResult): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyContext = patient.history
    .map(h => `- Date: ${h.date}, Scale: ${h.scaleType}, Score: ${h.totalScore} (${h.severity})`)
    .join('\n');

  const prompt = `
    You are a clinical psychiatrist's expert assistant with access to the latest medical research via Google Search.
    Analyze the following psychiatric assessment data. Use Google Search to cross-reference these findings with the latest 2024-2025 clinical guidelines or recent psychiatric studies if relevant.
    
    PATIENT INFO:
    Name: ${patient.name}
    Gender: ${patient.gender}
    
    LATEST ASSESSMENT:
    Date: ${latestResult.date}
    Scale: ${latestResult.scaleType}
    Total Score: ${latestResult.totalScore}
    Severity (Raw): ${latestResult.severity}
    
    HISTORICAL TRENDS:
    ${historyContext || 'No previous assessments recorded.'}
    
    INSTRUCTIONS:
    1. Compare the latest result with historical trends.
    2. Identify specific psychiatric markers or symptom shifts.
    3. Suggest evidence-based clinical focus areas using modern psychiatric standards.
    4. Provide a summarized severity level reflecting the overall trajectory.
    
    Respond in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 4000 },
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          clinicalImplications: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          severityLevel: { type: Type.STRING }
        },
        required: ["summary", "clinicalImplications", "recommendations", "severityLevel"]
      }
    }
  });

  const sources: GroundingSource[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    });
  }

  try {
    const data = JSON.parse(response.text || '{}') as AIAnalysisResult;
    return { ...data, sources: sources.length > 0 ? sources : undefined };
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      summary: "Error synthesizing analysis.",
      clinicalImplications: "N/A",
      recommendations: [],
      severityLevel: latestResult.severity,
      sources: sources.length > 0 ? sources : undefined
    };
  }
};

export const generateScaleFromAI = async (input: string): Promise<Partial<AssessmentScale>> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    You are a medical informatics expert with access to real-time medical databases via Google Search.
    Your task is to generate a full-length, structured psychiatric rating scale based on the user's input.
    
    INPUT: "${input}"
    
    INSTRUCTIONS:
    1. USE GOOGLE SEARCH to find the official, full set of questions for any standardized scale mentioned (e.g., "HAM-D", "Beck Depression Inventory (BDI)", "MADRS", "Y-BOCS", "MMSE"). 
    2. YOU MUST PROVIDE ALL ITEMS. For example, if the user asks for BDI, provide all 21 items exactly as they appear in the clinical manual.
    3. If the input is a description of symptoms, search for current diagnostic criteria (DSM-5-TR or ICD-11) to inform a comprehensive 12-18 item scale.
    4. Include official scoring options and professional phrasing.
    
    Respond in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING }
              },
              required: ["id", "text"]
            }
          },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.NUMBER },
                label: { type: Type.STRING }
              },
              required: ["value", "label"]
            }
          }
        },
        required: ["title", "description", "questions", "options"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    throw new Error("Failed to generate scale");
  }
};
