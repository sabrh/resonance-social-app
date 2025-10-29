import { useState, useEffect, type FC } from "react";
import Sidebar from "../components/chat-components/Sidebar";
import ChatContainer from "../components/chat-components/ChatContainer";
import RightSidebar from "../components/chat-components/RightSidebar";
import { useAuth } from "../context/AuthContext/AuthContext";
import { io, type Socket } from "socket.io-client";
import axios from "axios";
import type { Message, User } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "https://resonance-social-server.vercel.app";

const Chats: FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user: currentUser } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!currentUser) return;
    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    setSocket(newSocket);
    console.log("Socket connected to:", API_URL);

    newSocket.emit("user_connected", currentUser.uid);

    newSocket.on("user_online", (userId: string) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    newSocket.on("user_offline", (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    // Receive messages (both incoming and echoed)
    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      if (message.senderId !== currentUser.uid && message.senderId !== selectedUser?.uid) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));
      }
    };

    newSocket.on("receive_message", handleReceiveMessage);

    // Load users
    loadUsers();

    return () => {
      newSocket.off("receive_message", handleReceiveMessage);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [currentUser]); // eslint-disable-line

  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages(currentUser.uid, selectedUser.uid);
      // reset unread for opened chat
      setUnreadCounts((prev) => ({ ...prev, [selectedUser.uid]: 0 }));
    }
  }, [selectedUser, currentUser]); // eslint-disable-line

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.filter((u: User) => u.uid !== currentUser?.uid));
    } catch (error) {
      console.error(" Failed to load users:", error);
    }
  };

  const loadMessages = async (userId1: string, userId2: string) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId1}/${userId2}`);
      setMessages(response.data);
    } catch (error) {
      console.error(" Failed to load messages:", error);
    }
  };

  // Send message: uploads image first (if present) then emits via socket
  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!selectedUser || !currentUser || !socket) return;
    if (!text.trim() && !imageFile) return;

    let imageUrl: string | undefined;
    if (imageFile) {
      try {
        const form = new FormData();
        form.append("image", imageFile);
        const res = await axios.post(`${API_URL}/upload/image`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = res.data.url;
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }

    const messageData: Message = {
      _id: crypto.randomUUID(),
      senderId: currentUser.uid,
      receiverId: selectedUser.uid,
      text: text.trim() || undefined,
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", messageData);
    // optimistic update
    setMessages((prev) => [...prev, { ...messageData, createdAt: new Date(messageData.createdAt) } as any]);
  };

  // ensure currentUser is registered in DB (upsert)
  useEffect(() => {
    if (!currentUser) return;
    const upsert = async () => {
      try {
        await axios.post(`${API_URL}/users`, {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          email: currentUser.email
        });
        loadUsers();
      } catch (err) {
        console.error("Failed to upsert user", err);
      }
    };
    upsert();
  }, [currentUser]); // eslint-disable-line

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access chats</p>
      </div>
    );
  }

  return (
    <div className="mt-1 md:mt-20 w-full h-[calc(100vh-5rem)] p-4">
      <div
        className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden h-full grid relative
        ${selectedUser ? "grid-cols-1 md:grid-cols-[350px_1fr_300px]" : "grid-cols-1 md:grid-cols-[350px_1fr]"}`}
      >
        <Sidebar
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          users={users}
          onlineUsers={onlineUsers}
          unreadCounts={unreadCounts}
          messages={messages}
        />
        <ChatContainer
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
        <RightSidebar selectedUser={selectedUser} messages={messages} />
      </div>
    </div>
  );
};

export default Chats;