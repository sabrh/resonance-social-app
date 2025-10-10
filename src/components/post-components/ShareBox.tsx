import {
  useContext,
  useState,
  type Dispatch,
  type FC,
  type FormEvent,
  type SetStateAction,
} from "react";
import { Link } from "react-router";
import TextareaAutosize from "react-textarea-autosize";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import toast from "react-hot-toast";

type Post = {
  _id: string;
  userId: string;
  text: string;
  userEmail: string;
  privacy: string;
  image?: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  userName: string;
  userPhoto: string;
  createdAt: string;
};

type ShareProps = {
  share: boolean;
  setShare: Dispatch<SetStateAction<boolean>>;
  post: Post;
};

const ShareBox: FC<ShareProps> = ({ setShare, post }) => {
  const [privacy, setPrivacy] = useState<string>("public");
  const [text, setText] = useState<string>("");

  const base64ToFile = (base64: string, filename: string, mimetype: string) => {
    const arr = base64.split(",");
    const mime = mimetype || arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  console.log("Post in ShareBox:", post);
  const { user } = useContext(AuthContext)!;
  // Image rendering fix
  let imageSrc: string | undefined;
  if (post.image) {
    if (post.image.startsWith("data:")) {
      imageSrc = post.image;
    } else if (post.mimetype) {
      imageSrc = `data:${post.mimetype};base64,${post.image}`;
    }
  }
  console.log(imageSrc);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (user) formData.append("privacy", privacy);
    if (user) formData.append("shared", "yes");
    if (user?.displayName) formData.append("userName", user?.displayName);
    if (user?.photoURL) formData.append("userPhoto", user?.photoURL);
    if (text) formData.append("text", text);
    if (user?.email) formData.append("userEmail", user?.email);
    if (user?.uid) formData.append("userId", user?.uid);
    if (user) formData.append("sharedUserName", post?.userName);
    if (user) formData.append("sharedUserPhoto", post?.userPhoto);
    if (user) formData.append("sharedUserText", post?.text);
    if (user) formData.append("sharedUserId", post?.userId);
    if (imageSrc && post.filename && post.mimetype) {
      const file = base64ToFile(imageSrc, post.filename, post.mimetype);
      formData.append("photo", file); // append as actual file
    }

    try {
      const res = await fetch("http://localhost:3000/socialPost", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.insertedId) {
        toast.success("Your post is updated successfully!");
        setShare(false);
        
        // Refresh the newsfeed after posting
        
      } else {
        toast.error("Could not add post. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post. Check console.");
    }




  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex justify-center overflow-y-auto">
  <div className="min-h-screen flex justify-center items-start w-full p-4">
    <form
    onSubmit={handleSubmit}
    className="bg-white w-full max-w-md rounded-lg p-4 mx-1 relative my-8"
  >
          <div
            onClick={() => setShare(false)}
            className="absolute top-3 right-3 cursor-pointer"
          >
            <i className="fa-solid fa-delete-left text-2xl"></i>
          </div>

          <div>
            <p className="font-bold text-xl mb-3">Share this Post</p>

            <div className="w-[100px] ">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Select Privacy
              </label>
              <select
                id="privacy"
                name="privacy"
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <TextareaAutosize
              value={text}
              onChange={(e) => setText(e.target.value)}
              minRows={1}
              placeholder="Write your update here..."
              className="bg-white rounded-2xl border border-gray-700 w-full mt-3 p-5"
            />

            <div>
              <div className="mt-3 flex items-center gap-3">
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
            </div>
          </div>

          <div className="mt-4 float-right">
            <button
              type="submit"
              className="btn bg-blue-500 rounded-2xl text-white"
            >
              Share Now
            </button>
          </div>
        </form>
        </div>
      
    </div>
  );
};

export default ShareBox;
