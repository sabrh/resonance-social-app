import React, { useContext, useEffect, useState } from "react";
import type { FC } from "react";
import axios from "axios";
import {
  AuthContext,
  type AuthContextType,
} from "../context/AuthContext/AuthContext";
import PostFeed from "../components/post-components/PostFeed";


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
        const res = await axios.get(`https://resonance-social-server.vercel.app/users/${firebaseUser.uid}`);
        setUserDoc(res.data);

        console.log(res.data)
        // preload bio values
        setFormData({
          education: res.data.education || "",
          location: res.data.location || "",
          gender: res.data.gender || "",
          relationshipStatus: res.data.relationshipStatus || "",
        });

         setFollowersCount(res.data.followers?.length || 0);
         // check if current user is already following
        setIsFollowing(res.data.followers?.includes(firebaseUser?.uid) || false);


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
      await axios.post(`https://resonance-social-server.vercel.app/users/${uid}/banner`, form, {
  headers: { "Content-Type": "multipart/form-data" },
});
      // refresh user data
      const res = await axios.get(`https://resonance-social-server.vercel.app/users/${uid}`);
      setUserDoc(res.data);
      console.log(res.data)
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
      await axios.put(`https://resonance-social-server.vercel.app/users/${uid}/details`, formData);

      const res = await axios.get(`https://resonance-social-server.vercel.app/users/${uid}`);
      console.log(res)
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


      {/* Follow     */}
        <div className="mb-5">
        <button
      onClick={handleFollowToggle}
      className={`px-2 py-1 rounded-sm font-semibold ${
        isFollowing ? "bg-red-400 text-white" : "bg-blue-400 text-white"
          }`}
          >
        {isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>

         
      </div>

        {/* Bio Section */}
      <div className="p-4 border-b-2 border-[#f0f0f0]">
        <h3 className="text-lg font-semibold mb-3">Bio</h3>
        <div className="space-y-2 text-gray-700">

          <div className="flex">
<p>
            <span className="font-medium">Followers:</span>{" "}
            {followersCount}
          </p>
           <p>
            <span className="font-medium">Following:</span>{" "}
            {userDoc?.following?.length || 0}
          </p>


          </div>

          
         
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
            {userDoc?.gender || <span className="text-gray-400">Add gender</span>}
          </p>
          <p>
            <span className="font-medium">Relationship Status:</span>{" "}
            {userDoc?.relationshipStatus || (
              <span className="text-gray-400">Add relationship status</span>
            )}
          </p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-sm btn-outline"
          >
            Edit details
          </button>
        </div>
      </div>
      

      {/* Post Feed Section */}
        <div className="mt-6">
          <PostFeed posts={postsData} />
        </div>


     {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
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
              <button onClick={handleBioSave} className="btn btn-sm btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default UserProfile;
