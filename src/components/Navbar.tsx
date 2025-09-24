import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { BsBell } from "react-icons/bs";

import { AuthContext } from "../context/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { FaArrowRightToBracket } from "react-icons/fa6";

export default function Navbar() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { user, signOutUser } = authContext;

  const handleLogout = () => {
    signOutUser()
      .then(() => {
        console.log("Logged out");
        toast.success("Logged out successfully!");
        navigate("/");
      })
      .catch((error: unknown) => {
        console.error("Logout error:", error);
      });
  };

  const links =
  <>
      {user && (
        <>
        <li><NavLink to="/home" className={({ isActive }) => isActive ? 
        "text-blue-400 underline-offset-4 font-bold" : "" }>Newsfeed</NavLink></li>
            
        <li><NavLink to="/profile" className={({ isActive }) => isActive ? 
        "text-blue-400 underline-offset-4 font-bold" : "" }>My Profile</NavLink></li>

        <li><NavLink to="/messages" className={({ isActive }) => isActive ? 
        "text-blue-400 underline-offset-4 font-bold" : "" }>Messages</NavLink></li> 
        </>
      )}
  </>
  return (
    <div className="navbar bg-base-100/70 backdrop-blur-md shadow px-8 md:px-36 fixed top-0 left-0 w-full z-50">
      {/* Left side */}
      <div className="hidden md:navbar-start">
        <Link to="/" className="font-bold text-3xl flex items-center gap-2">
            resonance
        </Link>
      </div>

      {/* Center links */}
      <div className="navbar-center flex"> 
        <ul className="menu menu-horizontal px-1 md:gap-4 md:text-md"> 
          {links}
        </ul> 
      </div> 
    

      {/* Right side */}
      <div className="navbar-end ml-auto gap-4">

        {user ? (
          <>
          <Link to="/notifications">
          <BsBell size={25} />
          </Link>
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
              className="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-52"
            >
              <li className="font-bold">
                <Link to="/profile">{user.displayName ?? "Profile"}</Link>
              </li>
              <li className="bg-red-600 rounded text-white p-1 font-bold flex items-center gap-1">
                <button onClick={handleLogout}>Logout <FaArrowRightToBracket /> </button>
              </li>
            </ul>
          </div>
          </>
        ) : (
          <>
          <Link className="btn btn-neutral text-white rounded-full mr-4" to="/login">
            Login / Signup
          </Link>
          </>
        )}
      </div>
    </div>
  );
}
