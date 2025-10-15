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
      const res = await fetch("http://localhost:3000/AiChat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMsg.text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "⚠️ Error: failed to fetch AI reply." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-100 mt-[67px] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="bg-white/20 p-2 rounded-xl">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
              alt="AI Logo"
              className="w-6 h-6"
            />
          </div>
          <h1 className="text-xl font-semibold tracking-wide flex items-center gap-2">
            Resonance Ai
            <span className="text-sm font-normal text-blue-100 hidden sm:block">
              | Smart Assistant
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-blue-100">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Online
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-transparent scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`relative px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm transition-all duration-300 ${
                m.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
              } max-w-[75%] break-words hover:shadow-md`}
            >
              {m.text}
              {m.role !== "user" && (
                <div className="absolute -top-7 left-2 text-xs text-gray-400 italic flex gap-1">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                    alt="AI Logo"
                    className="w-6 h-6"
                  />{" "}
                  <span>Resonance Ai</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-300"></div>
            Typing…
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center gap-3">
        <div className="relative flex-1">
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white shadow-sm"
            placeholder="Ask me something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          {/* Microphone icon (decorative only) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 hover:text-blue-500 transition"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18v3m0 0a6 6 0 006-6H6a6 6 0 006 6zm0-15v6a2 2 0 11-4 0V6a2 2 0 114 0z"
            />
          </svg>
        </div>
        <button
          onClick={sendMessage}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-medium shadow-md transition-all active:scale-95 flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}
