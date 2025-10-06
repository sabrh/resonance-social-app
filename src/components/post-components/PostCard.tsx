import { useContext, useState } from "react";
import { FaHeart, FaRegHeart, FaRegCommentDots, FaShare } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import type { Post, Comment } from "../../types/post";

type Props = {
  post: Post;
  currentUserId: string;
  onDelete?: (id: string) => void; // optional
};

const PostCard = ({ post, currentUserId, onDelete }: Props) => {
  const { user } = useContext(AuthContext)!;

  // Safety defaults
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId) ?? false);
  const [likesCount, setLikesCount] = useState(post.likes?.length ?? 0);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [sharesCount, setSharesCount] = useState(post.shares?.length ?? 0);
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);

  // 🔹 Like/Unlike
  const handleLike = async () => {
    try {
      const res = await fetch(`http://localhost:3000/socialPost/${post._id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userName: user?.displayName,
          userPhoto: user?.photoURL
        })
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Add comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:3000/socialPost/${post._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userName: user?.displayName,
          userPhoto: user?.photoURL,
          text: newComment
        })
      });
      const data = await res.json();
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Share
  const handleShare = async () => {
    try {
      const res = await fetch(`http://localhost:3000/socialPost/${post._id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userName: user?.displayName,
          userPhoto: user?.photoURL
        })
      });
      const data = await res.json();
      toast.success("Post shared!");
      setSharesCount(data.sharesCount);
    } catch (err) {
      console.error(err);
      toast.error("Failed to share post");
    }
  };

  // Image handling
  let imageSrc: string | undefined;
  if (post.image) {
    imageSrc = post.mimetype ? `data:${post.mimetype};base64,${post.image}` : post.image;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 max-w-2xl mx-auto mt-6">
      {/* Post Header */}
      <div className="flex items-center gap-3">
        <img src={post.userPhoto} className="h-14 w-14 rounded-full" alt="User" />
        <div>
          <p className="font-bold text-blue-500">{post.userName}</p>
          <p className="text-gray-500 text-sm">{new Date(post.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Post Body */}
      <p className="mt-4">{post.text}</p>
      {imageSrc && (
        <img src={imageSrc} alt={post.filename} className="max-w-full max-h-96 rounded mt-2" />
      )}

      {/* Like / Comment / Share */}
      <div className="flex gap-6 items-center mt-4 text-xl">
        <button onClick={handleLike} className="flex items-center gap-1">
          {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          <span>{likesCount}</span>
        </button>
        <button onClick={() => setOpenComments(true)} className="flex items-center gap-1">
          <FaRegCommentDots />
          <span>{comments.length}</span>
        </button>
        <button onClick={handleShare} className="flex items-center gap-1">
          <FaShare />
          <span>{sharesCount}</span>
        </button>
      </div>

      {/* Comments Modal */}
      {openComments && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white max-w-md w-full rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Comments</h2>
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="border p-2 flex-1 rounded"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-green-600 text-white rounded"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>

            <div className="max-h-64 overflow-y-auto">
              {comments.map((c) => (
                <div key={c._id} className="mb-3 border-b pb-2">
                  <p className="font-semibold">{c.authorName}</p>
                  <p>{c.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setOpenComments(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
