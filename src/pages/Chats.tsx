import { useState, useEffect, type FC } from "react";
import Sidebar from "../components/chat-components/Sidebar";
import ChatContainer from "../components/chat-components/ChatContainer";
import RightSidebar from "../components/chat-components/RightSidebar";
import { useAuth } from "../context/AuthContext/AuthContext";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/firebase.init"; 
import type { Message, User } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Chats: FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user: currentUser } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  //  1. Connect to socket.io backend
  useEffect(() => {
    if (!currentUser) return;

    const newSocket = io(API_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    setSocket(newSocket);
    console.log(" Socket connected to:", API_URL);

    // Notify backend that user is connected
    newSocket.emit("user_connected", currentUser.uid);

    // Handle online/offline updates
    newSocket.on("user_online", (userId: string) => {
      setOnlineUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]));
    });

    newSocket.on("user_offline", (userId: string) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    // Load user list
    loadUsers();

    return () => {
      newSocket.disconnect();
      console.log(" Socket disconnected");
    };
  }, [currentUser]);

  //  2. Listen for incoming messages — clean, isolated useEffect
  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleReceiveMessage = (message: Message) => {
      console.log(" New message:", message);
      setMessages((prev) => [...prev, message]);

      // Update unread count if chat isn't open
      if (
        message.senderId !== currentUser.uid &&
        message.senderId !== selectedUser?.uid
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1,
        }));
      }
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, currentUser, selectedUser]);

  //  3. Load messages when a user is selected
  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages(currentUser.uid, selectedUser.uid);
    }
  }, [selectedUser, currentUser]);

  //  4. Reset unread count when user opens chat
  useEffect(() => {
    if (selectedUser) {
      setUnreadCounts((prev) => ({ ...prev, [selectedUser.uid]: 0 }));
    }
  }, [selectedUser]);

  //  Fetch all users except current
  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.filter((user: User) => user.uid !== currentUser?.uid));
    } catch (error) {
      console.error(" Failed to load users:", error);
    }
  };

  //  Fetch previous chat messages
  const loadMessages = async (userId1: string, userId2: string) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId1}/${userId2}`);
      setMessages(response.data);
    } catch (error) {
      console.error(" Failed to load messages:", error);
    }
  };

  //  5. Handle sending message (text + image)
  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!selectedUser || !currentUser || !socket) return;
    if (!text.trim() && !imageFile) return;

    let imageUrl: string | undefined;

    // Upload to Firebase Storage
    if (imageFile) {
      try {
        const imageRef = ref(storage, `chat_images/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        console.error(" Image upload failed:", error);
      }
    }

    const messageData: Message = {
      _id: crypto.randomUUID(),
      senderId: currentUser.uid,
      receiverId: selectedUser.uid,
      text: text.trim() || undefined,
      image: imageUrl,
      createdAt: new Date(),
    };

    // Emit to backend
    socket.emit("send_message", messageData);

    // Show instantly
    setMessages((prev) => [...prev, messageData]);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access chats</p>
      </div>
    );
  }

  return (
    <div className="mt-20 bg-gradient-to-br from-blue-400 to-green-600 w-full h-[calc(100vh-5rem)] p-4">
      <div
        className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden h-full grid relative 
        ${selectedUser ? 'grid-cols-1 md:grid-cols-[350px_1fr_300px]' : 'grid-cols-1 md:grid-cols-[350px_1fr]'}`}
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