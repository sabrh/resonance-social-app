import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { BsBell } from "react-icons/bs";

import { AuthContext } from "../context/AuthContext/AuthContext";
import toast from "react-hot-toast";

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
          <li><Link to="/home">News Feed</Link></li> 
          <li><Link to="/profile">My Profile</Link></li> 
          <li><Link to="/chats">Messages</Link></li> 
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
      <div className="navbar-center hidden md:flex flex-1 justify-center"> 
        <ul className="menu menu-horizontal px-1 md:gap-4 text-lg"> 
          {links}
        </ul> 
      </div> 
    

      {/* Right side */}
      <div className="navbar-end ml-auto gap-4">

        {user ? (
          <>
          <Link to="/notifications">
          <BsBell size={30} />
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
