import { ArrowLeft, Info, Send, Image as ImageIcon } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";
import { formatMessageTime } from "../../lib/utils";
import type { Message, User } from "../../types/chat";
import { useAuth } from "../../context/AuthContext/AuthContext";

interface ChatContainerProps {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  messages: Message[];
  onSendMessage: (text: string, image?: File | undefined) => void;
  isConnected: boolean;
}

const ChatContainer: FC<ChatContainerProps> = ({ 
  selectedUser, 
  setSelectedUser, 
  messages, 
  onSendMessage,
  isConnected 
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const scrollEnd = useRef<HTMLDivElement>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!newMessage.trim() && !imageFile) || isUploading) return;
    
    setIsUploading(true);
    try {
      await onSendMessage(newMessage, imageFile || undefined);
      setNewMessage("");
      setImageFile(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedUser || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 h-full md:col-span-1">
        <h3 className="font-bold text-xl">Welcome to Messages</h3>
        <p className="text-lg font-medium">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-lg">
      <div className="flex items-center gap-3 py-4 px-6 border-b border-gray-700 bg-white/5">
        <ArrowLeft 
          onClick={() => setSelectedUser(null)} 
          className="md:hidden w-6 h-6 cursor-pointer" 
        />
        <img 
          src={selectedUser.photoURL || "/default-avatar.png"} 
          alt={selectedUser.displayName} 
          className="w-10 h-10 rounded-full object-cover" 
        />
        <div className="flex-1">
          <p className="text-lg font-semibold">{selectedUser.displayName}</p>
          <p className={`text-sm flex items-center gap-1 ${
            isConnected ? "text-green-600" : "text-gray-500"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-600" : "bg-gray-500"
            }`}></span>
            {isConnected ? "Online" : "Offline"}
          </p>
        </div>
        <Info className="w-6 h-6 cursor-pointer" />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with {selectedUser.displayName}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message._id} 
              className={`flex items-end gap-3 ${
                message.senderId === currentUser.uid ? "justify-end" : "justify-start"
              }`}
            >
              {message.senderId !== currentUser.uid && (
                <img 
                  src={selectedUser.photoURL || "/default-avatar.png"} 
                  alt={selectedUser.displayName} 
                  className="w-8 h-8 rounded-full flex-shrink-0" 
                />
              )}

              <div className={`max-w-[70%] ${message.senderId === currentUser.uid ? "order-first" : ""}`}>
                {message.image ? (
                  <img 
                    src={message.image} 
                    alt="Shared image" 
                    className="max-w-full rounded-lg border border-gray-600 cursor-pointer hover:opacity-90 transition-opacity" 
                    onClick={() => window.open(message.image, "_blank")} 
                  />
                ) : (
                  <div className={`p-3 rounded-2xl ${
                    message.senderId === currentUser.uid 
                      ? "bg-blue-500 text-white rounded-br-none" 
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  }`}>
                    <p className="break-words whitespace-pre-wrap">{message.text}</p>
                  </div>
                )}
                <p className={`text-xs text-gray-600 mt-1 ${
                  message.senderId === currentUser.uid ? "text-right" : "text-left"
                }`}>
                  {formatMessageTime(message.createdAt)}
                </p>
              </div>

              {message.senderId === currentUser.uid && (
                <img 
                  src={currentUser.photoURL || "/default-avatar.png"} 
                  alt="You" 
                  className="w-8 h-8 rounded-full flex-shrink-0" 
                />
              )}
            </div>
          ))
        )}
        <div ref={scrollEnd} />
      </div>

      <div className="p-4 border-t border-gray-700 bg-white/5">
        {isUploading && (
          <div className="text-sm text-blue-500 mb-2">Uploading...</div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center rounded-full px-4 bg-transparent border border-gray-700">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none placeholder-gray-600 py-3 text-sm"
              disabled={isUploading}
            />
            {/*<input 
              type="file" 
              id="image" 
              accept="image/png,image/jpeg,image/gif" 
              hidden 
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              disabled={isUploading}
            />
            <label 
              htmlFor="image" 
              className={`cursor-pointer p-2 hover:bg-gray-600 rounded-full ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </label>
            */}
          </div>
          <button 
            onClick={handleSend} 
            disabled={(!newMessage.trim() && !imageFile) || isUploading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white p-3 rounded-full transition-colors disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/*{imageFile && (
          <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="truncate max-w-xs">{imageFile.name}</span>
            <button 
              onClick={() => setImageFile(null)} 
              className="text-red-400 hover:text-red-300 text-xs"
              disabled={isUploading}
            >
              Remove
            </button>
          </div>
        )}*/}
      </div>
    </div>
  );
};

export default ChatContainer;