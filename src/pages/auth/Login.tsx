import { useState, useContext } from "react";
import type { FC } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router";
import { AuthContext } from "../../context/AuthContext/AuthContext";

const Login: FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [emailInputValue, setEmailInputValue] = useState("");

  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { signInUser, googleSign, githubSign } = authContext;

  // ✅ Google login handler (moved outside of handleLogin)
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

  // ✅ Normal login handler
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    signInUser(email, password)
      .then((result) => {
        console.log("Login Successful:", result.user);
        toast.success("Logged in successfully!");
        navigate("/home");
      })
      .catch((error: any) => {
        console.error("Login error:", error);
        toast.error(error.message || "Login failed!");
      });
  };

  return (
   <div className="flex items-center justify-center px-4">
  <div className="w-full max-w-md bg-base-100 rounded-lg shadow-md p-8 border border-base-300">
    <h2 className="text-2xl font-bold text-center text-base-content mb-6">Login</h2>
    <form onSubmit={handleLogin} className="space-y-5">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-base-content">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          className="w-full mt-1 px-3 py-2 border border-base-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-base-100 text-base-content"
          onChange={(e) => setEmailInputValue(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-base-content">
          Password
        </label>
        <div className="relative mt-1">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-3 py-2 border border-base-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-base-100 text-base-content"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/70 hover:text-base-content"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Forgot password */}
      <div className="text-right">
        <Link to="/auth/forget-password" state={{ email: emailInputValue }} className="link link-primary">
          Forget password?
        </Link>
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-2 px-4 bg-primary hover:bg-primary-focus text-primary-content font-semibold rounded-lg shadow-md transition"
      >
        Login
      </button>

      <p className="text-lg text-center text-base-content">
        Don't have an account?{" "}
        <Link to="/signup">
          <span className="link link-primary">Signup</span>
        </Link>
      </p>
    </form>

    {/* Social login */}
    <div className="mt-4 flex items-center justify-center">
      <p className="text-base-content/70 text-lg mr-4">Or join us using</p>
      <button onClick={handleGoogle} className="cursor-pointer">
        <FcGoogle size={30} />
      </button>
      <button onClick={handleGithub} className="cursor-pointer ml-4">
        <FaGithub className="text-base-content" size={30} />
      </button>
    </div>
  </div>
</div>
  );
};

export default Login;
