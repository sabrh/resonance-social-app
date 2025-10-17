import React, { useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import axios from "axios";
import {
  AuthContext,
  type AuthContextType,
} from "../context/AuthContext/AuthContext";
import { IoNewspaperOutline } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa";
import { TiMessages } from "react-icons/ti";
import { AiFillAndroid } from "react-icons/ai";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type UserDoc = {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  banner?: string;
  bannerMimetype?: string;
};

const LeftSidebar: React.FC = () => {
  const authContext = useContext<AuthContextType | null>(AuthContext);
  const firebaseUser = authContext?.user;
  // const uid = firebaseUser?.uid;

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const fetchUser = async () => {
      try {
        await axios.post(`${API_URL}/users`, {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });

        const res = await axios.get(`${API_URL}/users/${firebaseUser.uid}`);
        setUserDoc(res.data);
      } catch (err) {
        console.error("Sidebar user fetch error:", err);
      }
    };

    fetchUser();
  }, [firebaseUser]);

  const bannerSrc = userDoc?.banner
    ? `data:${userDoc.bannerMimetype};base64,${userDoc.banner}`
    : null;

  return (
    <aside className="hidden md:block md:col-span-3">
      <div className="sticky top-10 bg-base-100 rounded-lg shadow-lg overflow-hidden">
        {/* Banner */}
        <div className="relative h-28 bg-base-200">
          {bannerSrc ? (
            <img
              src={bannerSrc}
              alt="banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/50 text-sm">
              No Banner
            </div>
          )}

          {/* Avatar */}
          <div className="absolute left-1/2 -bottom-10 transform -translate-x-1/2">
            <img
              src={
                firebaseUser?.photoURL ||
                userDoc?.photoURL ||
                "/avatar-placeholder.png"
              }
              alt="profile"
              className="w-20 h-20 rounded-full border-4 border-base-100 object-cover shadow-lg"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mt-12 text-center px-4">
          <h2 className="font-bold text-lg text-base-content">
            {userDoc?.displayName || firebaseUser?.displayName || "User"}
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="mt-6">
          <ul className="flex flex-col gap-3">
            <li>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "font-semibold bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200 dark:hover:bg-base-300"
                  }`
                }
              >
                <IoNewspaperOutline className="text-secondary" size={20} />
                Newsfeed
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "font-semibold bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200 dark:hover:bg-base-300"
                  }`
                }
              >
                <FaRegUser className="text-primary" size={20} />
                My Profile
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "font-semibold bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200 dark:hover:bg-base-300"
                  }`
                }
              >
                <TiMessages className="text-accent" size={20} />
                Messages
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/AiChat"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    isActive
                      ? "font-semibold bg-primary text-primary-content"
                      : "text-base-content hover:bg-base-200 dark:hover:bg-base-300"
                  }`
                }
              >
                <AiFillAndroid className="text-secondary" size={20} />
                Smart Assistant
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Chat Online Button */}
        <div className="p-6">
          <button
            onClick={() => navigate("/messages")}
            className="w-full btn btn-success text-white font-semibold py-2 rounded-full transition-transform hover:scale-105"
          >
            Chat Online
          </button>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
