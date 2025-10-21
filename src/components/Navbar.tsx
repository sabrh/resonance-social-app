import { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { BsBell, BsSearch } from "react-icons/bs";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { HiHome, HiUser, HiChatAlt2 } from "react-icons/hi";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext/AuthContext";
import Search from "./Search";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const authContext = useContext(AuthContext);
  
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showSearch, setShowSearch] = useState(false);


  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { user, signOutUser } = authContext;

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
        `https://resonance-social-server.vercel.app/notifications/${user?.uid}/unread-count`
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
        toast.success("Logged out successfully!");
        navigate("/");
        setUnreadCount(0);
      })
      .catch((error: unknown) => {
        console.error("Logout error:", error);
      });
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-base-100 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Search Section */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Logo */}
              <Link
                to="/"
                className="flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-primary-content font-bold text-xl sm:text-2xl hover:scale-105 transition-transform shadow-lg"
              >
                R
              </Link>

              {/* Desktop Search */}
              <div className="hidden md:block w-64 lg:w-80">
                <Search />
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="md:hidden btn btn-ghost btn-circle btn-sm"
              >
                <BsSearch size={20} />
              </button>
            </div>

            {/* Center Navigation - Desktop & Tablet */}
            {user && (
              <div className="hidden sm:flex items-center gap-1 md:gap-2 lg:gap-3 flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-3 md:px-5 lg:px-7 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                    }`
                  }
                >
                  <HiHome size={24} />
                  <span className="text-xs font-medium hidden lg:block">
                    Home
                  </span>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-3 md:px-5 lg:px-7 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                    }`
                  }
                >
                  <HiUser size={24} />
                  <span className="text-xs font-medium hidden lg:block">
                    Profile
                  </span>
                </NavLink>

                <NavLink
                  to="/messages"
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 px-3 md:px-5 lg:px-7 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-base-content/70 hover:text-base-content hover:bg-base-200"
                    }`
                  }
                >
                  <HiChatAlt2 size={24} />
                  <span className="text-xs font-medium hidden lg:block">
                    Messages
                  </span>
                </NavLink>
              </div>
            )}

            {/* Right Section */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Bell - Desktop/Tablet Only */}
              {user && (
                <Link
                  to="/notifications"
                  onClick={refreshNotificationCount}
                  className="hidden sm:flex btn btn-ghost btn-circle relative hover:bg-base-200"
                >
                  <BsBell size={22} className="text-base-content" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                /* Profile Dropdown */
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-ghost btn-circle avatar hover:scale-105 transition-transform"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-base-100">
                      <img
                        alt="User Avatar"
                        src={user.photoURL ?? "https://via.placeholder.com/150"}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="mt-3 p-2 shadow-xl menu dropdown-content bg-base-100 rounded-box w-56 border border-base-300"
                  >
                    <li className="menu-title px-4 py-2">
                      <span className="text-base font-semibold">
                        {user.displayName ?? "User"}
                      </span>
                    </li>
                    <div className="divider my-0"></div>

                    <li>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 py-3"
                      >
                        <HiUser size={20} />
                        <span>My Profile</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        to="/notifications"
                        onClick={refreshNotificationCount}
                        className="flex items-center gap-3 py-3"
                      >
                        <BsBell size={20} />
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <span className="badge badge-primary badge-sm ml-auto">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>

                    <div className="divider my-0"></div>

                    <li>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 py-3 text-error hover:bg-error/10"
                      >
                        <FaArrowRightToBracket size={20} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link
                  className="btn btn-primary btn-sm sm:btn-md text-primary-content rounded-full font-semibold"
                  to="/login"
                >
                  <span className="hidden sm:inline">Login / Signup</span>
                  <span className="sm:hidden">Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showSearch && (
            <div className="md:hidden pb-4 animate-fade-in">
              <Search />
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Navigation - Mobile Only */}
      {user && (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-300 safe-area-inset-bottom">
          <div className="flex items-center justify-around h-16 px-2">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
                  isActive ? "text-primary" : "text-base-content/70"
                }`
              }
            >
              <HiHome size={24} />
              <span className="text-xs font-medium">Home</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
                  isActive ? "text-primary" : "text-base-content/70"
                }`
              }
            >
              <HiUser size={24} />
              <span className="text-xs font-medium">Profile</span>
            </NavLink>

            <NavLink
              to="/messages"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
                  isActive ? "text-primary" : "text-base-content/70"
                }`
              }
            >
              <HiChatAlt2 size={24} />
              <span className="text-xs font-medium">Messages</span>
            </NavLink>

            <NavLink
              to="/notifications"
              onClick={refreshNotificationCount}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 relative ${
                  isActive ? "text-primary" : "text-base-content/70"
                }`
              }
            >
              <BsBell size={24} />
              <span className="text-xs font-medium">Alerts</span>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-2 bg-error text-error-content text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </NavLink>
          </div>
        </nav>
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
      {user && <div className="sm:hidden h-16"></div>}
    </>
  );
}
