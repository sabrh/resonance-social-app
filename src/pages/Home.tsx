import {
  useContext,
  useState,
  type ChangeEvent,
  type FC,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import Posts from "../components/post-components/Posts";
import { AuthContext } from "../context/AuthContext/AuthContext";
import { MdAddPhotoAlternate } from "react-icons/md";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

const Home: FC = () => {
  const { user } = useContext(AuthContext)!;
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [postsRefreshKey, setPostsRefreshKey] = useState<number>(0);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (user?.displayName) formData.append("text", user.displayName);
    if (user?.photoURL) formData.append("text", user.photoURL);
    if (text) formData.append("text", text);
    if (user?.email) formData.append("text", user.email);
    if (imageFile) formData.append("photo", imageFile);

    try {
      const res = await fetch(
        "https://resonance-social-server.vercel.app/socialPost",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.insertedId) {
        toast.success("Your post is updated successfully!");
        setText("");
        setImage(null);
        setImageFile(null);
        setPostsRefreshKey((k) => k + 1);
      } else {
        toast.error("Could not add post. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post. Check console.");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-20 ">
      {/* Left Sidebar (sticky, hidden on mobile) */}
      <LeftSidebar />

      {/* Main Content */}
      <main className="col-span-1 md:col-span-6">
        <div className="w-full">
          <div className="rounded-sm">
            <form
              onSubmit={handleSubmit}
              className="shadow-sm bg-gray-100 rounded-xl px-4 py-4"
            >
              <p className="text-lg font-bold">Create New Post</p>

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
                >
                  Post Now
                </button>
              </div>
            </form>
          </div>
        </div>

        <section className="mt-5">
          <Posts refreshKey={postsRefreshKey} />
        </section>
      </main>

      {/* Right Sidebar (sticky, hidden on mobile) */}
      <RightSidebar />
    </div>
  );
};

export default Home;
