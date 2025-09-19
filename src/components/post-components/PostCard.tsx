import { useState } from "react";
import { FaHeart, FaRegHeart, FaRegCommentDots } from "react-icons/fa";

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
  const [openComments, setOpenComments] = useState(false);

  // Like/Unlike handler
  const handleLike = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/socialPost/${post._id}/like`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: currentUserId }),
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
          body: JSON.stringify({ userId: currentUserId, text: newComment }),
        }
      );

      const data = await res.json();
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

      {/* Like + Comment Section */}
      <div className="flex gap-6 items-center mt-4 text-xl">
        <button onClick={handleLike} className="flex items-center gap-1">
          {liked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-500" />
          )}
          <span className="text-sm">{likesCount}</span>
        </button>

        <button
          onClick={() => setOpenComments(true)}
          className="flex items-center gap-1"
        >
          <FaRegCommentDots className="text-gray-600" />
          <span className="text-sm">{comments.length}</span>
        </button>
      </div>

      {/* Comment Modal */}
      {openComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Comments</h2>

            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
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
                Post
              </button>
            </form>

            <div className="max-h-64 overflow-y-auto">
              {comments?.map((c) => (
                <div key={c._id} className="mb-3 border-b pb-2">
                  <p className="font-semibold">{c.authorName ?? "Unknown"}</p>
                  <p>{c.text ?? ""}</p>
                  <p className="text-xs text-gray-500">
                    {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
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
