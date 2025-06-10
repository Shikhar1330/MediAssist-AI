// This is a service for interacting with Google Gemini AI

// For frontend applications, we need to access environment variables differently
// Vite uses import.meta.env, Create-React-App uses process.env with REACT_APP_ prefix
const getEnvApiKey = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Vite
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  } else if (typeof process !== 'undefined' && process.env) {
    // Node.js or Create-React-App
    return process.env.REACT_APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  }
  return '';
};

// Initialize API key from environment variables or localStorage fallback
let apiKey = getEnvApiKey();

export const setGeminiApiKey = (key: string) => {
  apiKey = key;
  // We'll still save to localStorage as a fallback for browsers
  localStorage.setItem('geminiApiKey', key);
};

export const getGeminiApiKey = () => {
  // If we already have an apiKey in memory, return it
  if (apiKey) {
    return apiKey;
  }
  
  // Try to get the API key from environment variables again
  apiKey = getEnvApiKey();
  
  // If still not available, try localStorage as a fallback
  if (!apiKey) {
    apiKey = localStorage.getItem('geminiApiKey') || '';
  }
  
  return apiKey;
};

export const askGemini = async (prompt: string): Promise<string> => {
  const key = getGeminiApiKey();
  if (!key) {
    return "Please set your Google Gemini API key using setGeminiApiKey() or via environment variables.";
  }

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a helpful medical assistant AI. Provide informative, evidence-based answers about health topics. Include disclaimers when appropriate. Always encourage consulting healthcare professionals for medical advice.

Question: ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      return `Error: ${data.error.message || "Failed to get response"}`;
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "No response generated. Please try again.";
    }
  } catch (error) {
    console.error("Error querying Gemini API:", error);
    return "Error connecting to Gemini API. Please check your connection and try again.";
  }
};

// Function to get structured health information from Gemini
export const getHealthConditionInfo = async (symptoms: string, language = 'english') => {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("Please set your Google Gemini API key using setGeminiApiKey() or via environment variables.");
  }

  try {
    const prompt = `Based on the following symptoms: "${symptoms}", provide a structured analysis in JSON format with the following keys:
    
    {
      "Disease": "Most likely health condition based on symptoms",
      "Recommended Medicine": "Primary recommended medication",
      "Alternative Medicines": ["List of alternative medications"],
      "Dosage": "Recommended dosage for primary medication",
      "Precautions": "Important precautions when using this medication",
      "Side Effects": ["Common side effects"],
      "When to Consult a Doctor": "Guidance on when medical attention is needed",
      "Home Remedies": ["Effective home remedies"],
      "Symptom Description": "Detailed description of typical symptoms",
      "Lifestyle Tips": ["Lifestyle recommendations"],
      "Disclaimer": "Medical disclaimer about the information provided"
    }
    
    IMPORTANT: Return ONLY valid JSON with these exact keys. Do not add any additional text, and ensure it's properly formatted JSON.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Failed to get response");
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response (removing any markdown code blocks if present)
      const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         resultText.match(/```\s*([\s\S]*?)\s*```/) || 
                         [null, resultText];
      
      const jsonStr = jsonMatch[1] || resultText;
      
      try {
        // Parse the JSON response
        const parsedResult = JSON.parse(jsonStr);
        
        // If language is not english, translate the key information
        if (language.toLowerCase() !== 'english') {
          return await translateHealthInfo(parsedResult, language);
        }
        
        return parsedResult;
      } catch (parseError) {
        console.error("Error parsing Gemini response as JSON:", parseError);
        throw new Error("Failed to parse health condition data");
      }
    } else {
      throw new Error("No valid response generated");
    }
  } catch (error) {
    console.error("Error getting health condition data:", error);
    throw error;
  }
};

// Function to translate health information to the requested language
export const translateHealthInfo = async (healthInfo: any, language: string) => {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error("Please set your Google Gemini API key in the .env file (GEMINI_API_KEY=your_key).");
  }

  try {
    // Create a prompt that asks for translation of specific fields
    const fieldsToTranslate = [
      "Disease", 
      "Recommended Medicine",
      "Dosage", 
      "Precautions", 
      "When to Consult a Doctor", 
      "Symptom Description", 
      "Disclaimer"
    ];

    // Create arrays that need translation
    const arraysToTranslate = [
      "Alternative Medicines",
      "Side Effects",
      "Home Remedies",
      "Lifestyle Tips"
    ];

    // Create objects with the original content for these fields
    const translationContent = fieldsToTranslate.reduce((acc, field) => {
      acc[field] = healthInfo[field];
      return acc;
    }, {} as Record<string, string>);
    
    // Add arrays that need translation
    const arrayContent = arraysToTranslate.reduce((acc, field) => {
      acc[field] = healthInfo[field];
      return acc;
    }, {} as Record<string, string[]>);
    
    // Create a prompt for translation
    const translationPrompt = `Translate the following medical terms and descriptions from English to ${language}. Return ONLY a JSON object with the translations. 
    
    For text fields:
    ${JSON.stringify(translationContent, null, 2)}
    
    For array fields (translate each item in these arrays):
    ${JSON.stringify(arrayContent, null, 2)}
    
    IMPORTANT: Return ONLY valid JSON with the same keys but translated values. For arrays, maintain the array structure. Maintain medical accuracy.`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: translationPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || "Failed to get translation");
    }
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response (removing any markdown code blocks if present)
      const jsonMatch = resultText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         resultText.match(/```\s*([\s\S]*?)\s*```/) || 
                         [null, resultText];
      
      const jsonStr = jsonMatch[1] || resultText;
      
      try {
        // Parse the JSON response
        const translations = JSON.parse(jsonStr);
        
        // Create a new object with translations and original content
        const translatedHealthInfo = { 
          ...healthInfo,
          ...translations,
          originalLanguage: 'English',
          translatedLanguage: language,
        };
        
        return translatedHealthInfo;
      } catch (parseError) {
        console.error("Error parsing translation response as JSON:", parseError);
        // Return original data if translation fails
        return healthInfo;
      }
    } else {
      // Return original data if translation API call fails
      return healthInfo;
    }
  } catch (error) {
    console.error("Error translating health information:", error);
    // Return original data if translation fails
    return healthInfo;
  }
};

// Available languages for translation
export const availableLanguages = [
  { code: 'english', name: 'English' },
  { code: 'hindi', name: 'Hindi' },
  { code: 'tamil', name: 'Tamil' },
  { code: 'telugu', name: 'Telugu' },
  { code: 'marathi', name: 'Marathi' },
  { code: 'bengali', name: 'Bengali' },
  { code: 'gujarati', name: 'Gujarati' },
  { code: 'kannada', name: 'Kannada' },
  { code: 'malayalam', name: 'Malayalam' },
  { code: 'punjabi', name: 'Punjabi' }
];