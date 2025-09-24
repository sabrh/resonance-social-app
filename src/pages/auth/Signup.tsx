import { useState, useContext } from "react";
import type { FC } from "react";
import { FaEye, FaEyeSlash, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { updateProfile } from "firebase/auth";

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || "https://resonance-social-server.vercel.app";


const Signup: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  // if context is not ready yet
  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { createUser, googleSign, githubSign } = authContext;

  const handleGoogle = async (): Promise<void> => {
    try {
      await googleSign();
      // triggerSuccessLottie();
      toast.success("Logged in with Google!");
      navigate("/home");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed!");
      }
    }
  };

  const handleGithub = async (): Promise<void> => {
    try {
      await githubSign();
      toast.success("Logged in with GitHub!");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Login failed!");
      }
    }
  };


  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const imageUrl = formData.get("imageUrl") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    console.log(fullName, email, imageUrl);

    //     // create user
    //     createUser(email, password)
    //   .then( async (result) => {
    //     const currentUser = result.user;
    //     // Update displayName and photoURL
    //     await updateProfile(currentUser, {
    //   displayName: fullName,
    //   photoURL: imageUrl,
    // })

    //     .then(() => {
    //       console.log("Profile updated!");
    //       toast.success("Account created successfully!");
    //       navigate("/login");
    //     })
    //     .catch((err) => {
    //       console.error("Profile update error:", err);
    //     });
    //   })
    //   .catch((error) => {
    //     console.error("Signup error:", error);
    //     toast.error(error.message || "Signup failed!");
    //   });



    // New create user 
    createUser(email, password)
      .then(async (result) => {
        const currentUser = result.user;

        // 1. Update Firebase profile
        await updateProfile(currentUser, {
          displayName: fullName,
          photoURL: imageUrl,
        });

        // 2. Send to backend
        try {
          await axios.post(`${API_URL}/users`, {
            uid: currentUser.uid,
            displayName: fullName,
            email: currentUser.email,
            photoURL: imageUrl || null,
          });
        } catch (err) {
          console.error("Backend user create error:", err);
        }

        toast.success("Account created successfully!");
        navigate("/login");
      })
      .catch(err => console.error(err));




  };

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Signup</h2>
        <form onSubmit={handleSignup} className="space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required />
              <button type="button" onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Profile Image URL */}
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-600">
              Profile Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              placeholder="Paste your image URL"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>

          {/* Submit */}
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition">
            Signup
          </button>

          <p className="text-lg text-center">Already have an account?{" "}
            <Link to="/login">
              <span className="text-blue-500">Login</span>
            </Link>
          </p>
        </form>

        {/* Social login */}
        <div className="mt-4 flex items-center justify-center">
          <p className="text-gray-600 text-lg mr-4">Or join us using</p>
          <button onClick={handleGoogle} className="cursor-pointer"><FcGoogle size={30} /></button>
          <button onClick={githubSign} className="cursor-pointer ml-4"><FaGithub className="text-gray-700" size={30} /></button>
        </div>
      </div>
    </div>
  );
};

export default Signup