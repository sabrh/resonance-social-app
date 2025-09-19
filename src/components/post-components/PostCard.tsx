import { useState } from "react";

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
  likes?: string[]; // userIds
  comments?: Comment[];
};

type Props = {
  post: Post;
  currentUserId: string;
};

const PostCard = ({ post, currentUserId }: Props) => {
  const [liked, setLiked] = useState(
    post.likes?.includes(currentUserId) ?? false
  );
  const [likesCount, setLikesCount] = useState(post.likes?.length ?? 0);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [newComment, setNewComment] = useState("");

  // Like/Unlike handler
  const handleLike = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/socialPost/${post._id}/like`,
        {
          method: "PUT", //  PUT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUserId }), // body হিসেবে userId পাঠাতে হবে
        }
      );
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  // Add comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `http://localhost:3000/socialPost/${post._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({ userId: currentUserId, text: newComment }), // add userId
        }
      );

      const data = await res.json();
      console.log(data);
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  // Image rendering fix
  let imageSrc: string | undefined;
  if (post.image) {
    if (post.image.startsWith("data:")) {
      imageSrc = post.image;
    } else if (post.mimetype) {
      imageSrc = `data:${post.mimetype};base64,${post.image}`;
    }
  }

  return (
    <div className="p-4 border rounded-md shadow mt-6">
      <p>{post.text}</p>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={post.filename}
          className="max-w-full max-h-[400px] object-cover mt-4 rounded"
        />
      )}

      {/* Like Section */}
      <div className="flex gap-4 mt-4">
        <button
          onClick={handleLike}
          aria-pressed={liked}
          className={`px-3 py-1 rounded ${
            liked ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {liked ? "Unlike" : "Like"} ({likesCount})
        </button>
      </div>

      {/* Comment Section */}
      <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-green-600 text-white rounded"
          disabled={!newComment.trim()}
        >
          Comment
        </button>
      </form>

      {/* Show comments */}
      <div className="mt-4">
        {comments?.filter(Boolean).map((c) => (
          <div key={c._id} className="mb-2 border-b pb-2">
            <p className="font-semibold">{c.authorName ?? "Unknown"}</p>
            <p>{c.text ?? ""}</p>
            <p className="text-xs text-gray-500">
              {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostCard;
