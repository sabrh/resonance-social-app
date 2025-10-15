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

  // tab state
  const [activeTab, setActiveTab] = useState("posts");

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
        const res = await axios.get(`https://resonance-social-server.vercel.app/users/${targetUid}`);
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
      await axios.post(`https://resonance-social-server.vercel.app/users/${uid}/banner`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // refresh user data
      const res = await axios.get(`https://resonance-social-server.vercel.app/users/${uid}`);
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
      await axios.put(`https://resonance-social-server.vercel.app/users/${uid}/details`, payload);
      const res = await axios.get(`https://resonance-social-server.vercel.app/users/${uid}`);
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
        const res = await axios.get(`https://resonance-social-server.vercel.app/users/${targetUid}`);
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

  return (
    <div className="mx-auto bg-white shadow rounded-lg overflow-hidden">
      {/* Banner */}
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

        {/*  Only show upload/change buttons if this is the user's own profile */}
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
      <div className="p-4 mt-8 border-b-2 border-[#f0f0f0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 lg:hidden">
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

      {/* ---------------- Profile nav + full-width tab content ---------------- */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ---------- Left: Sidebar (sticky on desktop, hidden on small) ---------- */}
          <aside className="hidden lg:block md:col-span-6 lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                {/* desktop User profile, name, username */}
                <div className="flex justify-center items-center gap-3">
                  <img
                    src={
                      userDoc?.photoURL ||
                      firebaseUser?.photoURL ||
                      "/avatar-placeholder.png"
                    }
                    alt="avatar"
                    className="w-34 h-34 rounded-full object-cover border-2 border-white shadow"
                  />
                </div>

                <div className="flex justify-between items-center my-3">
                  <div>
                    <div className="text-lg font-bold text-gray-800">
                      {userDoc?.displayName ||
                        firebaseUser?.displayName ||
                        "User"}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{userDoc?.username || "username"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {targetUid !== uid ? (
                      <button
                        onClick={handleFollowToggle}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          isFollowing
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 border rounded-full text-sm"
                      >
                        Edit about
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{followersCount}</span>
                      <div className="text-xs text-gray-400">Followers</div>
                    </div>
                    <div>
                      <span className="font-medium">
                        {userDoc?.following?.length || 0}
                      </span>
                      <div className="text-xs text-gray-400">Following</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`w-full text-sm py-2 rounded-md mb-2 ${
                      activeTab === "posts"
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setActiveTab("about")}
                    className={`w-full text-sm py-2 rounded-md mb-2 ${
                      activeTab === "about"
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    About
                  </button>
                </div>
              </div>

              {/* Small info card */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="text-xs text-gray-500">Joined</div>
                <div className="text-sm font-semibold text-gray-800">
                  {formatDate(userDoc?.createdAt)}
                </div>
              </div>
            </div>
          </aside>

          {/* ---------- Main content (takes full width on desktop) ---------- */}
          <main className="col-span-1 md:col-span-6 lg:col-span-8">
            {/* Mobile tab nav (visible on small screens) */}
            <div className="block lg:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {["posts", "about"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`whitespace-nowrap px-4 py-2 text-sm rounded-full border ${
                      activeTab === t
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-white text-gray-700 border-gray-100"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Active tab content: each card is full width in this main area */}
            <div className="space-y-6 mb-6">
              {/* POSTS */}
              {activeTab === "posts" && (
                <section className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Posts</h3>
                    <div className="text-sm text-gray-500">
                      All posts by this user
                    </div>
                  </div>
                  <PostProfile targetUid={targetUid} />
                </section>
              )}

              {/* ABOUT */}
              {activeTab === "about" && (
                <section className="bg-white border border-gray-100 rounded-xl p-6 mb-6 shadow-sm">
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
                          <span className="font-medium">Email:</span>{" "}
                          {userDoc?.email || firebaseUser?.email}
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
      {/* ---------------- END: Profile nav + content ---------------- */}

      {/* Modal for editing about */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000a9] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Edit About</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Full name"
                value={formData.education}
                onChange={(e) =>
                  setFormData({ ...formData, education: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
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
    </div>
  );
};

export default UserProfile;
