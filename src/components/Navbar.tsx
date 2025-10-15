import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { BsBell, BsHouseDoor, BsChatDots } from "react-icons/bs";
import { FaUser } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { ThemeToggle } from "./ThemeToggle";
import { FiSearch } from "react-icons/fi";
import Search from "./Search"; // ✅ তোমার আগের Search component

export default function Navbar() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false); // ✅ নতুন state

  if (!authContext) return <p>Loading...</p>;

  const { user, signOutUser } = authContext;

  // Fetch Unread Notification Count
  useEffect(() => {
    if (user?.uid) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user, refreshCounter]);

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

  const refreshNotificationCount = () => {
    setRefreshCounter((prev) => prev + 1);
  };

  const handleLogout = () => {
    signOutUser()
      .then(() => {
        toast.success("Logged out successfully!");
        navigate("/");
        setUnreadCount(0);
      })
      .catch((error) => console.error("Logout error:", error));
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-base-100/95 backdrop-blur-sm shadow-md z-50 pointer-events-auto">
      {/* ---- MOBILE TOP ROW ---- */}
      <div className="flex justify-between items-center px-5 py-2 md:hidden">
        <Link to="/" className="font-bold text-2xl">
          resonance
        </Link>
        <div className="flex items-center gap-4">
          {/* 🔍 Mobile Search Button */}
          <button
            onClick={() => setShowMobileSearch(true)}
            className="p-2 rounded-full hover:bg-base-200"
          >
            <FiSearch size={22} className="text-gray-700" />
          </button>

          <ThemeToggle />
        </div>
      </div>

      {/* ---- MOBILE SEARCH MODAL ---- */}
      {showMobileSearch && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[60]">
          <div className="bg-base-100 p-4 rounded-lg shadow-lg w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Search</h2>
              <button
                className="text-red-500 font-bold text-xl"
                onClick={() => setShowMobileSearch(false)}
              >
                ✕
              </button>
            </div>
            <Search />
          </div>
        </div>
      )}

      {/* ---- MOBILE ICON ROW ---- */}
      {user && (
        <div className="flex justify-around items-center py-2 border-t md:hidden">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `text-xl ${isActive ? "text-blue-500" : "text-gray-600"}`
            }
          >
            <BsHouseDoor />
          </NavLink>

          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `text-xl ${isActive ? "text-blue-500" : "text-gray-600"}`
            }
          >
            <BsChatDots />
          </NavLink>

          <NavLink
            to="/notifications"
            className="relative"
            onClick={refreshNotificationCount}
          >
            <BsBell
              size={22}
              className="text-gray-600 hover:text-blue-500 transition-colors"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `text-xl ${isActive ? "text-blue-500" : "text-gray-600"}`
            }
          >
            <FaUser />
          </NavLink>
        </div>
      )}

      {/* ---- DESKTOP/TABLET NAVBAR ---- */}
      <div className="hidden md:flex justify-between items-center px-10 py-3">
        {/* Left: Name + Search */}
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-3xl">
            resonance
          </Link>
          <div className="hidden md:block w-72">
            {/* ✅ Desktop Search Input */}
            <Search />
          </div>
        </div>

        {/* Middle: Navigation Links */}
        <div className="flex gap-6 items-center">
          {user && (
            <>
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-500 font-semibold"
                    : "text-gray-600 hover:text-blue-500"
                }
              >
                Newsfeed
              </NavLink>
              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  isActive
                    ? "text-blue-500 font-semibold"
                    : "text-gray-600 hover:text-blue-500"
                }
              >
                Messages
              </NavLink>
              <NavLink
                to="/notifications"
                className="relative"
                onClick={refreshNotificationCount}
              >
                <BsBell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </NavLink>
            </>
          )}
        </div>

        {/* Right: Theme + Profile/Login */}
        <div className="flex items-center gap-5">
          <ThemeToggle />
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
                className="mt-3 p-2 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="font-bold">
                  <Link to="/profile">{user.displayName ?? "Profile"}</Link>
                </li>
                <li>
                  <Link
                    to="/notifications"
                    onClick={refreshNotificationCount}
                    className="flex justify-between"
                  >
                    Notifications
                    {unreadCount > 0 && (
                      <span className="badge badge-primary">{unreadCount}</span>
                    )}
                  </Link>
                </li>
                <li className="bg-red-600 rounded text-white font-bold flex items-center gap-1">
                  <button onClick={handleLogout}>
                    Logout <FaArrowRightToBracket />
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <Link
              className="btn btn-neutral text-white rounded-full"
              to="/login"
            >
              Login / Signup
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
