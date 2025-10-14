import { useState, useEffect, type FC } from 'react';
import Sidebar from '../components/chat-components/Sidebar';
import ChatContainer from '../components/chat-components/ChatContainer';
import RightSidebar from '../components/chat-components/RightSidebar';
import { useAuth } from '../context/AuthContext/AuthContext';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import type { Message, User } from '../types/chat';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Chats: FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      // Initialize socket connection
      const newSocket = io(API_URL);
      setSocket(newSocket);

      // Notify server that user is connected
      newSocket.emit('user_connected', currentUser.uid);

      // Listen for online users
      newSocket.on('user_online', (userId: string) => {
        setOnlineUsers(prev => [...prev, userId]);
      });

      newSocket.on('user_offline', (userId: string) => {
        setOnlineUsers(prev => prev.filter(id => id !== userId));
      });

      // Listen for new messages
      newSocket.on('receive_message', (message: Message) => {
        setMessages(prev => [...prev, message]);
      });

      // Load users
      loadUsers();

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser && currentUser) {
      loadMessages(currentUser.uid, selectedUser.uid);
    }
  }, [selectedUser, currentUser]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.filter((user: User) => user.uid !== currentUser?.uid));
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadMessages = async (userId1: string, userId2: string) => {
    try {
      const response = await axios.get(`${API_URL}/messages/${userId1}/${userId2}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSendMessage = async (text: string, imageFile?: File) => {
    if (!selectedUser || !currentUser || !socket) return;

    let imageUrl = '';
    
    // Handle image upload if present
    if (imageFile) {
      // For now, we'll use a placeholder. You should implement actual image upload
      imageUrl = URL.createObjectURL(imageFile);
    }

    const messageData = {
      senderId: currentUser.uid,
      receiverId: selectedUser.uid,
      text: text.trim() || undefined,
      image: imageUrl || undefined,
      createdAt: new Date()
    };

    socket.emit('send_message', messageData);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please log in to access chats</p>
      </div>
    );
  }

  return (
    <div className='mt-20 bg-gradient-to-br from-blue-400 to-purple-600 w-full h-[calc(100vh-5rem)] p-4'>
      <div className={`backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl overflow-hidden h-full grid relative 
        ${selectedUser ? 'grid-cols-1 md:grid-cols-[350px_1fr_300px]' : 'grid-cols-1 md:grid-cols-[350px_1fr]'}`}>
        <Sidebar 
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser}
          users={users}
          onlineUsers={onlineUsers}
        />
        <ChatContainer 
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser}
          messages={messages}
          onSendMessage={handleSendMessage}
        />
        <RightSidebar selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default Chats;