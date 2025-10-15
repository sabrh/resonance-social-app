import { Plus, X } from "lucide-react";
import {
  useContext,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext/AuthContext";
import { BsThreeDotsVertical } from "react-icons/bs";

type Story = {
  _id: string;
  userId: string;
  image?: string;
  mimetype?: string;
  filename?: string;
  likes?: string[];
  userName: string;
  userPhoto: string;
  createdAt: string;
};

const RightSidebar: React.FC = () => {
  const { user } = useContext(AuthContext)!;
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [reload, setReload] = useState<boolean>(false);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [info, setInfo] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(`https://resonance-social-server.vercel.app/story`);
        if (!response.ok) throw new Error("Network error");
        const data: Story[] = await response.json();
        setStories(data);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, [reload]);

  console.log(stories);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    console.log(image);
  };

  const removeImage = () => {
    setImage(null);
    setImageFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (imageFile) formData.append("photo", imageFile);
    if (user?.displayName) formData.append("userName", user.displayName);
    if (user?.photoURL) formData.append("userPhoto", user.photoURL);
    if (user?.uid) formData.append("userId", user.uid);

    try {
      const res = await fetch("https://resonance-social-server.vercel.app/story", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.insertedId) {
        toast.success("Your story created successfully!");
        setReload(prev => !prev);
        setImage(null);
        setImageFile(null);
      } else {
        toast.error("Could not create story. Try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to post. Check console.");
    }
  };


  // delete story...........................................................

  const confirmDelete = (id: string) => {
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
                  `https://resonance-social-server.vercel.app/story/${id}`,
                  { method: "DELETE" }
                );

                if (res.ok) {
                  setSelectedStory(null);
                  toast.dismiss(t.id);
                  toast.success("Post deleted successfully!");
                  setReload(prev => !prev);
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
    <div>
      {/* side bar */}
      <aside className="md:block md:col-span-3 flex gap-4 items-center overflow-x-auto md:overflow-x-visible mb-3 md:space-y-6">
        <form>
          <label className="cursor-pointer">
            <div className="relative md:w-[180px] md:h-[200px] w-[130px] h-[150px] bg-gradient-to-br from-blue-500/20 to-purple-500/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl group ">
              {/* Floating gradient circle */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>

              {/* Icon Section */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  Create Story
                </p>
              </div>

              {/* Decorative gradient border (subtle) */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10"></div>
            </div>

            <input
              onChange={handleImageChange}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </label>
        </form>
        {stories.map((story) => (
          <div key={story?._id}>
            <div
              onClick={() => setSelectedStory(story)}
              className=" md:w-[180px] md:h-[200px] w-[130px] h-[150px] rounded-2xl relative cursor-pointer"
            >
              <div className="h-[50px] w-[50px] absolute top-4 left-4 bg-gradient-to-r from-green-400 via-emerald-400 to-sky-500 animate-gradient-x p-1 rounded-full">
                <img className=" rounded-full" src={story?.userPhoto} />
              </div>
              <img
                className="h-full w-full rounded-2xl"
                src={`data:${story?.mimetype};base64,${story?.image}`}
              />
              <div className="absolute bottom-2 left-2 flex justify-center w-full">
                <p className=" text-white font-bold text-xl">
                  {story?.userName}
                </p>
              </div>
            </div>
            {/* view story modal */}
            {selectedStory && (
              <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex justify-center items-center">
                <div className="h-[400px] w-[300px] rounded-3xl relative">
                  <img
                    className="h-full w-full rounded-3xl"
                    src={`data:${selectedStory?.mimetype};base64,${selectedStory?.image}`}
                  />
                  <div className="h-[50px] w-[50px] absolute top-4 left-4 bg-gradient-to-r from-green-400 via-emerald-400 to-sky-500 animate-gradient-x p-1 rounded-full flex gap-4 items-center">
                    <img
                      className=" rounded-full"
                      src={selectedStory?.userPhoto}
                    />
                    <div className="w-fit">
                      <p className="text-white font-bold text-2xl">
                        {selectedStory?.userName}
                      </p>
                      <p className="text-white font-bold text-[12px] text-nowrap">
                        {selectedStory?.createdAt}
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={() =>{ 
                      setSelectedStory(null);
                      setInfo(false);
                    }

                    }
                    className="absolute top-3 right-3 cursor-pointer"
                  >
                    <X className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className="absolute top-4 right-12 cursor-pointer"
                  >
                    <div onClick={() => setInfo(!info)} className={(selectedStory?.userId === user?.uid) ? "" : "hidden"}>
                      <BsThreeDotsVertical className="w-5 h-5 text-white" />
                    </div>
                    <div
                      className={`absolute top-10 right-4 h-[60px] w-[150px] bg-white shadow-2xl rounded-2xl ${
                        info ? "" : "hidden"
                      }`}
                    >
                      <p
                        onClick={()=>confirmDelete(selectedStory._id)}
                        className="flex gap-2 items-center mt-4 cursor-pointer hover:bg-gray-200 px-4"
                      >
                        <i className="fa-solid fa-trash"></i>
                        <span>Delete story</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* story Upload Modal .............................................*/}

      {image && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xl flex justify-center overflow-y-auto">
          <div className="min-h-screen flex justify-center items-start w-full p-4">
            <form
              onSubmit={handleSubmit}
              className="bg-white w-full max-w-md rounded-lg p-4 mx-1 relative my-8 "
            >
              <div
                onClick={removeImage}
                className="absolute top-3 right-3 cursor-pointer"
              >
                <i className="fa-solid fa-delete-left text-2xl"></i>
              </div>
              <p className="font-bold text-xl mb-3">Create your story</p>

              {image && (
                <div className="relative mt-5">
                  <img
                    src={image}
                    alt="preview"
                    className="w-60 h-60 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    onClick={removeImage}
                    type="button"
                    className="absolute top-2 left-2 bg-red-600 text-white bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>

                  <button
                    type="submit"
                    className="btn text-white bg-blue-500 rounded-xl float-right mt-5"
                  >
                    Share Now
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
