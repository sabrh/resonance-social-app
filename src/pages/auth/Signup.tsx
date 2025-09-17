import React, { useState } from "react";
import type { FC } from "react";
import { FaEye, FaEyeSlash, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router";

const Signup: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Signup</h2>
        <form className="space-y-5">
          
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required/>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required/>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Create a password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required/>
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">Confirm Password</label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required/>
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-600">
              Profile Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              placeholder="Paste your image URL"
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition">
            Signup
          </button>

          <p className="text-lg text-center">Already have an account?{" "}
            <Link to="/login">
              <span className="text-blue-500">Login</span>
            </Link>
          </p>
        </form>

        <div className="mt-4 flex items-center justify-center">
          <p className="text-gray-600 text-lg mr-4">Or join us using</p>
          <button className="cursor-pointer"><FcGoogle size={30} /></button>
          <button className="cursor-pointer ml-4"><FaFacebookF className="text-blue-700" size={30} /></button>
        </div>
      </div>
    </div>
  );
};

export default Signup;