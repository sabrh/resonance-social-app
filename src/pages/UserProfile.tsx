import React, { useContext, useEffect, useState } from "react";
import type { FC } from "react";
import axios from "axios";
import {
  AuthContext,
  type AuthContextType,
} from "../context/AuthContext/AuthContext";
import PostProfile from "../components/post-components/PostProfile";
import { useParams } from "react-router";

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

  const { uid: routeUid } = useParams<{ uid?: string }>(); // route uid, may be undefined
  const uid = firebaseUser?.uid;
  const targetUid = routeUid || uid; // final user id to load

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

  // tab state
  const [activeTab, setActiveTab] = useState("posts");

  // added for navigate
  useEffect(() => {
    if (!targetUid) return;

    const fetchUser = async () => {
      try {
        // Only ensure user exists in DB if it's your own profile
        if (targetUid === uid && firebaseUser) {
          await axios.post("http://localhost:3000/users", {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          });
        }

        // fetch the profile we want to show
        const res = await axios.get(`http://localhost:3000/users/${targetUid}`);
        setUserDoc(res.data);

        // preload form values only for your own profile
        if (targetUid === uid) {
          setFormData({
            education: res.data.education || "",
            location: res.data.location || "",
            gender: res.data.gender || "",
            relationshipStatus: res.data.relationshipStatus || "",
          });
        }

        // followers + follow status
        setFollowersCount(res.data.followers?.length || 0);
        if (uid && targetUid !== uid) {
          setIsFollowing(res.data.followers?.includes(uid) || false);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };

    fetchUser();
  }, [targetUid, uid, firebaseUser]);

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
      await axios.post(`http://localhost:3000/users/${uid}/banner`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // refresh user data
      const res = await axios.get(`http://localhost:3000/users/${uid}`);
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
      await axios.put(`http://localhost:3000/users/${uid}/details`, formData);

      const res = await axios.get(`http://localhost:3000/users/${uid}`);
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
        `http://localhost:3000/users/${userDoc.uid}/follow`,
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
      <div className="p-4 mt-8 border-b-2 border-[#f0f0f0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left side: Avatar + Info */}
        <div className="flex items-start sm:items-center gap-4 relative">
          <img
            src={
              userDoc?.photoURL ||
              firebaseUser?.photoURL ||
              "/avatar-placeholder.png"
            }
            alt="avatar"
            className="w-24 h-24 lg:w-35 lg:h-35 rounded-full border-4 object-cover -mt-18 sm:-mt-25 md:-mt-25 lg:-mt-25"
          />
          <div>
            <h2 className="text-lg sm:text-xl font-bold">
              {userDoc?.displayName || firebaseUser?.displayName || "User"}
            </h2>

            {/* followers */}
            <div className="flex gap-6 mt-1 text-sm sm:text-base">
              <p>
                <span className="font-medium">Followers:</span> {followersCount}
              </p>
              <p>
                <span className="font-medium">Following:</span>{" "}
                {userDoc?.following?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {targetUid !== uid && (
            <button
              onClick={handleFollowToggle}
              className={`px-3 py-1 rounded-md font-semibold ${
                isFollowing ? "bg-red-500 text-white" : "bg-blue-500 text-white"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          {targetUid === uid && (
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-sm btn-outline"
            >
              Edit about
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000a9] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Bio</h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Education"
                value={formData.education}
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Relationship Status"
                value={formData.relationshipStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relationshipStatus: e.target.value,
                  })
                }
                className="input input-bordered w-full"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleBioSave}
                className="btn btn-sm btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="w-full">
        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-4">
          {["posts", "about", "friends"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-center font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-600 hover:text-blue-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Centered Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-5">
          {/* Left empty */}
          <div className="hidden lg:block"></div>

          {/* Middle column */}
          <div className="lg:col-span-1">
            {activeTab === "posts" && <PostProfile targetUid={targetUid} />}
            {activeTab === "about" && (
              <div className="p-4 border border-[#f0f0f0] mb-4 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">About</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {userDoc?.email || firebaseUser?.email}
                  </p>

                  <p>
                    <span className="font-medium">Education:</span>{" "}
                    {userDoc?.education || (
                      <span className="text-gray-400">Add education</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {userDoc?.location || (
                      <span className="text-gray-400">Add location</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {userDoc?.gender || (
                      <span className="text-gray-400">Add gender</span>
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Relationship Status:</span>{" "}
                    {userDoc?.relationshipStatus || (
                      <span className="text-gray-400">
                        Add relationship status
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            {activeTab === "friends" && (
              <div className="p-4 border border-[#f0f0f0] mb-4 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-3">Friends</h3>
                <p className="text-gray-500 text-sm">No friends added yet.</p>
              </div>
            )}
          </div>

          {/* Right empty */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
