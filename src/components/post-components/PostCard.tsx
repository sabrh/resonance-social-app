// src/components/PostCard.tsx - সম্পূর্ণ আপডেটেড
import { useContext, useState } from "react";
import { FaHeart, FaRegHeart, FaRegCommentDots, FaShare } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import type { Post, Comment } from "../../types/post";

type Props = {
  post: Post;
  currentUserId: string;
  onDelete?: (id: string) => void;
};

const PostCard = ({ post, currentUserId, onDelete }: Props) => {
  const { user } = useContext(AuthContext)!;

  // Safety defaults
  const userReaction = post.reactions?.[currentUserId];
  const [liked, setLiked] = useState(!!userReaction);
  const [currentReaction, setCurrentReaction] = useState(userReaction?.type || 'like');
  const [likesCount, setLikesCount] = useState(Object.keys(post.reactions || {}).length);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [sharesCount, setSharesCount] = useState(post.shares?.length ?? 0);
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // ✅ অ্যাডভান্সড লাইক/রিয়্যাক্ট ফাংশন
  const handleReaction = async (reactionType: string = 'like') => {
    try {
      const res = await fetch(`http://localhost:3000/socialPost/${post._id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          userName: user?.displayName,
          userPhoto: user?.photoURL,
          reactionType: reactionType
        })
      });
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likesCount);
      setCurrentReaction(data.reactionType);
      setShowReactions(false);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ রিয়্যাক্ট আইকন
  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  };

  // ✅ কারেন্ট ইউজারের রিয়্যাক্ট আইকন
  const getCurrentReactionIcon = () => {
    if (!liked) return <FaRegHeart />;
    switch (currentReaction) {
      case 'love': return <FaHeart className="text-red-500" />;
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return <FaHeart className="text-red-500" />;
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

      {/* ✅ রিয়্যাক্টস ডিসপ্লে - যারা রিয়্যাক্ট করেছে */}
      {post.reactions && Object.keys(post.reactions).length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {Object.values(post.reactions)
                .slice(0, 3)
                .map((reaction: any, index) => (
                  <span key={index} className="text-sm -ml-1 first:ml-0">
                    {getReactionIcon(reaction.type)}
                  </span>
                ))
              }
            </div>
            <span className="text-sm text-gray-600">
              {Object.keys(post.reactions).length} reactions
            </span>
          </div>

          {/* রিয়্যাক্ট ডিটেইলস */}
          <div className="text-xs text-gray-500">
            {Object.entries(post.reactions)
              .slice(0, 5)
              .map(([userId, reaction]: [string, any]) => (
                <span key={userId}>
                  <strong>{reaction.userName}</strong> {reaction.type}
                  {', '}
                </span>
              ))
            }
            {Object.keys(post.reactions).length > 5 &&
              `and ${Object.keys(post.reactions).length - 5} more`}
          </div>
        </div>
      )}

      {/* ✅ ইম্প্রুভড লাইক/কমেন্ট/শেয়ার সেকশন */}
      <div className="flex gap-6 items-center mt-4 text-xl relative">
        {/* রিয়্যাক্ট বাটন */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
            onClick={() => handleReaction(currentReaction)}
            className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {getCurrentReactionIcon()}
            <span>{likesCount}</span>
          </button>

          {/* রিয়্যাক্ট পপ오ভার */}
          {showReactions && (
            <div
              className="absolute bottom-full mb-2 bg-white shadow-lg rounded-full p-2 flex gap-2 border z-10"
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
            >
              {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => handleReaction(reaction)}
                  className="text-2xl transform hover:scale-125 transition-transform duration-200"
                  title={reaction}
                >
                  {getReactionIcon(reaction)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* কমেন্ট বাটন */}
        <button
          onClick={() => setOpenComments(true)}
          className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaRegCommentDots />
          <span>{comments.length}</span>
        </button>

        {/* শেয়ার বাটন */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaShare />
          <span>{sharesCount}</span>
        </button>
      </div>

      {/* Delete Button
      {onDelete && (
        <button
          onClick={() => onDelete(post._id)}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      )} */}

      {/* Comments Modal */}
      {openComments && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white max-w-md w-full rounded-lg p-4 max-h-[90vh] overflow-hidden flex flex-col">
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
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </form>

            <div className="flex-1 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center">No comments yet</p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="mb-3 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={c.authorPhoto}
                        alt={c.authorName}
                        className="w-6 h-6 rounded-full"
                      />
                      <p className="font-semibold">{c.authorName}</p>
                    </div>
                    <p className="mt-1">{c.text}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setOpenComments(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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