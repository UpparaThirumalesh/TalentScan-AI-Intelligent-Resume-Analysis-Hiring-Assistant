import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  matchScore: number;
  reasoning: string;
  strengths: string[];
  weaknesses: string[];
  skillGaps: string[];
  interviewQuestions: string[];
  improvedResumeTips: string[];
}

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<AnalysisResult> {
  const prompt = `
    Analyze the following resume against the job description.
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Provide the analysis in JSON format with the following structure:
    - matchScore: a number from 0 to 100
    - reasoning: a brief explanation of the score
    - strengths: an array of strings representing key matching skills
    - weaknesses: an array of strings representing missing major requirements
    - skillGaps: an array of specific skills to learn
    - interviewQuestions: an array of 5 tailored interview questions
    - improvedResumeTips: an array of tips to better align the resume with this JD
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            interviewQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvedResumeTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["matchScore", "reasoning", "strengths", "weaknesses", "skillGaps", "interviewQuestions", "improvedResumeTips"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}
