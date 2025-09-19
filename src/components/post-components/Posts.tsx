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
<<<<<<< HEAD
  const [posts, setPosts] = useState<Post[]>([]);
  const authContext = useContext(AuthContext);
=======
  const [posts, setPosts] = useState<Post[]>([])
>>>>>>> 667571e7b77a06b2785ea8f1c707690d8cde8ae4

  // Get current user id from context
  const currentUserId = authContext?.user?.uid ?? "";

  useEffect(() => {
    fetch("http://localhost:3000/socialPost")
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