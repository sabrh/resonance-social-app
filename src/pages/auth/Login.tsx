import React, { useState } from "react";
import type { FC } from "react";
import { FaEye, FaEyeSlash, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router";

const Login: FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form className="space-y-5">
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
                placeholder="Enter your password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required/>

              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Forgot password?
            </a>
          </div>

          <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition">
            Login
          </button>
          <p className="text-lg text-center">Don't have an account?{" "}
            <Link to="/signup">
              <span className="text-blue-500">Signup</span>
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

export default Login;