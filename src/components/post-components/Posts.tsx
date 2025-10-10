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
  text: string;
  userId: string;
  userEmail: string;
  privacy: string;
  image?: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  comments?: Comment[];
  userName: string;
  userPhoto: string;
  createdAt: string;
  shared: string;
  sharedUserName: string;
  sharedUserPhoto: string;
  sharedUserText: string;
  sharedUserId: string;
};

type Props = {
  refreshKey?: number; //  when this changes Posts re-fetches
};

const Posts = ({ refreshKey = 0 }: Props) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  // Get current user id from context
  const currentUserId = authContext?.user?.uid ?? "";

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true); // start loading before fetch
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
        if (mounted) setLoading(false); // stop loading after fetch finishes
      }
    };

    fetchPosts();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [refreshKey]); // Re run when refreshKey toggles

  if (loading) {
    // show loader while posts fetch
    return <Loading />;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-6">{error}</div>;
  }


  const matchPost = posts.filter(post => post?.privacy === "public");

  console.log(posts);

  if (matchPost.length === 0) {
    return <p className="text-gray-500 mt-6">No posts yet.</p>;
  }



  return (
    <div>
      {matchPost.map((post) => (
        <PostCard key={post._id} post={post} currentUserId={currentUserId} onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))} />
      ))}
    </div>
  );
};

export default Posts;
