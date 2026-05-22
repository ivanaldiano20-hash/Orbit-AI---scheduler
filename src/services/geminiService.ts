import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* sendMessageStream(prompt: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
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
  } catch (error) {
    console.error("Orbit AI Error:", error);
    yield "I encountered a synchronization error. Please check your neural link.";
  }
}
