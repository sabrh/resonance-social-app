import { createContext } from "react";
import type { User, UserCredential } from "firebase/auth";
import type { Socket } from "socket.io-client";

export interface AuthContextType {
  loading: boolean;
  user: User | null;
  socket: Socket | null;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;

  createUser: (email: string, password: string) => Promise<UserCredential>;
  signInUser: (email: string, password: string) => Promise<UserCredential>;
  signOutUser: () => Promise<void>;
  googleSign: () => Promise<UserCredential>;
  githubSign: () => Promise<UserCredential>;
  forgotPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
