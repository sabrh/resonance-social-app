import React, { useContext, useEffect, useState } from "react";
import type { FC } from "react";
import axios from "axios";
import {
  AuthContext,
  type AuthContextType,
} from "../context/AuthContext/AuthContext";

import PostProfile from "../components/post-components/PostProfile";

type UserDoc = {
  uid: string;
  displayName?: string;
  photoURL?: string;
  email?: string;
  banner?: string;
  bannerMimetype?: string;
  education?: string;
  location?: string;
  gender?: string;
  relationshipStatus?: string;
  followers?: string[];
  following?: string[];
};

const UserProfile: FC = () => {
  const authContext = useContext<AuthContextType | null>(AuthContext);
  const firebaseUser = authContext?.user; // get user from context
  const uid = firebaseUser?.uid;

  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    education: "",
    location: "",
    gender: "",
    relationshipStatus: "",
  });

  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const syncUser = async () => {
      try {
        //  Ensure user doc exists in MongoDB
        await axios.post("https://resonance-social-server.vercel.app/users", {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });

        //  Fetch user document
        const res = await axios.get(
          `https://resonance-social-server.vercel.app/users/${firebaseUser.uid}`
        );
        setUserDoc(res.data);

        console.log(res.data);
        // preload bio values
        setFormData({
          education: res.data.education || "",
          location: res.data.location || "",
          gender: res.data.gender || "",
          relationshipStatus: res.data.relationshipStatus || "",
        });

        setFollowersCount(res.data.followers?.length || 0);
        // check if current user is already following
        setIsFollowing(
          res.data.followers?.includes(firebaseUser?.uid) || false
        );
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
      await axios.post(
        `https://resonance-social-server.vercel.app/users/${uid}/banner`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      // refresh user data
      const res = await axios.get(
        `https://resonance-social-server.vercel.app/users/${uid}`
      );
      setUserDoc(res.data);
      console.log(res.data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      console.error("Banner upload error:", err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // handle bio update
  const handleBioSave = async () => {
    if (!uid) return;
    try {
      await axios.put(
        `https://resonance-social-server.vercel.app/users/${uid}/details`,
        formData
      );

      const res = await axios.get(
        `https://resonance-social-server.vercel.app/users/${uid}`
      );
      console.log(res);
      setUserDoc(res.data);
      setShowModal(false);
    } catch (err) {
      console.error("Bio update failed:", err);
      alert("Failed to update bio");
    }
  };

  const handleFollowToggle = async () => {
    if (!uid || !userDoc?.uid) return;
    try {
      const res = await axios.put(
        `https://resonance-social-server.vercel.app/users/${userDoc.uid}/follow`,
        { currentUid: uid }
      );

      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followersCount);
    } catch (err) {
      console.error("Follow toggle failed:", err);
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
          <button className=" bg-blue-400 text-white px-4 py-2 rounded-sm font-semibold">
            Follow
          </button>
        </div>
      </div>

      {/* Post Feed Section */}
      <div className="mt-6">
        <PostProfile></PostProfile>
      </div>
    </div>
  );
};

export default UserProfile;
