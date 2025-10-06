import { useEffect, useState, useContext } from "react";
import PostCard from "./PostCard";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import Loading from "../Loading";
import type { Post } from "../../types/post";
// import type { Post } from "../../types/Post";

type Props = {
  refreshKey?: number;
};

const Posts = ({ refreshKey = 0 }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  const currentUserId = authContext?.user?.uid ?? "";

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:3000/socialPost", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const data = await res.json();
        if (mounted) setPosts(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
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
  }, [refreshKey]);

  if (loading) return <Loading />;
  if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;
  if (posts.length === 0) return <p className="text-gray-500 mt-6">No posts yet.</p>;

  return (
    <div>
      {posts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          currentUserId={currentUserId}
          onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
        />
      ))}
    </div>
  );
};

export default Posts;
