import { Router } from "express";
import { Journal } from "../models/Journal.js";
import { MoodAnalysis } from "../models/MoodAnalysis.js";

const router = Router();

// --- AI Analysis Function using Gemini API ---
async function generateSupportMessageWithAI(analysis, journalText) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

  // Construct a situation-specific prompt
  const userQuery = `
  You are a friendly AI assistant helping someone process their journal entry.
  Their journal entry is: "${journalText}"
  Analysis of the journal:
    Sentiment: ${analysis.sentiment}
    Emotions: ${analysis.emotions.join(", ")}
    Triggers: ${analysis.triggers.map((t) => t.name).join(", ")}

  Based on this, provide a short, warm, and situation-specific supportive message
  that encourages the user to reflect or cope with their feelings. Keep it under 50 words.
  `;

  const systemInstruction = {
    parts: [
      { text: "You are a compassionate AI assistant for mental well-being." },
    ],
  };

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 200,
  };

  try {
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction,
      generationConfig,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return message.trim();
  } catch (err) {
    console.error("Error generating support message:", err);
    return "Keep going, you're doing great! 🌟";
  }
}

async function analyzeText(text) {
  const GEMINI_API_KEY = "AIzaSyBiIO4RIrlSA_jhEcI99YPCBRWkZhNxkyA"; // Replace with your actual Gemini API key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

  const userQuery = `
Analyze the following journal entry for sentiment, emotions, and triggers. 

Journal Entry: "${text}"

Instructions:
1. Determine the overall sentiment: "positive", "negative", or "neutral".
2. Identify primary emotions **directly expressed in the text**. Use only these labels:
   "joy", "excitement", "hope", "sadness", "anger", "stress", "anxiety", "frustration", "calmness".
   Map words in the text like "frustrated" → "frustration", "ignored" → "anger", "upset" → "anger".
   The array must contain all detected emotions; do not leave it empty.
3. Identify triggers (people, events, objects) from the text.
4. Return a JSON object exactly like this:

{
  "sentiment": "negative",
  "score": -0.7,
  "emotions": ["anger", "frustration"],
  "triggers": [
    {"name": "my coworker", "type": "PERSON"},
    {"name": "the meeting", "type": "EVENT"}
  ]
}
`;

  const systemInstruction = {
    parts: [
      {
        text: `Act as a professional mood and sentiment analysis AI. Your task is to analyze text and provide a structured JSON response.
      The JSON object MUST contain the following fields:
      - "sentiment": a string, one of "positive", "negative", or "neutral".
      - "score": a number between -1 and 1, representing the sentiment score.
      - "emotions": an array of strings listing the primary emotions detected (e.g., "joy", "sadness", "anger", "anxiety").
      - "triggers": an array of objects, where each object has "name" (the trigger/entity) and "type" (e.g., "PERSON", "EVENT", "WORK_OF_ART") derived from the text.
      
      Example of expected JSON output:
      {
        "sentiment": "positive",
        "score": 0.8,
        "emotions": ["excitement", "joy"],
        "triggers": [
          {"name": "the presentation", "type": "EVENT"},
          {"name": "my team", "type": "PERSON"}
        ]
      }`,
      },
    ],
  };

  const generationConfig = {
    responseMimeType: "application/json",
    responseSchema: {
      type: "OBJECT",
      properties: {
        sentiment: { type: "STRING" },
        score: { type: "NUMBER" },
        emotions: {
          type: "ARRAY",
          items: { type: "STRING" },
        },
        triggers: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              name: { type: "STRING" },
              type: { type: "STRING" },
            },
          },
        },
      },
    },
  };

  try {
    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      systemInstruction: systemInstruction,
      generationConfig: generationConfig,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.candidates[0].content.parts[0].text);

    // Validate score before calculating magnitude
    const score =
      typeof result.score === "number" && !isNaN(result.score)
        ? result.score
        : 0;
    const magnitude = Math.abs(score) * 2.5;

    // Use a fallback to an empty array if the API response is missing the fields
    let emotions = result.emotions?.map((e) => e.toLowerCase()) || [];

    // if (emotions.length === 0) {
    //   if (result.sentiment === "positive") {
    //     emotions = ["contentment"];
    //   } else if (result.sentiment === "negative") {
    //     emotions = ["unspecified negative feeling"];
    //   } else {
    //     emotions = ["calmness"];
    //   }
    // }

    const wordToEmotion = {
      frustrated: "frustration",
      ignored: "anger",
      upset: "anger",
      sad: "sadness",
      happy: "joy",
      stressed: "stress",
    };

    // Map literal words to your standard labels
    emotions = emotions.map((e) => wordToEmotion[e] || e);

    // Fallback if still empty
    if (emotions.length === 0) {
      emotions =
        result.sentiment === "positive"
          ? ["contentment"]
          : result.sentiment === "negative"
          ? ["frustration"]
          : ["calmness"];
    }

    let triggers = result.triggers || [];
    if (triggers.length === 0) {
      triggers = [{ name: "unspecified", type: "UNSPECIFIED" }];
    }

    return {
      sentiment: result.sentiment,
      score: score,
      magnitude: magnitude,
      emotions: emotions,
      triggers: triggers,
    };
  } catch (err) {
    console.error("Error analyzing text with Gemini API:", err);
    throw err;
  }
}

// --- Routes ---

// POST -> Add Journal Entry + Run AI Analysis
router.post("/", async (req, res) => {
  try {
    const { userId, text } = req.body;

    // Save journal first
    const journal = await Journal.create({ userId, text });

    // Run AI analysis
    const analysis = await analyzeText(text);

    // Save analysis result
    await MoodAnalysis.create({
      journalId: journal._id,
      userId,
      sentiment: analysis.sentiment,
      score: analysis.score,
      magnitude: analysis.magnitude,
      emotions: analysis.emotions,
      triggers: analysis.triggers,
    });

    journal.analysisDone = true;
    await journal.save();

    // Generate supportive message using Gemini AI
    const supportMessage = await generateSupportMessageWithAI(analysis, text);

    res.status(201).json({ journal, analysis, supportMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET -> Fetch all journals + analysis for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const journals = await Journal.find({ userId }).sort({ timestamp: -1 });
    const analysis = await MoodAnalysis.find({ userId });

    res.json({ journals, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
