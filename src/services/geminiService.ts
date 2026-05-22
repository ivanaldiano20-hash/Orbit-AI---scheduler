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
      yield "I encountered a synchronization error. Please check your neural link.";
      return;
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
    console.error("Orbit AI Service Error:", error);
    yield "I encountered a synchronization error. Please check your neural link.";
  }
}
