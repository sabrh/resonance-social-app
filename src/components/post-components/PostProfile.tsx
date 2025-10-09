// src/components/PostProfile.tsx
import { useEffect, useState, useContext } from "react";
import PostCard from "./PostCard";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import Loading from "../Loading";
import type { Post } from "../../types/post"; // ✅ Comment import সরানো হয়েছে

type Props = {
  refreshKey?: number;
};

const PostProfile = ({ refreshKey = 0 }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useContext(AuthContext)!;
  const currentUserId = user?.uid ?? "";

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

        // ✅ Normalize posts & nested comments
        const normalizedData: Post[] = data.map((p: any) => ({
          ...p,
          userId: p.userId ?? p._id ?? "",
          comments:
            p.comments?.map((c: any) => ({
              _id: c._id ?? "",
              authorId: c.authorId ?? "",
              authorName: c.authorName ?? "Unknown",
              authorPhoto: c.authorPhoto ?? "",
              text: c.text ?? "",
              createdAt: c.createdAt ?? new Date().toISOString(),
              replies: c.replies ?? [],
            })) ?? [],
        }));

        if (mounted) setPosts(normalizedData);
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

  // 🌀 UI States
  if (loading) return <Loading />;
  if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;
  if (posts.length === 0) return <p className="text-gray-500 mt-6">No posts yet.</p>;

  // ✅ Filter user-specific posts
  const matchPost = posts.filter((post) => post.userEmail === user?.email);

  return (
    <div>
      {matchPost.map((post) => (
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

export default PostProfile;
