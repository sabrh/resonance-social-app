import {
  useContext,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
  useEffect,
} from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import PostCard from "../components/post-components/PostCard"; // Import PostCard directly
import { AuthContext } from "../context/AuthContext/AuthContext";
import { MdAddPhotoAlternate } from "react-icons/md";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Loading from "../components/Loading";

type Comment = {
  _id: string;
  authorName: string;
  text: string;
  createdAt: string;
};

type Post = {
  _id: string;
  userId: string;
  text: string;
  image?: string;
  privacy: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  comments?: Comment[];
  userName: string;
  userPhoto: string;
  createdAt: string;
  userEmail: string;
  shared: string;
  sharedUserName: string;
  sharedUserPhoto: string;
  sharedUserText: string;
  sharedUserId: string;
};

const Home: FC = () => {
  const { user } = useContext(AuthContext)!;
  const [privacy, setPrivacy] = useState<string>("public");
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user id
  const currentUserId = user?.uid || "";



  // Fetch newsfeed posts
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchFeed = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:3000/feed/${currentUserId}`,
          {
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error(`Failed to load feed: ${res.status}`);

        const data = await res.json();
        if (mounted) setPosts(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching newsfeed:", err);
          if (mounted) setError("Failed to load posts");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchFeed();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [currentUserId]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const matchPost = posts.filter((post) => post?.privacy === "public");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (user) formData.append("privacy", privacy);
    if (user?.displayName) formData.append("userName", user.displayName);
    if (user?.photoURL) formData.append("userPhoto", user.photoURL);
    if (text) formData.append("text", text);
    if (user?.email) formData.append("userEmail", user.email);
    if (user?.uid) formData.append("userId", user.uid);
    if (imageFile) formData.append("photo", imageFile);

    try {
      const res = await fetch("http://localhost:3000/socialPost", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.insertedId) {
        toast.success("Your post is updated successfully!");
        setText("");
        setImage(null);
        setImageFile(null);
        setPrivacy("public");

        // Refresh the newsfeed after posting
        const feedRes = await fetch(
          `http://localhost:3000/feed/${currentUserId}`
        );
        const feedData = await feedRes.json();
        setPosts(feedData);
      } else {
        toast.error("Could not add post. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post. Check console.");
    }
  };

  const handleDeletePost = (deletedId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== deletedId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-20 ">
      {/* Left Sidebar (sticky, hidden on mobile) */}
      <LeftSidebar />

      {/* only for mobile device */}
      <div className="md:hidden">
        <RightSidebar></RightSidebar>
      </div>

      {/* Main Content */}
      <main className="col-span-1 md:col-span-6">
        <div className="w-full">
          <div className="rounded-sm">
            <form
              onSubmit={handleSubmit}
              className="shadow-sm bg-gray-100 rounded-xl px-4 py-4"
            >
              <p className="text-lg font-bold">Create New Post</p>

              {(text || image) && (
                <div className="w-[100px] float-right">
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
              )}

              <TextareaAutosize
                value={text}
                onChange={handleChange}
                minRows={3}
                placeholder="Write your update here..."
                className="bg-white rounded-2xl w-full mt-3 p-5"
              />

              {image && (
                <div className="relative mt-5">
                  <img
                    src={image}
                    alt="preview"
                    className="w-48 h-48 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    onClick={removeImage}
                    type="button"
                    className="absolute top-2 left-2 bg-red-600 text-white bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              )}

              <div className="mt-2 flex justify-between">
                <div className="flex items-center gap-8">
                  <label className="cursor-pointer">
                    <p className="md:text-xl text-sm font-bold flex gap-2 items-center cursor-pointer">
                      <MdAddPhotoAlternate size={30} />
                    </p>
                    <input
                      onChange={handleImageChange}
                      type="file"
                      accept="image/*"
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-info rounded-full text-white mt-4"
                  disabled={!text.trim() && !image}
                >
                  Post Now
                </button>
              </div>
            </form>
          </div>
        </div>

        <section className="mt-5">
          {loading ? (
            <Loading />
          ) : error ? (
            <div className="text-center text-red-500 mt-6">{error}</div>
          ) : matchPost.length === 0 ? (
            <div className="text-center text-gray-500 mt-6 p-4">
              <p>No posts in your feed yet.</p>
              <p className="text-sm mt-2">
                Follow some users or create a post to get started!
              </p>
            </div>
          ) : (
            <div>
              {matchPost.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  currentUserId={currentUserId}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Right Sidebar (sticky, hidden on mobile) */}
      <div className="hidden md:block"><RightSidebar /></div>
    </div>
  );
};

export default Home;
