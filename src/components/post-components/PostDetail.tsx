import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router";
import Loading from "../Loading";
import PostCard from "./PostCard";
import { AuthContext } from "../../context/AuthContext/AuthContext";

type Comment = {
  _id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type Post = {
  _id: string;
  userId: string;
  text: string;
  image?: string;
  privacy: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  comments?: Comment[];
  userName: string;
  userPhoto: string;
  createdAt: string;
  userEmail: string;
  shared: string;
  sharedUserName: string;
  sharedUserPhoto: string;
  sharedUserText: string;
  sharedUserId: string;
};

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Safe context access
  const authContext = useContext(AuthContext);
  const user = authContext?.user;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:3000/socialPost/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");

        const postData = await res.json();
        setPost(postData);
      } catch (err) {
        console.error("Failed to fetch post:", err);
        setError("Post not found");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen mt-16">
        <Loading />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto p-4 mt-16">
        <Link to="/notifications" className="text-blue-500 mb-4 inline-block">
          ← Back to Notifications
        </Link>
        <div className="text-center text-red-500 py-8">
          {error || "Post not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 mt-16">
      <Link
        to="/notifications"
        className="text-blue-500 hover:underline mb-6 inline-block"
      >
        ← Back to Notifications
      </Link>
      <PostCard post={post} currentUserId={user?.uid || ""} />
    </div>
  );
};

export default PostDetail;
