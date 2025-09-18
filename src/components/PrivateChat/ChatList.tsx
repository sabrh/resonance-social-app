import { useChatStore } from "../../store/chatStore";


export default function ChatList() {
    const messages = useChatStore((state) => state.messages);

    return (
        <div className="space-y-2">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`chat ${msg.sender === "me" ? "chat-end" : "chat-start"}`}
                >
                    <div className="chat-bubble">{msg.text}</div>
                </div>
            ))}
        </div>
    );
}
