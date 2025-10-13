import { useEffect, useState, useContext } from "react";
import PostCard from "./PostCard";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import Loading from "../Loading";

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
};

type Props = {
  refreshKey?: number;
  targetUid?: string;
};

const PostProfile = ({ refreshKey = 0, targetUid }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const { user } = authContext!;

  // Get current user id from context
  const currentUserId = user?.uid || "";

  // Determine which user's posts to show
  const profileUid = targetUid || user?.uid;

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPosts = async () => {
      if (!profileUid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use the new endpoint with privacy filtering
        const res = await fetch(
          `http://localhost:3000/users/${profileUid}/posts?viewerUid=${currentUserId}`,
          {
            signal: controller.signal,
          }
        );
        
        if (!res.ok) throw new Error(`Failed to load posts: ${res.status}`);
        
        const data = await res.json();
        if (mounted) setPosts(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching profile posts:", err);
          if (mounted) setError("Failed to load posts");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [refreshKey, profileUid, currentUserId]); // Re-run when any of these change

  // Debug logs (remove in production)
  console.log("Profile UID:", profileUid);
  console.log("Current User ID:", currentUserId);
  console.log("Posts:", posts);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-6">{error}</div>;
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-6 p-4">
        <p>No posts yet.</p>
        {profileUid === currentUserId && (
          <p className="text-sm mt-2">Create your first post to get started!</p>
        )}
      </div>
    );
  }

  const handleDeletePost = (deletedId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== deletedId));
  };

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          onDelete={handleDeletePost}
        />
      ))}
    </div>
  );
};

export default PostProfile;