import { useEffect, useState } from "react";

type Post = {
  _id: string;
  text: string;
  image?: string;      // base64-encoded image data
  mimetype?: string;   // e.g. "image/png"
  filename?: string;   // optional filename
};

const Posts = () => {
  const [posts, setPosts] = useState<Post[]>([])



  useEffect(() => {
    fetch("http://localhost:3000/socialPost")
      .then((res) => res.json())
      .then((data) => {
        console.log(data); // array of posts
        setPosts(data); // store in state if needed
      })
      .catch((err) => console.error(err));
  }, []);
  return (
    <div >
      {posts.map((post) => (
        <div key={post._id} className="mt-8">
          <p>{post.text}</p>
          {post.image && (
            <img
              src={`data:${post.mimetype};base64,${post.image}`}
              alt={post.filename}
              className="w-[500px] h-[600px] object-cover mt-4"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Posts;
