export interface User {
  _id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  online?: boolean;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: Date;
}

export interface ChatState {
  selectedUser: User | null;
  messages: Message[];
  users: User[];
  onlineUsers: string[];
}