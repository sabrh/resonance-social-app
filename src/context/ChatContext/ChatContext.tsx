import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../AuthContext/AuthContext';
import { User, Message } from '../../types/chat';

interface ChatContextType {
  socket: Socket | null;
  onlineUsers: string[];
  unreadCounts: Record<string, number>;
  updateUnreadCounts: (userId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || "https://resonance-social-server.vercel.app";

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(API_URL, {
      query: {
        userId: currentUser.uid
      }
    });

    setSocket(newSocket);

    // Listen for online users updates
    newSocket.on("getOnlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    // Load initial unread counts
    loadUnreadCounts();

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  const loadUnreadCounts = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`${API_URL}/api/messages/unread/${currentUser.uid}`);
      if (response.data.success) {
        setUnreadCounts(response.data.unreadCounts);
      }
    } catch (error) {
      console.error("Failed to load unread counts:", error);
    }
  };

  const updateUnreadCounts = (userId: string) => {
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }));
  };

  return (
    <ChatContext.Provider value={{
      socket,
      onlineUsers,
      unreadCounts,
      updateUnreadCounts
    }}>
      {children}
    </ChatContext.Provider>
  );
};