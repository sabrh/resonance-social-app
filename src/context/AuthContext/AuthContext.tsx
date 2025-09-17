import { createContext } from "react";
import type { UserCredential } from "firebase/auth";

interface AuthContextType {
  loading: boolean;
  createUser: (email: string, password: string) => Promise<UserCredential>;
}

export const AuthContext = createContext<AuthContextType | null>(null);