import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

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
  <div className="fixed inset-0 flex flex-col bg-base-100 font-sans">
  {/* Header */}
  <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-base-100 border-b border-base-300 shadow-sm w-full mt-[60px] sm:mt-[67px]">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="bg-primary/10 p-2 rounded-xl">
        <img
          src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
          alt="AI Logo"
          className="w-5 h-5 sm:w-6 sm:h-6"
        />
      </div>
      <div>
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-base-content">
          Resonance Ai
        </h1>
        <p className="text-[10px] sm:text-xs text-base-content/70 hidden sm:block">
          Your Smart Assistant
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2 bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
      <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
      <span className="text-[10px] sm:text-xs font-medium text-success">
        Online
      </span>
    </div>
  </div>

  {/* Chat Messages - Increased bottom padding for mobile */}
  <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 bg-base-100 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 pb-[140px] sm:pb-6">
    {messages.map((m, i) => (
      <div
        key={i}
        className={`flex ${
          m.role === "user" ? "justify-end" : "justify-start"
        } mb-4`}
      >
        <div className="relative max-w-[90%] sm:max-w-[75%] md:max-w-[65%]">
          {m.role !== "user" && (
            <div className="flex items-center gap-2 mb-1 ml-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
                alt="AI Logo"
                className="w-4 h-4"
              />
              <span className="text-[11px] sm:text-xs font-medium text-base-content/60">
                Resonance Ai
              </span>
            </div>
          )}

          <div
            className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl break-words ${
              m.role === "user"
                ? "bg-primary text-primary-content rounded-br-md shadow-sm"
                : "bg-base-200 text-base-content border border-base-300 rounded-bl-md shadow-sm"
            }`}
          >
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {m.text}
            </p>
          </div>
        </div>
      </div>
    ))}

    {loading && (
      <div className="flex justify-start mb-4">
        <div className="relative max-w-[90%] sm:max-w-[75%] md:max-w-[65%]">
          <div className="flex items-center gap-2 mb-1 ml-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712109.png"
              alt="AI Logo"
              className="w-4 h-4"
            />
            <span className="text-[11px] sm:text-xs font-medium text-base-content/60">
              Resonance Ai
            </span>
          </div>

          <div className="bg-base-200 border border-base-300 rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex items-center gap-2 text-base-content/70 text-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300"></div>
              </div>
              <span>Thinking...</span>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>

  {/* Input Area - Fixed for mobile with proper spacing above bottom navbar */}
  <div 
    className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 shadow-lg z-50"
    style={{ 
      paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 60px)",
      marginBottom: "env(safe-area-inset-bottom, 0px)"
    }}
  >
    <div className="max-w-4xl mx-auto w-full px-3 sm:px-4 pt-2 pb-3">
      <div className="relative flex items-end gap-2">
        <div className="flex-1 relative">
          <TextareaAutosize
            className="w-full border border-base-300 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-base-100 text-base-content placeholder-base-content/40 resize-none shadow-inner"
            placeholder="Ask Resonance AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            minRows={1}
            maxRows={4}
          />
        </div>

        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-primary text-primary-content p-3 rounded-xl hover:bg-primary-focus disabled:bg-base-300 disabled:text-base-content/40 transition-all active:scale-95 flex items-center justify-center min-w-[44px] h-[44px] mb-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      <p className="text-center text-[10px] sm:text-xs text-base-content/40 mt-2">
        Press Enter to send • Shift+Enter for new line
      </p>
    </div>
  </div>
</div>

  );
}
