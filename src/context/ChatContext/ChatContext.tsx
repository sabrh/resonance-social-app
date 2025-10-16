import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

interface ChatContextType {
  socket: any;
  globalUnreadCount: number;
  setGlobalUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<any>(null);
  const [globalUnreadCount, setGlobalUnreadCount] = useState(0);

  useEffect(() => {
    const newSocket = io("http://localhost:5000"); // replace with your backend URL
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to socket:", newSocket.id);
    });

    // listen for unread updates
    newSocket.on("unread_count_update", (data) => {
      console.log("Unread count update:", data);
      setGlobalUnreadCount(data.unreadCount);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <ChatContext.Provider value={{ socket, globalUnreadCount, setGlobalUnreadCount }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used inside ChatProvider");
  return context;
};