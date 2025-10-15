import { useState } from "react";

type Message = {
  role: "user" | "bot";
  text: string;
};

export default function GeminiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg: Message = { role: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://resonance-social-server.vercel.app/AiChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg.text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "bot", text: "⚠️ Error: failed to fetch AI reply." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-2xl shadow-lg flex flex-col border">
      <div className="bg-blue-600 text-white p-3 font-semibold">💬 AI Chatbot</div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-80">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[80%] ${
              m.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-sm">Typing…</div>}
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-lg p-2 text-sm"
          placeholder="Ask me something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
