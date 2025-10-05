import { useEffect, useState } from "react";
import type { FC, ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { createUserWithEmailAndPassword, GithubAuthProvider, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import type { User, UserCredential } from "firebase/auth";
import { auth } from "../../firebase/firebase.init";

interface AuthProviderProps {
  children: ReactNode;
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const createUser = (email: string, password: string) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInUser = (email: string, password: string) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signOutUser = () => {
    setLoading(true);
    return signOut(auth);
  };

  useEffect(() => {
    const unSubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      unSubscribe();
    };
  }, []);

  const googleSign = async (): Promise<UserCredential> => {
    setLoading(true);
    return await signInWithPopup(auth, googleProvider);
  };

  const githubSign = async (): Promise<UserCredential> => {
    setLoading(true);
    return signInWithPopup(auth, githubProvider);
  };

  const forgotPassword = (email: string): Promise<void> => {
    return sendPasswordResetEmail(auth, email);
  };


  const authInfo = {
    loading,
    user,
    createUser,
    signInUser,
    signOutUser,
    googleSign,
    githubSign,
    forgotPassword
  };

  // console.log(user);
  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;