import { useContext, useState, type ChangeEvent, type FC, type FormEvent } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import TextareaAutosize from "react-textarea-autosize";
import Posts from "../components/post-components/Posts";
import { AuthContext } from "../context/AuthContext/AuthContext";

const Home: FC = () => {
  const { user } = useContext(AuthContext)!;
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  
  console.log(user?.displayName);
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    console.log(file);
    if (file) {
      if (file) setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };


// form submission ,...................................................
  
  const handleSubmit = async(e: FormEvent)=> {
     e.preventDefault();
     
    const formData = new FormData();
    if (text) {
      formData.append("text", text);
    }
    if (imageFile) {
      formData.append("photo", imageFile);
    }
    
    console.log(...formData.entries());


  // posting on server

  try {
    const res = await fetch("https://resonance-social-server.vercel.app/socialPost", {
      method: "POST",
      body: formData, // DO NOT set Content-Type manually
    });
    const data = await res.json();
    console.log(data);
    if(data.insertedId) {
      toast.success("Your post is updated successfully!");
    }
  } catch (err) {
    console.error(err);
  }

  }







  return (
    <div className="mt-12 lg:px-20 2xl:px-20 ">
      {/* post section */}
      <div className="w-full">
        <div></div>
        {/* main post box */}
        <div className="rounded-sm px-5 py-6 mt-20">
          <button className="btn bg-blue-600 text-white">News feed</button>
          <form onSubmit={handleSubmit} className="mt-3 shadow-2xl bg-[#f6ecec] rounded-xl px-4 py-4">
            <p className="text-xl font-bold">Create New Post</p>

            
              
              <TextareaAutosize
                value={text}
                onChange={handleChange}
                minRows={3} // starting height
                placeholder="white your update here..."
                className="bg-white rounded-2xl   w-full mt-3 p-5"
              />
            
            
            {/* preview box */}

            {image && (
              <div className="relative mt-5">
                <img
                  src={image}
                  alt="preview"
                  className="w-48 h-48 object-cover rounded-xl shadow-lg"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 left-2 bg-red-600 text-white bg-opacity-50 rounded-full p-1 hover:bg-opacity-70 cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            )}

            {/* button section */}

            <div className="mt-5 ml-6 md:flex justify-between">
              <div className="flex items-center gap-8">
                <label className="cursor-pointer ">
                  <p className="md:text-xl text-sm font-bold flex gap-2 items-center cursor-pointer">
                    <i className="fa-solid fa-images md:text-4xl text-xl text-green-600"></i>
                    <span>Photos</span>
                  </p>
                  <input
                    onChange={handleImageChange}
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                </label>

                <p className="md:text-xl text-sm font-bold flex gap-2 items-center cursor-pointer">
                  <i className="fa-regular fa-face-smile md:text-4xl text-xl text-yellow-600"></i>
                  <span>Feelings/Activity</span>
                </p>
              </div>

              <button
                type="submit"
                className="btn bg-green-600 text-white mt-4"
              >
                Update Post
              </button>
            </div>
          </form>
        </div>
        <div></div>
      </div>
   

   {/* Show Post section */}
     <section className="mt-10">
      <p className="text-3xl font-bold">News Feed</p>
      <Posts></Posts>
     </section>

    </div>
  );
};

export default Home;
