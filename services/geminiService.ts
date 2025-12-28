import { GoogleGenAI } from "@google/genai";
import { GeneratedTest, TestConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert Educational Assessment AI specializing in the Vietnamese MoET General Education Curriculum (Global Success textbook alignment) and Official Guideline CV 7991.
Your task is to generate a rigorous English test based on provided material.

STRICT MATRIX COMPLIANCE (DO NOT DEVIATE):

PART A – LISTENING (2.0 Points - 10 Questions)
- Generate 2 distinct listening scripts based on user topics.
- Task 1: 5 MCQ questions (A, B, C). (Script 1)
- Task 2: 5 True/False OR Gap Fill (1-2 words/number). (Script 2)
- Levels: Recognition, Comprehension.

PART B – LANGUAGE FOCUS (3.0 Points - 15 Questions)
- Section 1 (MCQ - 10 questions): 2 Pronunciation, 3 Vocabulary, 3 Grammar, 1 Communication Situation.
- Section 2 (Error ID - 2 questions): Identify incorrect part.
- Section 3 (Verb Forms - 3 questions): Tense/Pattern completion.
- Levels: Recognition, Comprehension.

PART C – READING (2.4 Points - 12 Questions)
- Q1: 1 Sign/Picture interpretation (Describe the sign in text for the question).
- Q2-Q6: 5 Cloze test questions (Gap fill MCQ).
- Q7-Q12: 6 Reading Comprehension questions (Read text, choose answer).
- Levels: Rec, Comp, Simple App.

PART D – WRITING (2.6 Points)
- 3 Sentence Reordering.
- 5 Sentence Rewriting (Transformation).
- 1 Paragraph Writing (80-100 words).
- Levels: Comp, App, High App.

COGNITIVE DISTRIBUTION:
~40% Recognition, ~45% Comprehension, ~15% Application.

OUTPUT FORMAT:
Return ONLY valid JSON matching the specified schema. 
Ensure all strings are properly escaped.
Do not wrap the output in markdown code blocks (e.g. \`\`\`json). 
Just return the raw JSON string.
`;

export const generateTestFromMaterial = async (
  materialText: string,
  config: TestConfig
): Promise<GeneratedTest> => {
  const prompt = `
    MATERIAL TO ANALYZE:
    ${materialText.substring(0, 30000)} 
    (Note: If material is long, I have truncated it to fit context, focus on the essence).

    USER CONFIGURATION:
    - Listening Topic 1: ${config.listeningTopic1}
    - Listening Topic 2: ${config.listeningTopic2}
    - Reading Topic: ${config.readingTopic}
    - Writing Topic: ${config.writingTopic}

    Generate a full English test JSON object.
    
    The JSON structure must match this Typescript Interface exactly:
    {
      "testTitle": "string",
      "partA": {
        "title": "PART A – LISTENING",
        "task1": { "script": "full transcript text", "questions": [ { "id": 1, "questionText": "...", "options": ["A","B","C"], "correctAnswer": "A", "type": "MCQ", "level": "Recognition" } ] },
        "task2": { "script": "full transcript text", "questions": [ { "id": 6, "questionText": "...", "options": ["True", "False"], "correctAnswer": "True", "type": "TRUE_FALSE", "level": "Comprehension" } ] }
      },
      "partB": {
        "title": "PART B – LANGUAGE FOCUS",
        "section1_mcq": [ ... 10 questions ... ],
        "section2_error": [ ... 2 questions ... ],
        "section3_verbs": [ ... 3 questions ... ]
      },
      "partC": {
        "title": "PART C – READING",
        "signQuestion": { ... 1 question ... },
        "clozePassage": { "text": "passage with blanks like [1], [2]...", "questions": [ ... 5 questions ... ] },
        "comprehensionPassage": { "text": "full passage", "questions": [ ... 6 questions ... ] }
      },
      "partD": {
        "title": "PART D – WRITING",
        "reordering": [ ... 3 questions ... ],
        "rewriting": [ ... 5 questions ... ],
        "paragraph": { "prompt": "...", "sampleAnswer": "..." }
      },
      "matrixReport": {
        "recognitionCount": number,
        "comprehensionCount": number,
        "applicationCount": number,
        "totalQuestions": number,
        "complianceNote": "Short analysis of how this matches CV 7991"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    let textResponse = response.text;
    if (!textResponse) throw new Error("No response from AI");

    // Clean up potentially wrapped JSON (markdown code blocks)
    // Sometimes the model adds ```json at the start and ``` at the end despite instructions.
    if (textResponse.trim().startsWith("```")) {
       textResponse = textResponse.replace(/^```(json)?\s*/i, "").replace(/```\s*$/, "");
    }

    return JSON.parse(textResponse) as GeneratedTest;
  } catch (error) {
    console.error("Error generating test:", error);
    // Log the actual text that failed to parse for debugging purposes
    throw error;
  }
};
