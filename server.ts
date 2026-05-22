import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ 
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Secured chat stream endpoint
app.post("/api/gemini/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: history,
      config: {
        systemInstruction: `You are Orbit AI, a sophisticated AI command center. Your personality is 'Transcendent Minimalism': advanced yet invisible. Be concise, intelligent, and helpful. 
        
        TEMPORAL CONTEXT: 
        Current System Time: ${timeStr}
        Current Date: ${dateStr}
        
        FORMATTING: Use markdown.
        INTELLIGENCE EXTRACTION:
        1. If you identify a specific time-based appointment/event, add: [EVENT: title | hh:mm]
        2. If you identify an action item or task to be done, add: [TASK: title]
        
        Examples:
        - "I've scheduled your Physics review for 15:00. [EVENT: Physics Review | 15:00]"
        - "I'll add 'Finish report' to your queue. [TASK: Finish report]"`,
      }
    });

    const result = await chat.sendMessageStream({
      message: prompt
    });

    for await (const chunk of result) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }
    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Express Gemini Error:", error);
    res.write(`data: ${JSON.stringify({ text: "I encountered a synchronization error. Please check your neural link." })}\n\n`);
    res.end();
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
