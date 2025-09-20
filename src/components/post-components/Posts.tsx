import { useEffect, useState, useContext } from "react";
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
  text: string;
  image?: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  comments?: Comment[];
};

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const authContext = useContext(AuthContext);

  // Get current user id from context
  const currentUserId = authContext?.user?.uid ?? "";

  useEffect(() => {
    fetch("https://resonance-social-server.vercel.app/socialPost")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post._id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  );
};

export default Posts;