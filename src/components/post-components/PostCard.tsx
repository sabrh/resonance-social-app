import { useContext, useState } from "react";
import { FaHeart, FaRegHeart, FaRegCommentDots, FaShare } from "react-icons/fa";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import { BsThreeDotsVertical } from "react-icons/bs";

type Comment = {
  _id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type Share = {
  userId: string;
  userName: string;
  userPhoto?: string;
  sharedAt: string;
};

type Post = {
  _id: string;
  text: string;
  userEmail:string;
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
    // ✅ add this
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
  const [likesCount, setLikesCount] = useState(post.likes?.length ?? 0);
  const [comments, setComments] = useState<Comment[]>(post.comments ?? []);
  const [sharesCount, setSharesCount] = useState(post.shares?.length ?? 0);
  const [newComment, setNewComment] = useState("");
  const [openComments, setOpenComments] = useState(false);
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

  // Share handler
  const handleShare = async () => {
    try {
      const res = await fetch(
        `https://resonance-social-server.vercel.app/socialPost/${post._id}/share`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            userName: user?.displayName,
            userPhoto: user?.photoURL,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Post shared in your profile !");
        setSharesCount(data.sharesCount); // main post share count increment
      } else {
        toast.error(data.error || "Failed to share");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
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
                  {
                    method: "DELETE",
                  }
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
    <div className="bg-white shadow rounded-lg p-4 max-w-2xl mx-auto mt-6">
      {/* Info dropdown */}
      <div className={`float-right relative ${(post?.userEmail === user?.email) ? "":"hidden"}`}>
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
        <img
          className="h-[55px] w-[55px] rounded-full"
          src={post?.userPhoto}
          alt="User"
        />
        <div>
          <p className="text-lg text-blue-400 font-bold">{post?.userName}</p>
          <p className="text-gray-500 text-sm">{post.createdAt}</p>
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
      {post.sharedPostData && (
        <div className="bg-gray-100 p-3 rounded mt-3">
          <div className="flex items-center gap-2 mb-2">
            <img
              src={post.sharedPostData.userPhoto}
              alt="profile"
              className="h-8 w-8 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">
                {post.sharedPostData.userName}
              </p>
              {/* <p className="text-xs text-gray-500">
                {post.sharedPostData.createdAt
                  ? new Date(post.sharedPostData.createdAt).toLocaleString(
                      "en-US",
                      {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }
                    )
                  : ""}
              </p> */}
            </div>
          </div>

          <p>{post.sharedPostData.text}</p>
          {post.sharedPostData.image && (
            <img
              src={`data:${post.sharedPostData.mimetype};base64,${post.sharedPostData.image}`}
              alt={post.sharedPostData.filename}
              className="mt-2 rounded"
            />
          )}
        </div>
      )}

      {/* Like + Comment + Share */}
      <div className="flex gap-6 items-center mt-4 text-xl">
        {/* Like */}
        <button onClick={handleLike} className="flex items-center gap-1">
          {liked ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-500" />
          )}
          <span className="text-sm">{likesCount}</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => setOpenComments(true)}
          className="flex items-center gap-1"
        >
          <FaRegCommentDots className="text-gray-600" />
          <span className="text-sm">{comments.length}</span>
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1 text-gray-600"
        >
          <FaShare />
          <span className="text-sm">{sharesCount}</span>
        </button>
      </div>

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
