import { useContext } from "react";
import { Link } from "react-router";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaRegBell, FaInfoCircle } from "react-icons/fa"; // 👈 About icon

import { IoHomeOutline } from "react-icons/io5";
import { TiMessages } from "react-icons/ti";
import { AuthContext } from "../context/AuthContext/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { user, signOutUser } = authContext;

  const handleLogout = () => {
    signOutUser()
      .then(() => {
        console.log("Logged out");
        toast.success("Logged out successfully!");
      })
      .catch((error: unknown) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <div className="navbar bg-base-100 shadow px-8 md:px-18 fixed top-0 left-0 w-full z-50">
      {/* Left side */}
      <div className="navbar-start">
        <Link to="/" className="font-bold text-3xl">
          <img className="h-15" src="/logo.png" alt="logo" />{" "}
        </Link>
      </div>

      {/* Center links */}
      <div className="navbar-center flex">
        <ul className="menu menu-horizontal px-1 md:gap-4">
          <li>
            <Link to="/">
              <IoHomeOutline size={30} />
            </Link>
          </li>
          <li>
            <Link  to="/profile">
              <FaRegCircleUser size={30} />
            </Link>
          </li>
          <li>
            <Link to="/chats">
              <TiMessages size={30} />
            </Link>
          </li>
          <li>
            <Link  to="/about">
              <FaInfoCircle size={30} /> {/* 👈 About icon */}
            </Link>
          </li>
        </ul>
      </div>

      {/* Right side */}
      <div className="navbar-end gap-4">
        <Link to="/notifications">
          <FaRegBell size={30} />
        </Link>

        {user ? (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User Avatar"
                  src={user.photoURL ?? "https://via.placeholder.com/150"}
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/profile">{user.displayName ?? "Profile"}</Link>
              </li>
              <li className="bg-red-600 rounded text-white p-1">
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <Link className="btn btn-outline rounded-full" to="/login">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
