import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

export async function* sendMessageStream(
  prompt: string,
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = []
) {
  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, history })
    });

    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader on response body");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const data = trimmed.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              yield parsed.text;
            }
          } catch (e) {
            // Silently ignore malformed JSON segments
          }
        }
      }
    }
  } catch (error) {
    console.error("Orbit AI backend service failed. Falling back to direct client-side collection...", error);
    
    try {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      if (!apiKey) {
        yield "I encountered a synchronization error: GEMINI_API_KEY is not defined in your environment settings.";
        return;
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build-fallback',
          }
        }
      });

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
          yield chunk.text;
        }
      }
    } catch (fallbackError) {
      console.error("Direct fallback connection error:", fallbackError);
      yield "I encountered a synchronization error. Please check your neural link.";
    }
  }
}

