import { useContext, useState } from "react";
import { FaHeart, FaRegHeart, FaRegCommentDots, FaShare } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import { BsThreeDotsVertical } from "react-icons/bs";
import ReplyItem from "./comments/ReplyItem";
import { Link } from "react-router";

export type Comment = {
  _id: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
  authorPhoto?: string;
  replies?: Comment[];
};
type LikeUser = {
  uid: string;
  displayName: string;
  photoURL?: string;
};

type Share = {
  userId: string;
  userName: string;
  userPhoto?: string;
  sharedAt: string;
};

type Post = {
  _id: string;
  userId: string; // added for userId
  // sharedPost:string;
  text: string;
  userEmail: string;
  privacy: string;
  image?: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  comments?: Comment[];
  shares?: Share[];
  userName: string;
  userPhoto: string;
  createdAt: string;
  sharedPostData?: {
    //  add this
    userName: string;
    userPhoto?: string;
    text: string;
    image?: string;
    mimetype?: string;
    filename?: string;
    createdAt: string;
  };
};

type Props = {
  post: Post;
  currentUserId: string;
  onDelete?: (id: string) => void;
};

const PostCard = ({ post, currentUserId, onDelete }: Props) => {
  const [info, setInfo] = useState(false);
  const [liked, setLiked] = useState(
    post.likes?.includes(currentUserId) ?? false
  );
  // const [sharedPost, setSharedPost] = useState<Post["sharedPost"]>(
  //   post.sharedPost
  // );
  const [replyTexts, setReplyTexts] = useState<{ [key: string]: string }>({});

  const [likesCount, setLikesCount] = useState(post.likes?.length ?? 0);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  // const [sharesCount, setSharesCount] = useState(post.shares?.length ?? 0);
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);
  const [openLikes, setOpenLikes] = useState(false);
  const [likeUsers, setLikeUsers] = useState<LikeUser[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const { user } = useContext(AuthContext)!;

  // Like/Unlike handler
  const handleLike = async () => {
    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/like`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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
  const handleViewLikes = async () => {
    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/likes`
      );
      const data = await res.json();
      setLikeUsers(data);
      setOpenLikes(true);
    } catch (err) {
      console.error("Error fetching likes:", err);
    }
  };
  // Add comment
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

  // const handleAddReply = async (commentId: string, text: string) => {
  //   if (!text.trim()) return;

  //   try {
  //     const res = await fetch(
  //       `https://resonance-social-server.vercel.app/socialPost/${post._id}/comment/${commentId}/replies`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           text,
  //           userEmail: user?.email,
  //           userName: user?.displayName,
  //           authorPhoto: user?.photoURL,
  //         }),
  //       }
  //     );
  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.error || "Failed to add reply");

  //     setComments((prev) =>
  //       prev.map((c) =>
  //         c._id === commentId
  //           ? { ...c, replies: [data.reply, ...(c.replies || [])] }
  //           : c
  //       )
  //     );
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to add reply");
  //   }
  // };
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

  // const handleShare = async () => {
  //   try {
  //     const res = await fetch(
  //       `https://resonance-social-server.vercel.app/socialPost/${post._id}/share`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           userId: currentUserId,
  //           userName: user?.displayName,
  //           userPhoto: user?.photoURL,
  //           text: post.text || "",
  //         }),
  //       }
  //     );

  //     const data = await res.json();
  //     if (res.ok) {
  //       toast.success("Post shared in your profile !");
  //       setSharesCount((prev) => prev + 1);

  //       // Shared post update
  //       // যদি parent কম্পোনেন্টে posts state থাকে:
  //       // setPosts((prev) => [data.post, ...prev]);

  //       // অন্যভাবে: PostCard-এর মধ্যে শুধু local shared post দেখাতে চাইলে:
  //       setSharedPost(data.post.sharedPost); // <-- useState declare করতে হবে
  //     } else {
  //       toast.error(data.error || "Failed to share");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Something went wrong");
  //   }
  // };

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
  // console.log("Post data:", post);
  // console.log("Shared Post Data:", post.sharedPost);

  return (
    <div className="bg-white shadow rounded-lg p-4 max-w-2xl mx-auto mt-6">
      {/* Info dropdown */}
      <div
        className={`float-right relative ${
          post?.userEmail === user?.email ? "" : "hidden"
        }`}
      >
        {/* <p onClick={() => setInfo(!info)} className="text-3xl cursor-pointer">
          <i className="fa-solid fa-circle-info"></i> */}
        <p onClick={() => setInfo(!info)} className="text-xl cursor-pointer">
          <BsThreeDotsVertical />
        </p>
        <div
          className={`absolute top-10 right-4 h-[100px] w-[150px] bg-white shadow-2xl rounded-2xl ${
            info ? "" : "hidden"
          }`}
        >
          <p className="flex gap-2 items-center mt-4 cursor-pointer hover:bg-gray-200 px-4">
            <i className="fa-solid fa-pen-to-square"></i>
            <span>Edit post</span>
          </p>
          <p
            onClick={confirmDelete}
            className="flex gap-2 items-center mt-4 cursor-pointer hover:bg-gray-200 px-4"
          >
            <i className="fa-solid fa-trash"></i>
            <span>Delete post</span>
          </p>
        </div>
      </div>

      {/* Post header */}
      <div className="mt-3 flex items-center gap-3">
        {/* <img
          className="h-[55px] w-[55px] rounded-full"
          src={post?.userPhoto}
          alt="User"
        /> */}

        <Link to={`/profile/${post.userId}`}>
          <img
            className="h-[55px] w-[55px] rounded-full cursor-pointer"
            src={post?.userPhoto}
            alt="User"
          />
        </Link>
        <div>
          {/* <p className="text-lg text-blue-400 font-bold">{post?.userName}</p> */}

          <Link
            to={`/profile/${post.userId}`}
            className="text-lg text-blue-400 font-bold hover:underline"
          >
            {post?.userName}
          </Link>

          <p className="text-gray-500 text-sm">{post.createdAt}</p>
          <div className="text-gray-500 text-sm bg-gray-200 p-1 px-2 mt-1 rounded-xl w-fit">
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
      <p className="mt-4">{post.text}</p>

      {/* Original post image */}
      {/* <p className="mt-2">{post.text}</p> */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={post.filename}
          className="max-w-full max-h-[400px] object-cover mt-2 rounded"
        />
      )}

      {/* Shared post (Facebook style) */}
      {/* Shared post (Facebook style) */}

      {/* Like + Comment + Share */}
      <div className="flex gap-6 items-center mt-4 text-lg text-gray-500">
        {/* Like */}
        {/* <button onClick={handleLike} className="flex items-center gap-1">
          {liked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-500" />
          )}
          <span className="text-sm">{likesCount}</span>
        </button> */}
        <div className="flex gap-4  ">
          {" "}
          <button onClick={handleLike} className="flex items-center gap-1 mt-2">
            {liked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-500" />
            )}{" "}
            {likesCount}
          </button>{" "}
          <span
            onClick={handleViewLikes}
            className="text-lg mt-2 cursor-pointer hover:underline hover:text-blue-500 hover:font-semibold"
          >
            Likes
          </span>
        </div>

        {/* Comment */}
        <button
          onClick={() => setOpenComments(true)}
          className="flex items-center gap-1"
        >
          <FaRegCommentDots className="text-gray-600" />
          <span className="text-lg">{comments.length}</span>
        </button>
        {/* Share */}
        <button
          // onClick={handleShare}
          className="flex items-center gap-1 text-gray-600"
        >
          <FaShare />
          <span className="text-lg">0</span>
        </button>
      </div>

      {/* {sharedPost && (
        <div className="bg-gray-100 p-3 rounded mt-3 border border-gray-300">
          <p className="text-sm text-gray-500 mb-2">
            Shared by {post.userName} on{" "}
            {new Date(post.createdAt).toLocaleString()}
          </p>

          <div className="bg-white p-2 rounded border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <img
                src={sharedPost.userPhoto}
                alt={sharedPost.userName}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="font-semibold text-sm">{sharedPost.userName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(sharedPost.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {sharedPost.text && <p>{sharedPost.text}</p>}
            {sharedPost.image && (
              <img
                src={`data:${sharedPost.mimetype};base64,${sharedPost.image}`}
                alt={sharedPost.filename}
                className="mt-1 rounded"
              />
            )}
          </div>
        </div>
      )} */}

      {/* Likes Modal */}
      {openLikes && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Liked by</h2>
            <div className="max-h-64 overflow-y-auto">
              {likeUsers.length === 0 && <p>No likes yet.</p>}
              {likeUsers.map((u) => (
                <div key={u.uid} className="flex items-center gap-3 mb-3">
                  {u.photoURL && (
                    <img
                      src={u.photoURL}
                      alt={u.displayName}
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <p className="font-medium">{u.displayName}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpenLikes(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Comment modal */}
      {openComments && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
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
              <div className="max-h-96 overflow-y-auto space-y-4">
                {comments?.map((c) => (
                  <div key={c._id} className="flex gap-3 border-b pb-2">
                    {/* Author profile pic */}
                    <img
                      src={c.authorPhoto || "/default-avatar.png"} // fallback
                      alt={c.authorName}
                      className="h-10 w-10 rounded-full object-cover"
                    />

                    <div className="flex-1">
                      {/* Comment header */}
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {c.authorName ?? "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>

                      {/* Comment text */}
                      <p className="mt-1">{c.text}</p>

                      {/* Comment actions */}
                      <div className="flex gap-2 text-xs mt-1">
                        {(c.authorEmail === user?.email ||
                          post.userEmail === user?.email) && (
                          <button
                            onClick={() =>
                              handleDeleteComment(c._id, c.authorEmail)
                            }
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        )}
                        {c.authorEmail === user?.email && (
                          <button
                            onClick={() => handleEditComment(c._id)}
                            className="text-blue-500 hover:underline"
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
                          className="text-gray-500 hover:underline text-sm"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Replies */}
                      <div className="mt-2">
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

                        {/* Root comment reply input */}
                        {activeReplyId === c._id && (
                          <input
                            type="text"
                            placeholder="Reply..."
                            value={replyTexts[c._id] || ""}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({
                                ...prev,
                                [c._id]: e.target.value,
                              }))
                            }
                            onKeyDown={async (e) => {
                              if (
                                e.key === "Enter" &&
                                (replyTexts[c._id] || "").trim()
                              ) {
                                await handleAddReply(c._id, replyTexts[c._id]);
                                setReplyTexts((prev) => ({
                                  ...prev,
                                  [c._id]: "",
                                }));
                                setActiveReplyId(null); // reply send হলে input hide হবে
                              }
                            }}
                            className="border rounded px-2 py-1 w-full text-sm mt-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
