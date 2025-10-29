import React, { useContext, useEffect, useState } from "react";
import type { FC } from "react";
import axios from "axios";

import {
  AuthContext,
  type AuthContextType,
} from "../context/AuthContext/AuthContext";
import PostProfile from "../components/post-components/PostProfile";
import { useParams } from "react-router";
import toast from "react-hot-toast";
import ChangeProfileImage, {
  type UserDocument,
} from "../components/Profile/ChangeProfileImage";
import { FaCamera } from "react-icons/fa6";

type SocialLinks = {
  github?: string;
  instagram?: string;
  linkedin?: string;
  website?: string;
}; // update about

type UserDoc = {
  uid: string;
  displayName?: string;
  username?: string;
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
  // NEW FIELDS
  birthday?: string; // ISO date string
  languages?: string[];
  bio?: string;
  occupation?: string;
  company?: string;
  skills?: string[];
  socialLinks?: SocialLinks;
  createdAt?: string; // stored as ISO in DB
  lastActive?: string;
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

  // New modal states for followers/following list
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<UserDoc[]>([]);
  const [followingList, setFollowingList] = useState<UserDoc[]>([]);

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    education: "",
    location: "",
    gender: "",
    relationshipStatus: "",
    // NEW
    username: "",
    birthday: "",
    languages: "",
    bio: "",
    occupation: "",
    company: "",
    skills: "",
    github: "",
    instagram: "",
    linkedin: "",
    website: "",
  });

  // profile modal
  const [profileModal, setProfileModal] = useState(false);
  const isOwner = uid === firebaseUser?.uid;

  // tab state
  const [activeTab, setActiveTab] = useState("posts");


  const [refreshKey, setRefreshKey] = useState(0); // added for profile post


  // added for navigate
  useEffect(() => {
    if (!targetUid) return;

    const fetchUser = async () => {
      try {
        // Only ensure user exists in DB if it's your own profile
        if (targetUid === uid && firebaseUser) {
          await axios.post("https://resonance-social-server.vercel.app/users", {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          });
        }

        // fetch the profile we want to show
        const res = await axios.get(
          `https://resonance-social-server.vercel.app/users/${targetUid}`
        );
        setUserDoc(res.data);

        // preload form values only for your own profile
        if (targetUid === uid) {
          setFormData({
            education: res.data.education || "",
            location: res.data.location || "",
            gender: res.data.gender || "",
            relationshipStatus: res.data.relationshipStatus || "",
            // New
            username: res.data.username || "",
            birthday: res.data.birthday ? res.data.birthday.split("T")[0] : "",
            languages: (res.data.languages || []).join(", "),
            bio: res.data.bio || "",
            occupation: res.data.occupation || "",
            company: res.data.company || "",
            skills: (res.data.skills || []).join(", "),
            github: res.data.socialLinks?.github || "",
            instagram: res.data.socialLinks?.instagram || "",
            linkedin: res.data.socialLinks?.linkedin || "",
            website: res.data.socialLinks?.website || "",
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

  // full about details
  const handleBioSave = async () => {
    if (!uid) return;
    // prepare payload: convert comma lists to arrays
    const payload = {
      education: formData.education || null,
      location: formData.location || null,
      gender: formData.gender || null,
      relationshipStatus: formData.relationshipStatus || null,
      username: formData.username || null,
      birthday: formData.birthday || null,
      languages: formData.languages
        ? formData.languages.split(",").map((s) => s.trim())
        : [],
      bio: formData.bio || null,
      occupation: formData.occupation || null,
      company: formData.company || null,
      skills: formData.skills
        ? formData.skills.split(",").map((s) => s.trim())
        : [],
      socialLinks: {
        github: formData.github || null,
        instagram: formData.instagram || null,
        linkedin: formData.linkedin || null,
        website: formData.website || null,
      },
    };

    try {
      await axios.put(
        `https://resonance-social-server.vercel.app/users/${uid}/details`,
        payload
      );
      const res = await axios.get(
        `https://resonance-social-server.vercel.app/users/${uid}`
      );
      setUserDoc(res.data);
      setShowModal(false);
      toast.success("Profile updated");
    } catch (err) {
      console.error("Bio update failed:", err);
      toast.error("Update failed");
    }
  };

  // useEffect to handle follow status properly
  useEffect(() => {
    if (!targetUid || !uid) return;

    const checkFollowStatus = async () => {
      try {
        const res = await axios.get(
          `https://resonance-social-server.vercel.app/users/${targetUid}`
        );
        const userData = res.data;

        setUserDoc(userData);
        setFollowersCount(userData.followers?.length || 0);

        // Check if current user is following target user
        if (uid && targetUid !== uid) {
          const isUserFollowing = userData.followers?.includes(uid) || false;
          setIsFollowing(isUserFollowing);
        } else {
          setIsFollowing(false);
        }
      } catch (err) {
        console.error("Error checking follow status:", err);
      }
    };

    checkFollowStatus();
  }, [targetUid, uid]);

  // Improved follow toggle handler
  const handleFollowToggle = async () => {
    if (!uid || !userDoc?.uid || uid === userDoc.uid) return;

    try {
      setLoading(true);
      const res = await axios.put(
        `https://resonance-social-server.vercel.app/users/${userDoc.uid}/follow`,
        { currentUid: uid }
      );

      setIsFollowing(res.data.isFollowing);
      setFollowersCount(res.data.followersCount);

      // Show feedback to user
      toast.success(
        res.data.isFollowing
          ? "Followed successfully!"
          : "Unfollowed successfully!"
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  // fetch followers and following users
  const fetchFollowers = async () => {
    if (!targetUid) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/users/${targetUid}/followers`
      );
      setFollowersList(res.data);
      setShowFollowers(true);
    } catch (err) {
      console.error("Error fetching followers:", err);
    }
  };

  const fetchFollowing = async () => {
    if (!targetUid) return;
    try {
      const res = await axios.get(
        `http://localhost:3000/users/${targetUid}/following`
      );
      setFollowingList(res.data);
      setShowFollowing(true);
    } catch (err) {
      console.error("Error fetching following:", err);
    }
  };

  // Determine banner to show
  const bannerSrc = userDoc?.banner
    ? `data:${userDoc.bannerMimetype};base64,${userDoc.banner}`
    : preview || null;

  // helper to format date
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch (e) {
      console.log(e);
      return iso;
    }
  };

  if (loading) return <p className="text-center py-10">Loading profile...</p>;
  if (!userDoc)
    return <p className="text-center py-10 text-error">User not found.</p>;

  return (
    <div className="mx-auto bg-base-100 shadow rounded-lg overflow-hidden">
      {/* Banner */}
      <div className="h-100 bg-base-200 relative">
        {bannerSrc ? (
          <img
            src={bannerSrc}
            alt="banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/60">
            No banner yet
          </div>
        )}

        {firebaseUser?.uid === userDoc?.uid && (
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
        )}
      </div>

      {/* Profile Info */}
      <div className="p-4 mt-8 border-b-2 border-base-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:hidden">
        <div className="flex items-start sm:items-center gap-4 relative">
          {/* new profile added */}
          <div className="relative ">
            <img
              src={userDoc?.photoURL || "/default-avatar.png"}
              alt="avatar"
              className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border-4 border-primary object-cover shadow-md transition-all duration-300 -mt-18 sm:-mt-25 md:-mt-25 lg:-mt-25"
            />

            {/* Camera Icon - Only for owner */}
            {isOwner && (
              <button
                onClick={() => setProfileModal(true)}
                className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform duration-200 focus:outline-none"
                aria-label="Change Profile Photo"
              >
                <FaCamera className="text-sm sm:text-base " />
              </button>
            )}
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-base-content">
              {userDoc?.displayName || firebaseUser?.displayName || "User"}
            </h2>

            <div className="flex gap-6 mt-1 text-sm sm:text-base text-base-content/80">
            
              {/* Followers and Following modal */}
              <p>
                <span
                  className="font-medium cursor-pointer hover:underline"
                  onClick={fetchFollowers}
                >
                  Followers:
                </span>{" "}
                {followersCount}
              </p>
              <p>
                <span
                  className="font-medium cursor-pointer hover:underline"
                  onClick={fetchFollowing}
                >
                  Following:
                </span>{" "}
                {userDoc?.following?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {targetUid !== uid && (
            <button
              onClick={handleFollowToggle}
              className={`px-3 py-1 btn rounded-md font-semibold  ${
                isFollowing ? "bg-red-500 " : "bg-blue-500"
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

      {/* Sidebar + main content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="hidden lg:block md:col-span-6 lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-base-100 border border-base-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-center items-center gap-3 relative">
                  {/* new profile added */}

                  <div className="relative inline-block">
                    <img
                      src={userDoc?.photoURL || "/default-avatar.png"}
                      alt="avatar"
                      className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border-4 border-primary object-cover shadow-md transition-all duration-300"
                    />

                    {/* Camera Icon (Only Owner) */}
                    {isOwner && (
                      <button
                        onClick={() => setProfileModal(true)}
                        className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 md:bottom-3.5 md:right-3.5 lg:bottom-4 lg:right-4 
                   bg-primary text-white p-2 sm:p-2.5 rounded-full shadow-md 
                   flex justify-center items-center hover:scale-110 transition-transform duration-200 focus:outline-none"
                        aria-label="Change Profile Photo"
                      >
                        <FaCamera className="text-base sm:text-lg md:text-xl" />
                      </button>
                    )}
                  </div>

                </div>

                <div className="flex justify-between items-center my-3">
                  <div>
                    <div className="text-lg font-bold text-base-content">
                      {userDoc?.displayName ||
                        firebaseUser?.displayName ||
                        "User"}
                    </div>
                    <div className="text-sm text-base-content/60">
                      @{userDoc?.username || "username"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {targetUid !== uid ? (
                      <button
                        onClick={handleFollowToggle}
                        className={`  text-white btn px-4 py-2 rounded-md text-sm font-semibold ${
                          isFollowing ? "bg-red-500 btn-error" : "bg-blue-500"
                        }`}
                      >
                        {isFollowing ? " Unfollow" : " Follow"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 border border-base-200 rounded-lg text-sm"
                      >
                        Edit about
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-sm text-base-content/80">
                  <div className="flex items-center justify-between">
                
                    {/* Followers and Following modal */}
                    <p>
                      <span
                        className="font-medium cursor-pointer hover:underline"
                        onClick={fetchFollowers}
                      >
                        Followers:
                      </span>{" "}
                      {followersCount}
                    </p>
                    <p>
                      <span
                        className="font-medium cursor-pointer hover:underline"
                        onClick={fetchFollowing}
                      >
                        Following:
                      </span>{" "}
                      {userDoc?.following?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {["posts", "about"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full text-sm py-2 rounded-md mb-2 ${
                        activeTab === tab
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-base-100 hover:bg-base-200"
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-base-100 border border-base-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-base-content/60">Joined</div>
                <div className="text-sm font-semibold text-base-content">
                  {formatDate(userDoc?.createdAt)}
                </div>
              </div>
            </div>
          </aside>

          <main className="col-span-1 md:col-span-6 lg:col-span-8">
            {/* Mobile tab nav */}
            <div className="block lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {["posts", "about"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`whitespace-nowrap px-4 py-2 text-sm rounded-full border ${
                      activeTab === t
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-base-100 text-base-content/80 border-base-200"
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 mb-6">
              {/* POSTS */}
              {activeTab === "posts" && (
                <section className="bg-base-100 border border-base-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-base-content">
                      Posts
                    </h3>
                    <div className="text-sm text-base-content/60">
                      All posts by this user
                    </div>
                  </div>
                  <PostProfile targetUid={targetUid} refreshKey={refreshKey} />
                </section>
              )}

              {/* ABOUT */}
              {activeTab === "about" && (
                <section className="bg-base-100 border border-base-200 rounded-xl p-6 mb-6 shadow-sm">
                  {/* About content */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium mb-2"> Add Bio</p>
                      <p className="mt-3 text-sm text-gray-700 max-w-prose">
                        {userDoc?.bio || "No bio yet. Add a short intro."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Basic info card */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium mb-2">Basic info</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <div>
                          {/* <span className="font-medium ">Email:</span>{" "}  */}
                          {/* {userDoc?.email || firebaseUser?.email} */}
                        </div>
                        <div>
                          <span className="font-medium">Birthday / Age:</span>{" "}
                          {userDoc?.birthday
                            ? `${formatDate(userDoc.birthday)} (${Math.floor(
                                (Date.now() -
                                  new Date(userDoc.birthday).getTime()) /
                                  (1000 * 60 * 60 * 24 * 365)
                              )} yrs)`
                            : "—"}
                        </div>
                        <div>
                          <span className="font-medium">Languages:</span>{" "}
                          {(userDoc?.languages || []).join(", ") || "—"}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {userDoc?.location || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Work & education card */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium mb-2">Work & Education</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <div>
                          <span className="font-medium">Occupation:</span>{" "}
                          {userDoc?.occupation || "—"}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span>{" "}
                          {userDoc?.company || "—"}
                        </div>
                        <div>
                          <span className="font-medium">Education:</span>{" "}
                          {userDoc?.education || "—"}
                        </div>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="p-4 border border-gray-200 rounded-lg md:col-span-1">
                      <h4 className="font-medium mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {(userDoc?.skills || []).length > 0 ? (
                          userDoc!.skills!.map((s, i) => (
                            <span
                              key={i}
                              className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700"
                            >
                              #{s}
                            </span>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400">
                            No skills yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="p-4 border border-gray-200 rounded-lg md:col-span-1">
                      <h4 className="font-medium mb-2">Social links</h4>
                      <div className="flex flex-col text-sm text-blue-600">
                        {userDoc?.socialLinks?.website && (
                          <a
                            href={userDoc.socialLinks.website}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Website
                          </a>
                        )}
                        {userDoc?.socialLinks?.github && (
                          <a
                            href={userDoc.socialLinks.github}
                            target="_blank"
                            rel="noreferrer"
                          >
                            GitHub
                          </a>
                        )}
                        {userDoc?.socialLinks?.instagram && (
                          <a
                            href={userDoc.socialLinks.instagram}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Instagram
                          </a>
                        )}
                        {userDoc?.socialLinks?.linkedin && (
                          <a
                            href={userDoc.socialLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                          >
                            LinkedIn
                          </a>
                        )}
                        {!userDoc?.socialLinks && (
                          <div className="text-sm text-gray-400">
                            No links added
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Activity (full width) */}
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h4 className="font-medium mb-3">Activity</h4>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Joined:</span>{" "}
                        {formatDate(userDoc?.createdAt)}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-6 overflow-y-auto">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl mx-auto my-8 sm:my-10 p-4 sm:p-6 overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-base-content text-center sm:text-left">
              Edit About
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

              <input
                type="text"
                placeholder="Full name"
                value={formData.education}
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                className="input input-bordered w-full"
              />

              <input
                type="date"
                placeholder="Birthday"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                className="input input-bordered w-full"
              />

              <input
                type="text"
                placeholder="Languages (comma separated)"
                value={formData.languages}
                onChange={(e) =>
                  setFormData({ ...formData, languages: e.target.value })
                }
                className="input input-bordered w-full"
              />

              <input
                type="text"
                placeholder="Occupation"
                value={formData.occupation}
                onChange={(e) =>
                  setFormData({ ...formData, occupation: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                className="input input-bordered w-full"
              />

              <input
                type="text"
                placeholder="Skills (comma separated)"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
                className="input input-bordered w-full"
              />
              
              <input
                type="text"
                placeholder="GitHub link"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Instagram link"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="LinkedIn link"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="input input-bordered w-full"
              />

              <textarea
                placeholder="Short bio (2-3 lines)"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="textarea textarea-bordered w-full md:col-span-2"
                rows={3}
              ></textarea>

              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="input input-bordered w-full"
              />

              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="select select-bordered w-full"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <select
                value={formData.relationshipStatus}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    relationshipStatus: e.target.value,
                  })
                }
                className="select select-bordered w-full"
              >
                <option value="">Relationship status</option>
                <option value="single">Single</option>
                <option value="in_a_relationship">In a relationship</option>
                <option value="married">Married</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-base-100 pt-2">
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

      {/*  Followers Modal */}
      {showFollowers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Followers</h2>
            <ul className="max-h-80 overflow-y-auto space-y-2">
              {followersList.length > 0 ? (
                followersList.map((f) => (
                  <li
                    key={f.uid}
                    className="flex items-center gap-3 border-b light:border-gray-200 dark:border-gray-800 pb-2"
                  >
                    <img
                      src={f.photoURL || "/avatar-placeholder.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{f.displayName}</div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">No followers yet</p>
              )}
            </ul>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowFollowers(false)}
                className="btn btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Following Modal */}
      {showFollowing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Following</h2>
            <ul className="max-h-80 overflow-y-auto space-y-2">
              {followingList.length > 0 ? (
                followingList.map((f) => (
                  <li
                    key={f.uid}
                    className="flex items-center gap-3 border-b light:border-gray-200 dark:border-gray-800 pb-2"
                  >
                    <img
                      src={f.photoURL || "/avatar-placeholder.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium">{f.displayName}</div>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Not following anyone yet
                </p>
              )}
            </ul>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowFollowing(false)}
                className="btn btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile modal  */}

      {/* Modal */}
      {profileModal && isOwner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-6">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md mx-auto my-8 p-5 sm:p-6 relative overflow-hidden">
            <h2 className="text-lg sm:text-xl font-semibold text-center mb-4">
              Change Profile Picture
            </h2>

            {/* Change Profile Component */}
            <ChangeProfileImage
              userDoc={userDoc as unknown as UserDocument}
              setUserDoc={(updatedDoc) => {
          // update user document normally
          (
            setUserDoc as React.Dispatch<
              React.SetStateAction<UserDocument | null>
            >
          )(updatedDoc);

          // Trigger refresh so PostProfile refetches posts with new photo
          setRefreshKey((prev) => prev + 1);
        }}
            />

            {/* Buttons */}
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setProfileModal(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
