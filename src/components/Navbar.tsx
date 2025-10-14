import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { BsBell } from "react-icons/bs";
import { AuthContext } from "../context/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { FaArrowRightToBracket } from "react-icons/fa6";
import Search from "./Search";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0); // NEW: Force refresh state

  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { user, signOutUser } = authContext;

  // NEW: Fetch unread notification count
  useEffect(() => {
    if (user?.uid) {
      fetchUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0); // Reset when user logs out
    }
  }, [user, refreshCounter]); // NEW: Add refreshCounter dependency

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/notifications/${user?.uid}/unread-count`
      );
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  // NEW: Function to refresh notification count
  const refreshNotificationCount = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleLogout = () => {
    signOutUser()
      .then(() => {
        console.log("Logged out");
        toast.success("Logged out successfully!");
        navigate("/");
        setUnreadCount(0); // Reset count on logout
      })
      .catch((error: unknown) => {
        console.error("Logout error:", error);
      });
  };

  const links = (
    <>
      {user && (
        <>
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? "text-blue-400 underline-offset-4 font-bold" : ""
              }
            >
              Newsfeed
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? "text-blue-400 underline-offset-4 font-bold" : ""
              }
            >
              My Profile
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/messages"
              className={({ isActive }) =>
                isActive ? "text-blue-400 underline-offset-4 font-bold" : ""
              }
            >
              Messages
            </NavLink>
          </li>

          {/* NEW: Notifications link */}
          <li>
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `flex items-center gap-2 ${
                  isActive ? "text-blue-400 underline-offset-4 font-bold" : ""
                }`
              }
              onClick={refreshNotificationCount} // NEW: Refresh count when clicking notifications link
            >
              Notifications
              {unreadCount > 0 && (
                <span className="badge badge-primary badge-sm">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          </li>
        </>
      )}
    </>
  );

  return (
    <div className="navbar bg-base-100/70 backdrop-blur-md shadow px-8 md:px-36 fixed top-0 left-0 w-full z-50">
      {/* Left side */}
      <div className="hidden md:navbar-start">
        <Link to="/" className="font-bold text-3xl flex items-center gap-2">
          resonance
        </Link>
        <div className="ml-5 hidden md:hidden lg:block">
          <Search></Search>
        </div>
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
            <ThemeToggle />
            {/* UPDATED: Notification bell with badge */}
            <Link
              to="/notifications"
              className="relative"
              onClick={refreshNotificationCount} // NEW: Refresh count when clicking bell
            >
              <BsBell
                size={25}
                className="text-gray-600 hover:text-blue-500 transition-colors"
              />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
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
                <li>
                  <Link
                    to="/notifications"
                    className="flex justify-between"
                    onClick={refreshNotificationCount} // NEW: Refresh count
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="badge badge-primary">{unreadCount}</span>
                    )}
                  </Link>
                </li>
                <li className="bg-red-600 rounded text-white p-1 font-bold flex items-center gap-1">
                  <button onClick={handleLogout}>
                    Logout <FaArrowRightToBracket />{" "}
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {" "}
            <ThemeToggle />
            <Link
              className="btn btn-neutral text-white rounded-full mr-4"
              to="/login"
            >
              Login / Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
