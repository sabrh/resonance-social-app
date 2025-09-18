
import ChatList from "../components/PrivateChat/ChatList";
import Composer from "../components/PrivateChat/Composer";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-screen bg-base-200">
            <div className="flex-1 overflow-y-auto p-4">
                <ChatList />
            </div>
            <Composer />
        </div>
    );
}
