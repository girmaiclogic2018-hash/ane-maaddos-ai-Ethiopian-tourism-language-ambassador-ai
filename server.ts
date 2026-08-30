import express from "express";
import http from "http";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Lazy initialization helper for Gemini
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: "/live" });

  // ----------------------------------------------------
  // REST API Endpoints
  // ----------------------------------------------------

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Turn Analysis (Deep Pedagogical Feedback)
  app.post("/api/analyze-turn", async (req, res) => {
    try {
      const { userUtterance, partnerUtterance, targetLanguage, nativeLanguage, level, scenarioTitle } = req.body;
      if (!userUtterance || typeof userUtterance !== "string") {
        return res.status(400).json({ error: "userUtterance is required" });
      }

      const ai = getGeminiClient();
      const prompt = `You are a world-class language tutor. Analyze this turn from a language student.
Target Language: ${targetLanguage || "Spanish"}
Student's Native Language: ${nativeLanguage || "English"}
Learner Proficiency Level: ${level || "Intermediate"}
Current Roleplay Scenario: ${scenarioTitle || "Casual conversation"}
Previous Partner Utterance: "${partnerUtterance || ""}"
Student Spoke: "${userUtterance}"

Provide pedagogical evaluation:
1. Highlight any grammar, vocabulary, or word-choice errors with concise, clear explanations in ${nativeLanguage || "English"}.
2. Give 2-3 natural, idiomatic alternative ways a native speaker would express the same thought.
3. List 1-3 useful vocabulary words used in the sentence with their translations and CEFR levels.
4. Estimate a fluency & accuracy score from 1-100.
5. Provide a brief encouraging praise comment in ${nativeLanguage || "English"}.
6. Suggest 2 short, natural next follow-up replies or questions the learner could say next.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              praise: { type: Type.STRING, description: "Brief encouraging comment" },
              fluencyScore: { type: Type.INTEGER, description: "Score from 1 to 100" },
              corrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    corrected: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      enum: ["grammar", "vocabulary", "pronunciation", "naturalness"],
                    },
                  },
                  required: ["original", "corrected", "explanation", "category"],
                },
              },
              betterAlternatives: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              vocabularyUsed: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    level: { type: Type.STRING },
                  },
                  required: ["word", "translation", "level"],
                },
              },
              suggestedReplies: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["praise", "fluencyScore", "corrections", "betterAlternatives", "vocabularyUsed", "suggestedReplies"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: unknown) {
      console.error("Error analyzing turn:", err);
      res.status(500).json({
        error: "Failed to analyze turn",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Text Chat Fallback with Instant Turn-by-Turn Feedback
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        messages,
        targetLanguage,
        nativeLanguage,
        level,
        scenario,
        partnerPersona,
      } = req.body;

      const ai = getGeminiClient();
      const systemInstruction = `You are a native ${targetLanguage || "Spanish"} conversation partner and language tutor.
Current Roleplay Scenario: ${scenario?.title || "Casual Chat"}
Your Role: ${scenario?.partnerRole || "Friendly native speaker"}
User's Role: ${scenario?.userRole || "Language learner"}
Proficiency Level: ${level || "Intermediate"}
Partner Persona: ${partnerPersona || "Warm, engaging, and patient"}

Instructions:
1. Respond to the user in natural ${targetLanguage}, keeping in character for the scenario.
2. Keep your response concise (1-3 sentences) to maintain a lively conversational flow.
3. If the user's message had grammatical mistakes, naturally rephrase it correctly in your reply or note it in the analysis.
4. Also provide a translation of your response into ${nativeLanguage || "English"} so the learner can check comprehension.
5. Provide pedagogical feedback on the user's latest message (grammar corrections, alternative phrasings, and encouraging praise).`;

      const formattedHistory = (messages || []).map((m: { role: string; text: string }) => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedHistory,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: { type: Type.STRING, description: "Your in-character reply in the target language" },
              translation: { type: Type.STRING, description: "Translation of your reply into native language" },
              praise: { type: Type.STRING, description: "Praise for user's message" },
              fluencyScore: { type: Type.INTEGER, description: "1-100 score" },
              corrections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: { type: Type.STRING },
                    corrected: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["grammar", "vocabulary", "pronunciation", "naturalness"] },
                  },
                  required: ["original", "corrected", "explanation", "category"],
                },
              },
              betterAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedReplies: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["replyText", "translation", "corrections", "betterAlternatives", "suggestedReplies"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: unknown) {
      console.error("Error in chat:", err);
      res.status(500).json({
        error: "Failed to process chat",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Word Translation & Deep Vocabulary Inspection
  app.post("/api/translate-word", async (req, res) => {
    try {
      const { word, contextSentence, targetLanguage, nativeLanguage } = req.body;
      if (!word) {
        return res.status(400).json({ error: "Word is required" });
      }

      const ai = getGeminiClient();
      const prompt = `Analyze the word/phrase "${word}" in the language "${targetLanguage || "Spanish"}", used in the context sentence: "${contextSentence || ""}".
Translate and explain in "${nativeLanguage || "English"}".`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              phonetic: { type: Type.STRING, description: "IPA or phonetic transcription" },
              partOfSpeech: { type: Type.STRING, description: "Noun, Verb, Adjective, Idiom, etc." },
              translation: { type: Type.STRING, description: "Direct meaning in native language" },
              definition: { type: Type.STRING, description: "Clear definition" },
              culturalNote: { type: Type.STRING, description: "Nuance or cultural context if applicable" },
              exampleSentence: { type: Type.STRING, description: "A simple natural example sentence in target language" },
              exampleTranslation: { type: Type.STRING, description: "Translation of example sentence" },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["word", "partOfSpeech", "translation", "definition", "exampleSentence", "exampleTranslation"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: unknown) {
      console.error("Error translating word:", err);
      res.status(500).json({
        error: "Failed to translate word",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Custom Scenario Generator
  app.post("/api/generate-scenario", async (req, res) => {
    try {
      const { customTopic, targetLanguage, level } = req.body;
      if (!customTopic) {
        return res.status(400).json({ error: "customTopic is required" });
      }

      const ai = getGeminiClient();
      const prompt = `Create an interactive language learning roleplay scenario for practicing ${targetLanguage || "Spanish"} at level ${level || "Intermediate"}.
User wants to practice: "${customTopic}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              partnerRole: { type: Type.STRING },
              userRole: { type: Type.STRING },
              starterPrompt: { type: Type.STRING, description: "Opening line the AI partner speaks" },
              objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 learning goals to accomplish" },
              suggestedPhrases: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 helpful target language starter phrases" },
            },
            required: ["title", "description", "partnerRole", "userRole", "starterPrompt", "objectives", "suggestedPhrases"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (err: unknown) {
      console.error("Error generating scenario:", err);
      res.status(500).json({
        error: "Failed to generate scenario",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // AI-driven 3-Day Personalized Ethiopian Itinerary Planner
  app.post("/api/generate-itinerary", async (req, res) => {
    try {
      const {
        region = "Northern Historic Circuit (Lalibela, Gondar, Axum)",
        interests = ["Ancient History & Castles", "Coffee Ceremony & Food", "UNESCO Wonders"],
        travelPace = "Balanced & Moderate",
        targetLanguage = "Amharic",
        nativeLanguage = "English",
        specialPreferences = "",
      } = req.body;

      const ai = getGeminiClient();
      const prompt = `You are ANE MADDOS, the elite Ethiopian Tourism Ambassador AI and Master Cultural Travel Planner.
Generate a deeply personalized, immersive, and highly authentic 3-day travel itinerary for a traveler visiting Ethiopia.

Specifications:
- Destination Region in Ethiopia: ${region}
- Traveler Interests: ${Array.isArray(interests) ? interests.join(", ") : interests}
- Travel Pace: ${travelPace}
- Target Language for Local Practice: ${targetLanguage}
- Traveler's Primary / Explanatory Language: ${nativeLanguage}
${specialPreferences ? `- Custom Traveler Requests: ${specialPreferences}` : ""}

Ensure the itinerary is deeply rich with real Ethiopian heritage (e.g., traditional buna / coffee ceremonies with frankincense, tej houses, injera cuisine, historic castles of Gondar, rock-hewn churches of Lalibela, obelisks of Axum, Harar hyena feeding & walled alleys, Simien mountains gelada baboons, Danakil volcanos, or Omo valley cultural markets).

For EACH day:
1. Provide morning, afternoon, and evening activities with specific landmark names, estimated duration, cultural notes, and local culinary/coffee experiences.
2. Provide 3-4 essential local phrases in ${targetLanguage} tailored specifically to that day's itinerary, along with phonetic transcription and translation into ${nativeLanguage}.
3. Provide transportation & logistics advice and cultural etiquette customs.

Also include 4-5 packing/readiness recommendations and a starter prompt for a live spoken AI tour guide.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Evocative English/Primary title for the 3-day journey" },
              titleNative: { type: Type.STRING, description: "Title translated or written in the target language (e.g., Ge'ez/Amharic script or target language)" },
              summary: { type: Type.STRING, description: "Comprehensive 2-3 sentence overview of this personalized 3-day experience" },
              highlights: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4-5 bullet highlights of iconic sights and moments",
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    dayTitle: { type: Type.STRING, description: "Catchy title for Day X" },
                    theme: { type: Type.STRING, description: "Daily thematic focus e.g. Ancient Monolithic Wonders" },
                    morning: {
                      type: Type.OBJECT,
                      properties: {
                        activity: { type: Type.STRING },
                        landmarkName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        culturalNote: { type: Type.STRING },
                        estimatedDuration: { type: Type.STRING },
                      },
                      required: ["activity", "landmarkName", "description"],
                    },
                    afternoon: {
                      type: Type.OBJECT,
                      properties: {
                        activity: { type: Type.STRING },
                        landmarkName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        culinaryOrCoffee: { type: Type.STRING },
                        estimatedDuration: { type: Type.STRING },
                      },
                      required: ["activity", "description", "culinaryOrCoffee"],
                    },
                    evening: {
                      type: Type.OBJECT,
                      properties: {
                        activity: { type: Type.STRING },
                        landmarkName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        culinaryOrCoffee: { type: Type.STRING },
                        estimatedDuration: { type: Type.STRING },
                      },
                      required: ["activity", "description"],
                    },
                    dailyPhrases: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          phrase: { type: Type.STRING, description: "Phrase in target language" },
                          phonetic: { type: Type.STRING, description: "Pronunciation guide" },
                          meaning: { type: Type.STRING, description: "Meaning in native language" },
                          context: { type: Type.STRING, description: "When and how to use it" },
                        },
                        required: ["phrase", "phonetic", "meaning", "context"],
                      },
                    },
                    transportAndLogistics: { type: Type.STRING, description: "Specific transport advice and local tips" },
                    culturalEtiquette: { type: Type.STRING, description: "Respectful dress and behavior tips for this day" },
                  },
                  required: ["dayNumber", "dayTitle", "theme", "morning", "afternoon", "evening", "dailyPhrases", "transportAndLogistics", "culturalEtiquette"],
                },
              },
              packingAndPreparation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Essential gear, clothing, cash tips, and health tips",
              },
              suggestedSpokenGuideStarter: {
                type: Type.STRING,
                description: "Engaging starter line for the ANE MADDOS spoken tour guide in character",
              },
            },
            required: ["title", "summary", "highlights", "days", "packingAndPreparation", "suggestedSpokenGuideStarter"],
          },
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      // Attach generated metadata
      const fullItinerary = {
        id: `itin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        region,
        targetLanguage,
        interests: Array.isArray(interests) ? interests : [interests],
        travelPace,
        generatedAt: new Date().toISOString(),
        ...parsed,
      };

      res.json(fullItinerary);
    } catch (err: unknown) {
      console.error("Error generating Ethiopian itinerary:", err);
      res.status(500).json({
        error: "Failed to generate travel itinerary",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // Text-To-Speech endpoint for audio playback in text mode
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName = "Zephyr" } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({ audio: base64Audio });
      } else {
        res.status(500).json({ error: "No audio generated" });
      }
    } catch (err: unknown) {
      console.error("TTS generation error:", err);
      res.status(500).json({
        error: "Failed to generate speech",
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  // ----------------------------------------------------
  // WebSocket Live API Handler (/live)
  // ----------------------------------------------------
  wss.on("connection", (clientWs: WebSocket) => {
    let liveSession: any = null;
    let isSessionConnected = false;

    clientWs.on("message", async (rawMsg: Buffer | string) => {
      try {
        const data = JSON.parse(rawMsg.toString());

        // Session Setup Handshake
        if (data.type === "start") {
          const {
            targetLanguage = "Spanish",
            nativeLanguage = "English",
            level = "B1_INTERMEDIATE",
            scenario = null,
            voiceName = "Zephyr",
            partnerPersona = "Warm, patient, and conversational tutor",
            strictness = "balanced",
          } = data;

          const levelGuide =
            level.includes("A1") || level.includes("A2")
              ? "Speak slowly with clear enunciation, using simple, foundational vocabulary. Limit turns to 1-2 short sentences."
              : level.includes("B1") || level.includes("B2")
              ? "Speak at a natural, standard conversational pace. Use common idioms and encourage the user to explain their reasoning."
              : "Speak at full native speed with sophisticated vocabulary, subtle cultural nuances, and idioms.";

          const strictnessGuide =
            strictness === "gentle"
              ? "Prioritize flow and encouragement. Only subtly rephrase major errors naturally in your response without breaking conversation."
              : strictness === "rigorous"
              ? "If the user makes any grammatical mistake or unnatural phrasing, gently correct them first before continuing the conversation."
              : "Keep conversation natural while rephrasing user errors correctly and smoothly.";

          const systemInstruction = `You are a real-time conversational AI partner and language tutor for practicing ${targetLanguage}.
Your Persona: ${partnerPersona}.
Voice Tone: Friendly, authentic, encouraging, and patient.
Learner's Native Language: ${nativeLanguage}.
Learner's Proficiency Level: ${level}.
${levelGuide}
${strictnessGuide}

Current Scenario: ${scenario?.title || "Casual Chat"}
Your Role: ${scenario?.partnerRole || "Friendly native speaker"}
User's Role: ${scenario?.userRole || "Language learner"}
Scenario Starter / Setting: ${scenario?.starterPrompt || "Greet the user warmly."}

CRITICAL RULES FOR REAL-TIME VOICE PRACTICE:
1. ALWAYS speak in ${targetLanguage}. (Only use brief ${nativeLanguage} if the learner explicitly asks "How do you say X?" or is completely stuck).
2. Keep each turn CONCISE and conversational (1 to 3 short sentences). Never monologue. Always finish by asking a question or tossing the conversational turn back to the learner.
3. Stay in character for the active roleplay scenario.
4. If this is the start of the session, greet the learner warmly in ${targetLanguage} according to the scenario setup!`;

          try {
            const ai = getGeminiClient();
            liveSession = await ai.live.connect({
              model: "gemini-3.1-flash-live-preview",
              config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                  },
                },
                systemInstruction,
                outputAudioTranscription: {},
                inputAudioTranscription: {},
              },
              callbacks: {
                onmessage: (message: LiveServerMessage) => {
                  if (clientWs.readyState !== WebSocket.OPEN) return;

                  // 1. Audio data chunks from model (24kHz PCM)
                  const parts = message.serverContent?.modelTurn?.parts || [];
                  for (const part of parts) {
                    if (part.inlineData?.data) {
                      clientWs.send(
                        JSON.stringify({
                          type: "audio",
                          audio: part.inlineData.data,
                        })
                      );
                    }
                    if (part.text) {
                      clientWs.send(
                        JSON.stringify({
                          type: "transcription",
                          role: "model",
                          text: part.text,
                        })
                      );
                    }
                  }

                  // 2. Transcriptions from user input speech
                  const inputTranscription = (message.serverContent as any)?.inputAudioTranscription?.text;
                  if (inputTranscription) {
                    clientWs.send(
                      JSON.stringify({
                        type: "transcription",
                        role: "user",
                        text: inputTranscription,
                      })
                    );
                  }

                  // 3. User interrupted AI speaking
                  if (message.serverContent?.interrupted) {
                    clientWs.send(JSON.stringify({ type: "interrupted" }));
                  }

                  // 4. Turn complete
                  if (message.serverContent?.turnComplete) {
                    clientWs.send(JSON.stringify({ type: "turnComplete" }));
                  }
                },
                onerror: (err: any) => {
                  console.error("Live API session error:", err);
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(
                      JSON.stringify({
                        type: "error",
                        error: err?.message || "Live API error",
                      })
                    );
                  }
                },
                onclose: () => {
                  isSessionConnected = false;
                  if (clientWs.readyState === WebSocket.OPEN) {
                    clientWs.send(JSON.stringify({ type: "closed" }));
                  }
                },
              },
            });

            isSessionConnected = true;
            clientWs.send(JSON.stringify({ type: "ready" }));

            // Prompt the model with initial kickoff if starting
            if (scenario?.starterPrompt) {
              liveSession.sendRealtimeInput({
                text: `[System prompt]: The session has started. Please open with a friendly greeting in character: "${scenario.starterPrompt}"`,
              });
            }
          } catch (connectErr: any) {
            console.error("Failed to connect to Live API:", connectErr);
            clientWs.send(
              JSON.stringify({
                type: "error",
                error: connectErr?.message || "Failed to initialize Live API session",
              })
            );
          }
        }

        // Stream real-time input audio (16kHz PCM from mic)
        else if (data.type === "audio" && data.audio) {
          if (liveSession && isSessionConnected) {
            liveSession.sendRealtimeInput({
              audio: {
                data: data.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          }
        }

        // Send text input in live session
        else if (data.type === "text" && data.text) {
          if (liveSession && isSessionConnected) {
            liveSession.sendRealtimeInput({
              text: data.text,
            });
          }
        }

        // Stop session cleanly
        else if (data.type === "stop") {
          if (liveSession) {
            try {
              liveSession.close();
            } catch {
              // ignore
            }
            liveSession = null;
            isSessionConnected = false;
          }
        }
      } catch (err) {
        console.error("Error processing WebSocket message:", err);
      }
    });

    clientWs.on("close", () => {
      if (liveSession) {
        try {
          liveSession.close();
        } catch {
          // ignore
        }
        liveSession = null;
        isSessionConnected = false;
      }
    });
  });

  // ----------------------------------------------------
  // Vite Integration (Dev vs Prod)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Language Partner AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
