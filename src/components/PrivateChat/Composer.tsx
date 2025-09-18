import { useState } from "react";
import { useChatStore } from "../../store/chatStore";


export default function Composer() {
    const [input, setInput] = useState("");
    const addMessage = useChatStore((state) => state.addMessage);

    const handleSend = () => {
        if (!input.trim()) return;

        addMessage({
            id: Date.now().toString(), // ইউনিক আইডি
            text: input,               // ইউজার যা লিখেছে
            sender: "me",              // sender = আমি
            createdAt: new Date(),     // এখনকার সময়
        });

        setInput(""); // পাঠানোর পর ইনপুট ফাঁকা করো
    };

    return (
        <div className="flex gap-2 p-2 bg-base-300">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="input input-bordered flex-1"
                placeholder="Type a message..."
            />
            <button onClick={handleSend} className="btn btn-primary">
                Send
            </button>
        </div>
    );
}
