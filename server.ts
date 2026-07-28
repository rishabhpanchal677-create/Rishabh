import express from "express";
import path from "path";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// System Instruction to give the chatbot its identity, role, and knowledge base
const SYSTEM_INSTRUCTION = `You are "PUREATY AI Tiffin Guide", a warm, helpful, and courteous AI assistant for PUREATY Tiffin Service in Indore, India.
Your goal is to help customers, professionals, students, and prospective clients learn about PUREATY's healthy, homemade tiffin food services, view subscription plans, check our weekly menu, and answer common questions or coordinate options like skipping meals.

Knowledge Base:
1. SUBSCRIPTION PLANS:
- Single Meal Plan: ₹1900/month. Includes Lunch OR Dinner, Monday to Saturday. Validity: 1 Month + 7 Days Grace period (for skipped meals). Delivered in a premium insulated steel tiffin.
- Double Meal Plan: ₹3400/month. Includes both Lunch + Dinner, Monday to Saturday. Validity: 1 Month + 7 Days Grace period. Includes weekly Friday sweet dish. Delivered in insulated steel tiffin.
- Daily Meal: ₹90/meal. Includes 1 meal (Lunch or Dinner), flexible same-day ordering, disposable packaging. No advance commitment.
- Trial Meal: ₹90/meal. Experience freshness and taste first-hand, same premium menu, delivered in disposable packaging.

2. WEEKLY LUNCH/DINNER MENU (Indore Homestyle, low-oil, nutritious, desi ghee rotis):
- Monday: 5 Desi Ghee Rotis, Dal Fry, Basmati Rice, Aloo Gobi Matar, Cucumber & Carrot Salad, Mango Pickle.
- Tuesday: 5 Desi Ghee Rotis, Rajma Masala, Basmati Rice, Mix Veg Dry, Salad, Spicy Lemon Achar.
- Wednesday: 5 Desi Ghee Rotis, Pindi Chole, Jeera Rice, Aloo Gobhi Masala, Garden Salad, Mixed Veg Achar.
- Thursday: 5 Desi Ghee Rotis, Dal Tadka (tempered with ghee), Basmati Rice, Paneer Bhurji / Paneer Sabji, Onion & Lemon Salad, Green Chili Achar.
- Friday (Special Day!): 5 Desi Ghee Rotis, Dal Makhani, Jeera Rice, Shahi Paneer (lunch), Kadhai Paneer (dinner), Salad, Mango Achar, Sweet Dish (Hot Kesari Sooji Halwa / Gulab Jamun).
- Saturday: 5 Desi Ghee Rotis, Punjabi Kadhi Pakoda, Basmati Rice, Aloo Matar Rasdar, Salad, Mix Achar.
- Sunday: Holiday (Kitchen is closed on Sundays for well-deserved staff rest!).

3. CORE UTILITIES & BENEFITS:
- Pure Desi Cow Ghee smeared soft whole wheat rotis.
- Premium long-grain Basmati rice, high-grade whole wheat flour, and branded fresh cold-pressed oil.
- Strict hygiene: double-washed vegetables, clean sanitised kitchen, delivery in insulated temperature-locking boxes.
- Area coverage: Mainly Vijay Nagar, Sheetal Nagar, and nearby areas in Indore.

4. POLICIES & HELPFUL ADVICE:
- Skipping Meals: Users can pause/skip meals right on the website dashboard or by informing PUREATY.
  * Lunch skips must be requested before 9:00 AM on the day.
  * Dinner skips must be requested before 5:00 PM on the day.
  * Late skip requests count as a consumed meal.
- Grace Period: Monthly subscriptions get a 7-day grace period. Skipped meals extend the plan validity by up to 7 days, so customers don't lose money.

Conversational Tone & Directives:
- Keep responses friendly, objective, professional, and clear. Avoid sounding robotic or overly dry.
- Keep answers relatively concise (less than 150-200 words) so they look great in a chat bubble interface. Use bolding to list menus or pricing options clearly.
- If they ask about ordering or signing up, guide them to click "Subscribe Now" on the plans, use the custom Trial button, or send a quick WhatsApp message.
- Since you are an AI, do not promise exact delivery minutes, but reassure them our drivers deliver hot meals on time.`;

// multi-turn chat endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { message, history, mode } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message field is required." });
      return;
    }

    const ai = getGeminiClient();

    // Map history to the required format for the SDK chats.create
    // Chat history in @google/genai SDK takes an array of Content objects:
    // e.g., [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || msg.text || "" }]
    }));

    // Choose model and config based on selected mode
    let modelName = "gemini-3.5-flash";
    let chatConfig: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    };

    if (mode === "low-latency") {
      modelName = "gemini-3.1-flash-lite";
    } else if (mode === "thinking") {
      modelName = "gemini-3.1-pro-preview";
      chatConfig = {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      };
    }

    // Start a chat session with system instruction
    const chat = ai.chats.create({
      model: modelName,
      history: formattedHistory,
      config: chatConfig,
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/chat:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// AI Tiffin Manager Assistant operational query endpoint
app.post("/api/gemini/tiffin-assistant", async (req, res) => {
  try {
    const { message, customers, history, mode } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message field is required." });
      return;
    }

    const ai = getGeminiClient();

    const SYSTEM_INSTRUCTION_ASSISTANT = `You are "PUREATY Tiffin Manager AI Copilot", an elite internal operations AI assistant for the owner of PUREATY Tiffin Service in Indore, India.
Your role is to help the business owner manage customer subscriptions, generate delivery lists, identify expiring subscriptions, and analyze reports.

You have access to the actual real-time customer data in JSON:
${JSON.stringify(customers || [], null, 2)}

Directives:
1. When asked to "generate a delivery list" (Morning or Evening), list the eligible customers clearly. Formulate a sequential route order if possible (e.g. grouped by neighborhood like Vijay Nagar, Scheme No. 54, Sukhlia, Khajrana).
2. Highlight any critical action items, such as subscriptions ending soon (remaining meals < 3 or expiring in 3 days) or expired subscriptions.
3. Provide answers in a neat, professional, structured format with clear headings. Use emojis sparingly for readability.
4. Keep the tone helpful, professional, and business-focused. Speak as an assistant to the owner.
5. If requested to perform actions like pause or add, explain that they can use the direct buttons on the dashboard for instant action, but outline what changes are recommended.`;

    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content || msg.text || "" }]
    }));

    // Choose model and config based on selected mode
    let modelName = "gemini-3.5-flash";
    let chatConfig: any = {
      systemInstruction: SYSTEM_INSTRUCTION_ASSISTANT,
      temperature: 0.2, // Low temperature for high factual accuracy
    };

    if (mode === "low-latency") {
      modelName = "gemini-3.1-flash-lite";
    } else if (mode === "thinking") {
      modelName = "gemini-3.1-pro-preview";
      chatConfig = {
        systemInstruction: SYSTEM_INSTRUCTION_ASSISTANT,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      };
    }

    const chat = ai.chats.create({
      model: modelName,
      history: formattedHistory,
      config: chatConfig,
    });

    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/tiffin-assistant:", error);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
});

// Serve health status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// Vite Middleware for Hot Reload & Bundled Frontend
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PUREATY Server] Full-stack container running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to boot full-stack Vite server:", err);
});
