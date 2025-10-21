import { useContext, useEffect, useState } from "react";
import { FaRegCommentDots, FaShare } from "react-icons/fa";
import { IoSend } from "react-icons/io5";

import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import { BsThreeDotsVertical } from "react-icons/bs";
import ReplyItem from "./comments/ReplyItem";
import { Link } from "react-router";
import ShareBox from "./ShareBox";

export type Comment = {
  _id: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
  parentUser?: string;
  authorPhoto?: string;
  replies?: Comment[];
};

type LikeUser = {
  uid: string;
  displayName: string;
  photoURL?: string;
  type?: string;
};

type Post = {
  _id: string;
  userId: string;
  text: string;
  userEmail: string;
  privacy: string;
  image?: string;
  mimetype?: string;
  reactions?: { userId: string; type: string }[];
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
  post: Post;
  currentUserId: string;
  onDelete?: (id: string) => void;
};

const PostCard = ({ post, currentUserId, onDelete }: Props) => {
  const [info, setInfo] = useState(false);

  // const [sharedPost, setSharedPost] = useState<Post["sharedPost"]>(
  //   post.sharedPost
  // );

  const [share, setShare] = useState<boolean>(false);
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const { user } = useContext(AuthContext)!;
  const [openLikes, setOpenLikes] = useState(false);
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [likesCount, setLikesCount] = useState(post.likes?.length ?? 0);
  // Picker open/close logic
  const handlePickerButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPicker((prev) => !prev);
  };
  useEffect(() => {
    setLikesCount(post.reactions ? post.reactions.length : 0);
    setUserReaction(
      post.reactions?.find((r) => r.userId === currentUserId)?.type || null
    );
  }, [post.reactions, post._id, currentUserId]);
  const reactionTypes = [
    { type: "like", emoji: "👍" },
    { type: "love", emoji: "❤️" },
    { type: "haha", emoji: "😂" },
    { type: "sad", emoji: "😢" },
  ];

  const [userReaction, setUserReaction] = useState(
    post.reactions?.find((r) => r.userId === currentUserId)?.type || null
  );
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const picker = document.getElementById(`picker-${post._id}`);
      if (picker && !picker.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPicker, post._id]);

  // Close picker when clicking outside

  const handleReaction = async (type: string) => {
    const newType = userReaction === type ? null : type;

    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/react`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            reactionType: newType,
            senderName: user?.displayName,
            senderPhoto: user?.photoURL,
          }),
        }
      );

      const data = await res.json();

      setUserReaction(data.userReaction || null);
      setLikeUsers(data.reactions || []);
      setLikesCount(data.reactions?.length || 0);
    } catch (err) {
      console.error("Reaction error:", err);
    }
  };

  const handleViewReactions = async () => {
    if (likeUsers.length > 0 && openLikes) return;
    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/reactions`
      );
      const data = await res.json();
      setLikeUsers(data);
      setOpenLikes(true);
    } catch (err) {
      console.error("Error fetching reactions:", err);
    }
  };

  const countTotalComments = (comments: Comment[]): number => {
    return comments.reduce((acc, c) => {
      const repliesCount = c.replies ? countTotalComments(c.replies) : 0;
      return acc + 1 + repliesCount;
    }, 0);
  };

  // Add comment - UPDATED WITH NOTIFICATION
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUserId}`,
          },
          body: JSON.stringify({
            userId: currentUserId,
            text: newComment,
            authorPhoto: user?.photoURL,
            authorEmail: user?.email,
            userName: user?.displayName,
            senderId: currentUserId, // Add for notification
          }),
        }
      );

      const data = await res.json();
      setComments([data.comment, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    const comment = comments.find((c) => c._id === commentId);
    if (!comment) return;

    const newText = prompt("Edit your comment:", comment.text);
    if (!newText || newText.trim() === "") return;

    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/comment/${commentId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText, userEmail: user?.email }),
        }
      );

      if (!res.ok) throw new Error("Failed to edit comment");

      // Update local state
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, text: newText } : c))
      );

      toast.success("Comment updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to edit comment");
    }
  };

  const handleAddReply = async (
    commentId: string,
    text: string,
    parentReplyId?: string
  ) => {
    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            commentId,
            parentReplyId,
            authorName: user?.displayName,
            authorEmail: user?.email,
            authorPhoto: user?.photoURL,
            text,
            senderId: currentUserId, // Add for notification
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to add reply");

      const data = await res.json();

      // Update local state
      setComments((prevComments) =>
        prevComments.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replies: parentReplyId
                  ? addNestedReplyState(
                      c.replies || [],
                      parentReplyId,
                      data.reply
                    )
                  : [...(c.replies || []), data.reply],
              }
            : c
        )
      );

      // Clear reply text
      setReplyTexts((prev) => ({
        ...prev,
        [commentId]: "",
      }));
      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add reply");
    }
  };

  // Recursive update for frontend state
  const addNestedReplyState = (
    replies: Comment[],
    parentId: string,
    newReply: Comment
  ): Comment[] => {
    return replies.map((r) =>
      r._id === parentId
        ? { ...r, replies: [...(r.replies || []), newReply] }
        : {
            ...r,
            replies: addNestedReplyState(r.replies || [], parentId, newReply),
          }
    );
  };

  const handleEditReply = async (commentId: string, replyId: string) => {
    // Find the reply text from state
    const comment = comments.find((c) => c._id === commentId);
    if (!comment) return;

    // Prompt user for new text
    const reply = findNestedReply(comment.replies || [], replyId);
    if (!reply) return;

    const newText = prompt("Edit your reply:", reply.text);
    if (!newText || newText.trim() === "") return;

    try {
      // Backend request
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/replies/${replyId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: newText,
            authorEmail: user?.email,
            authorPhoto: user?.photoURL,
            authorName: user?.displayName,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to edit reply");

      // Frontend state update (recursive)
      setComments((prevComments) =>
        prevComments.map((c) =>
          c._id === commentId
            ? {
                ...c,
                replies: updateNestedReplyText(
                  c.replies || [],
                  replyId,
                  newText
                ),
              }
            : c
        )
      );

      toast.success("Reply updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to edit reply");
    }
  };

  // Recursive function to find a nested reply by ID
  const findNestedReply = (
    replies: Comment[],
    replyId: string
  ): Comment | null => {
    for (const r of replies) {
      if (r._id === replyId) return r;
      if (r.replies && r.replies.length > 0) {
        const found = findNestedReply(r.replies, replyId);
        if (found) return found;
      }
    }
    return null;
  };

  // Recursive function to update nested reply text
  const updateNestedReplyText = (
    replies: Comment[],
    replyId: string,
    newText: string
  ): Comment[] => {
    return replies.map((r) => {
      if (r._id === replyId) {
        return { ...r, text: newText };
      }
      if (r.replies && r.replies.length > 0) {
        return {
          ...r,
          replies: updateNestedReplyText(r.replies, replyId, newText),
        };
      }
      return r;
    });
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    try {
      // Send DELETE request to backend
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/replies/${replyId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Failed to delete reply");

      // Update local state recursively
      setComments((prevComments) =>
        prevComments.map((c) =>
          c._id === commentId
            ? { ...c, replies: removeNestedReply(c.replies || [], replyId) }
            : c
        )
      );

      toast.success("Reply deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete reply");
    }
  };

  // Recursive function to remove nested reply in frontend state
  const removeNestedReply = (
    replies: Comment[],
    replyId: string
  ): Comment[] => {
    return replies
      .filter((r) => r._id !== replyId)
      .map((r) => ({
        ...r,
        replies: r.replies ? removeNestedReply(r.replies, replyId) : [],
      }));
  };

  const handleDeleteComment = async (
    commentId: string,
    authorEmail?: string
  ) => {
    if (!authorEmail) {
      toast.error("Invalid comment author!");
      return;
    }

    // ✅ Custom confirmation using toast.promise
    const confirm = await new Promise<boolean>((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-2">
            <p>Are you sure you want to delete this comment?</p>
            <div className="flex gap-2 justify-end">
              <button
                className="bg-gray-300 px-2 py-1 rounded"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirm) return; // user cancelled

    // 🔹 Delete logic
    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/comment/${commentId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userEmail: user?.email }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete comment");

      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  const handleShare = async () => {
    setShare(true);
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

  // Delete post confirmation
  const confirmDelete = () => {
    toast.custom((t) => (
      <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col gap-3">
        <p className="text-lg font-semibold">Are you sure?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                const res = await fetch(
                  `https://resonance-social-server.vercel.app/socialPost/${post._id}`,
                  { method: "DELETE" }
                );

                if (res.ok) {
                  onDelete?.(post._id);
                  toast.dismiss(t.id);
                  toast.success("Post deleted successfully!");
                }
              } catch (err) {
                console.error(err);
                toast.error("Failed to delete post");
              }
            }}
            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  return (
    <div className="bg-base-100 shadow rounded-xl p-2 md:p-4 max-w-full md:max-w-2xl mx-auto mt-4 md:mt-6">
      {/* Info dropdown */}
      <div
        className={`float-right relative ${
          post?.userEmail === user?.email ? "" : "hidden"
        }`}
      >
        <p onClick={() => setInfo(!info)} className="text-xl cursor-pointer">
          <BsThreeDotsVertical />
        </p>
        <div
          className={`absolute top-10 right-4 h-[100px] w-[150px] bg-base-200 shadow-lg rounded-2xl ${
            info ? "" : "hidden"
          }`}
        >
          <p className="flex gap-2 items-center mt-4 cursor-pointer hover:bg-base-300 px-4 py-1 rounded-lg">
            <i className="fa-solid fa-pen-to-square"></i>
            <span>Edit post</span>
          </p>
          <p
            onClick={confirmDelete}
            className="flex gap-2 items-center mt-4 cursor-pointer hover:bg-base-300 px-4 py-1 rounded-lg"
          >
            <i className="fa-solid fa-trash"></i>
            <span>Delete post</span>
          </p>
        </div>
      </div>

      {/* Post header */}
      <div className="mt-3 flex items-center gap-3">
        <Link to={`/profile/${post.userId}`}>
          <img
            className="h-[45px] w-[45px] rounded-full cursor-pointer object-cover"
            src={post?.userPhoto}
            alt="User"
          />
        </Link>
        <div>
          <Link
            to={`/profile/${post.userId}`}
            className="text-lg md:text-[14px] text-primary font-semibold hover:underline"
          >
            {post?.userName}
          </Link>

          <div className="flex gap-x-4 mt-1 text-sm text-base-content/60 rounded-xl w-fit">
            <p>{post.createdAt}</p>
            {post.privacy === "public" ? (
              <div className="flex gap-1 items-center">
                <i className="fa-solid fa-earth-americas"></i>
                <span>Public</span>
              </div>
            ) : (
              <div className="flex gap-1 items-center">
                <i className="fa-solid fa-lock"></i>
                <span>Private</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post body */}
      <p className="md:ml-3 py-3 md:text-sm text-base-content">{post.text}</p>

      {/* Post image or shared post */}
      {post.shared === "yes" ? (
        <div className="bg-base-200 p-5 rounded-2xl mt-4">
          <div className="flex items-center gap-3 mb-3">
            <Link to={`/profile/${post.sharedUserId}`}>
              <img
                className="h-[50px] w-[50px] rounded-full cursor-pointer object-cover"
                src={post?.sharedUserPhoto}
                alt={post?.sharedUserName || "User"}
              />
            </Link>
            <Link
              to={`/profile/${post.sharedUserId}`}
              className="text-base text-primary font-semibold hover:underline"
            >
              {post?.sharedUserName || "Unknown User"}
            </Link>
          </div>

          {imageSrc && (
            <div className="flex justify-center bg-base-100 mb-3 rounded-lg overflow-hidden shadow-md">
              <img
                src={imageSrc}
                alt={post.filename}
                className="w-full h-auto max-h-[300px] md:max-h-[450px] object-cover"
              />
            </div>
          )}
        </div>
      ) : (
        imageSrc && (
          <div className="flex justify-center bg-base-100 mb-3 rounded-lg overflow-hidden shadow-md">
            <img
              src={imageSrc}
              alt={post.filename}
              className="w-full h-auto max-h-[300px] md:max-h-[450px] object-cover"
            />
          </div>
        )
      )}

      {/* Like + Comment + Share counts */}
      <div className="flex flex-wrap justify-between items-center py-2 px-2 border-b border-base-300 text-sm gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base-content">{likesCount}</span>
          <button
            onClick={handleViewReactions}
            className="text-primary hover:underline"
          >
            See likes
          </button>
        </div>
        <div className="flex items-center gap-4 text-base-content/60">
          <span className="flex items-center gap-1">
            <FaRegCommentDots className="text-lg" />
            {comments?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <FaShare className="text-lg" />0
          </span>
        </div>
      </div>

      {/* Actions: Like/Comment/Share */}
      <div className="flex justify-between items-center mt-0 px-0 gap-1">
        {/* Like */}
        <div
          className="flex-1 flex justify-center relative"
          id={`picker-${post._id}`}
        >
          <button
            onClick={handlePickerButtonClick}
            className="flex items-center gap-2 py-2 px-2 md:px-6 rounded-lg hover:bg-base-300 w-full justify-center transition"
          >
            <span className="text-2xl">
              {userReaction
                ? reactionTypes.find((r) => r.type === userReaction)?.emoji
                : "👍"}
            </span>
            <span className="font-semibold capitalize">
              {userReaction || "Love"}
            </span>
          </button>

          {showPicker && (
            <div
              className="absolute bottom-full mb-2 flex gap-3 bg-base-200 p-3 rounded-xl shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {reactionTypes.map((r) => (
                <button
                  key={r.type}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(r.type);
                  }}
                  className={`text-3xl hover:scale-125 transition-transform ${
                    userReaction === r.type ? "opacity-100" : "opacity-70"
                  }`}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comment */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setOpenComments(true)}
            className="flex items-center gap-2 py-2 px-2 md:px-6 rounded-lg hover:bg-base-300 w-full justify-center transition"
          >
            <FaRegCommentDots className="text-lg text-base-content/60" />
            <span className="font-semibold">Comment</span>
          </button>
        </div>

        {/* Share */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 py-2 px-2 md:px-6 rounded-lg hover:bg-base-300 w-full justify-center transition"
          >
            <FaShare className="text-lg text-base-content/60" />
            <span className="font-semibold">Share</span>
          </button>
        </div>
      </div>

      {/* Likes modal */}
      {openLikes && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-base-200 p-5 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Reactions</h2>
            <div className="max-h-64 overflow-y-auto">
              {likeUsers.map((u) => (
                <div key={u.uid} className="flex items-center gap-3 mb-3">
                  <img
                    src={u.photoURL}
                    alt={u.displayName}
                    className="h-10 w-10 rounded-full"
                  />
                  <p className="font-medium text-primary">{u.displayName}</p>
                  <span className="text-xl">
                    {reactionTypes.find((r) => r.type === u.type)?.emoji ||
                      "👍"}
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpenLikes(false)}
              className="mt-4 btn btn-error w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Comments modal */}
      {openComments && (
        <div className="fixed inset-0 bg-base-300/40 backdrop-blur-sm flex justify-center items-center z-50 p-2 overflow-hidden">
          <div className="bg-base-100 w-full max-w-lg rounded-2xl shadow-lg p-4 md:p-6 relative">
            <h2 className="text-lg font-semibold mb-4 border-b border-base-300 pb-2">
              Comments
            </h2>

            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2 mb-4"
            >
              <img
                src={user?.photoURL || "/default-avatar.png"}
                alt="user"
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
              />
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="input input-bordered flex-1 text-sm"
              />
              <button
                type="submit"
                className="btn btn-primary btn-circle btn-sm"
                disabled={!newComment.trim()}
              >
                <IoSend size={18} />
              </button>
            </form>

            {/* Comments list */}
            <div className="max-h-[65vh] overflow-y-auto space-y-4 pr-1">
              {comments?.map((c) => (
                <div
                  key={c._id}
                  className="flex items-start gap-3 bg-base-100 p-3 rounded-2xl shadow-sm break-words"
                >
                  <img
                    src={c.authorPhoto || "/default-avatar.png"}
                    alt={c.authorName}
                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="bg-base-200 rounded-2xl px-3 py-2 break-words overflow-hidden">
                      <p className="font-semibold text-sm text-base-content">
                        {c.authorName}
                      </p>
                      <p className="text-sm text-base-content/90 mt-0.5 break-words">
                        {c.text}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-base-content/60">
                      <span className="whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleString()}
                      </span>

                      {(c.authorEmail === user?.email ||
                        post.userEmail === user?.email) && (
                        <button
                          onClick={() =>
                            handleDeleteComment(c._id, c.authorEmail)
                          }
                          className="hover:underline text-error whitespace-nowrap"
                        >
                          Delete
                        </button>
                      )}
                      {c.authorEmail === user?.email && (
                        <button
                          onClick={() => handleEditComment(c._id)}
                          className="hover:underline text-primary whitespace-nowrap"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setActiveReplyId(
                            activeReplyId === c._id ? null : c._id
                          )
                        }
                        className="hover:underline whitespace-nowrap"
                      >
                        Reply
                      </button>
                    </div>

                    {/* Replies */}
                    <div className="mt-2 ml-10 space-y-2">
                      {c.replies?.map((r) => (
                        <ReplyItem
                          key={r._id}
                          reply={r}
                          parentReplyId={r._id}
                          user={user}
                          commentId={c._id}
                          handleAddReply={handleAddReply}
                          handleEditReply={handleEditReply}
                          handleDeleteReply={handleDeleteReply}
                          replyTexts={replyTexts}
                          setReplyTexts={setReplyTexts}
                        />
                      ))}
                      {activeReplyId === c._id && (
                        <div className="flex gap-2 mt-2 items-center w-full">
                          <img
                            src={user?.photoURL || "/default-avatar.png"}
                            className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                            alt="user"
                          />
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyTexts[c._id] || ""}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({
                                ...prev,
                                [c._id]: e.target.value,
                              }))
                            }
                            className="input input-bordered input-sm flex-1 text-sm rounded-full"
                          />
                          <button
                            onClick={async () => {
                              if ((replyTexts[c._id] || "").trim()) {
                                await handleAddReply(c._id, replyTexts[c._id]);
                                setReplyTexts((prev) => ({
                                  ...prev,
                                  [c._id]: "",
                                }));
                              }
                            }}
                            disabled={!replyTexts[c._id]?.trim()}
                            className="btn btn-primary btn-circle btn-sm"
                          >
                            <IoSend size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* ...Render comments and replies here like in your original code... */}
            </div>

            <button
              onClick={() => setOpenComments(false)}
              className="absolute top-3 right-3 text-base-content hover:text-error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Share modal */}
      {share && <ShareBox share={share} post={post} setShare={setShare} />}
    </div>
  );
};

export default PostCard;
