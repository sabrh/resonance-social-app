import React, { useContext, useEffect, useState } from "react";
import type { FC } from "react";
import axios from "axios";
import {
  AuthContext,
  type AuthContextType,
} from "../context/AuthContext/AuthContext";
import PostFeed from "../components/post-components/PostFeed";

const API_URL = import.meta.env.VITE_API_URL || "https://resonance-social-server.vercel.app";





const postsData = [
  {
    "userId": "u101",
    "username": "Redoy",
    "profilePic": "https://i.ibb.co.com/C51shdQh/profile1.png",
    "postId": "p001",
    "content": "Just finished a 5k run! Feeling great",
    "media": "https://i.ibb.co.com/Tq0jKVSB/artifacts-slider5.jpg",
    "timestamp": "2025-09-19T08:30:00Z",
    "likes": 120,
    "comments": 15,
    "hashtags": ["#fitness", "#morningrun", "#health"]
  },
  {
    "userId": "u102",
    "username": "Sophia",
    "profilePic": "https://i.ibb.co.com/F4Xfj7JY/profile4.png",
    "postId": "p002",
    "content": "Loving this new autumn outfit",
    "media": "https://i.ibb.co.com/NP5gKgJ/artifact-slider2.jpg",
    "timestamp": "2025-09-18T18:45:00Z",
    "likes": 340,
    "comments": 28,
    "hashtags": ["#fashion", "#autumnvibes", "#OOTD"]
  },
  {
    "userId": "u103",
    "username": "Forhad Hasan",
    "profilePic": "https://i.ibb.co.com/8n368nrn/images-5.jpg",
    "postId": "p003",
    "content": "Exploring the new JavaScript framework today!",
    "media": "https://i.ibb.co.com/hFhLtg2q/javascript.jpg",
    "timestamp": "2025-09-19T10:15:00Z",
    "likes": 85,
    "comments": 10,
    "hashtags": ["#javascript", "#webdevelopment", "#coding"]
  },
  {
    "userId": "u104",
    "username": "Fahim Abdulla",
    "profilePic": "https://i.ibb.co.com/bMRfw30g/images-2.jpg",
    "postId": "p004",
    "content": "Sunset at Bali is breathtaking",
    "media": "https://i.ibb.co.com/rG2cVTn4/stone-henge.jpg",
    "timestamp": "2025-09-18T19:30:00Z",
    "likes": 560,
    "comments": 65,
    "hashtags": ["#travel", "#Bali", "#sunsetlover"]
  },
  {
    "userId": "u105",
    "username": "Arafat Hasan",
    "profilePic": "https://i.ibb.co.com/0VWYfKv2/images-6.jpg",
    "postId": "p005",
    "content": "Homemade pasta night Who wants the recipe?",
    "media": "https://i.ibb.co.com/0g8Ktrv/slider3.jpg",
    "timestamp": "2025-09-19T12:00:00Z",
    "likes": 210,
    "comments": 40,
    "hashtags": ["#foodie", "#homemade", "#pasta"]
  },

]


















type UserDoc = {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  banner?: string;
  bannerMimetype?: string;
};




const UserProfile: FC = () => {
  const authContext = useContext<AuthContextType | null>(AuthContext);
  const firebaseUser = authContext?.user; // get user from context
  const uid = firebaseUser?.uid;

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Ensure user exists in backend + fetch user doc
  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const syncUser = async () => {
      try {
        // Step 1: Ensure user doc exists in MongoDB
        await axios.post(`${API_URL}/users`, {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });

        // Step 2: Fetch user document
        const res = await axios.get(`${API_URL}/users/${firebaseUser.uid}`);
        setUserDoc(res.data);
      } catch (err) {
        console.error("User sync error:", err);
      }
    };

    syncUser();
  }, [firebaseUser]);

  // Handle preview of selected file
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!uid || !file) return;
    setLoading(true);
    const form = new FormData();
    form.append("banner", file);

    try {
      await axios.post(`${API_URL}/users/${uid}/banner`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // refresh user data
      const res = await axios.get(`${API_URL}/users/${uid}`);
      setUserDoc(res.data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Banner upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

 

  // Determine banner to show
  const bannerSrc = userDoc?.banner
    ? `data:${userDoc.bannerMimetype};base64,${userDoc.banner}`
    : preview || null;

  return (
    <div className="mx-auto bg-white shadow rounded-lg overflow-hidden">
      {/* Banner Section */}
      <div className="h-100 bg-gray-100 relative">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No banner yet
          </div>
        )}

        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          <label className="btn btn-sm btn-primary cursor-pointer">
            Change banner
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {file && (
            <button
              onClick={handleUpload}
              className="btn btn-sm btn-success"
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4 flex items-center mt-8 gap-4 border-[#f0f0f0] border-b-2">
        <div className="p-4 flex items-center gap-4">
          <img
            src={
              firebaseUser?.photoURL ||
              userDoc?.photoURL ||
              "/avatar-placeholder.png"
            }
            alt="avatar"
            className="w-20 h-20 rounded-full border-4 -mt-10 object-cover"
          />
          <div>
            <h2 className="text-xl font-bold">
              {userDoc?.displayName || firebaseUser?.displayName || "User"}
            </h2>
            <p className="text-sm text-gray-500">
              {userDoc?.email || firebaseUser?.email}
            </p>
          </div>
          
        </div>
         
<div>
            <button className=" bg-blue-400 text-white px-4 py-2 rounded-sm font-semibold">Follow</button>
          </div>
         
      </div>
      

      {/* Post Feed Section */}
<div className="mt-6">
  <PostFeed posts={postsData} />
</div>
      
    </div>
  );
};

export default UserProfile;
