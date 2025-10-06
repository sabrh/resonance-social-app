// src/components/Navbar.tsx
import { useContext, useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { BsBell } from "react-icons/bs";
import { AuthContext } from "../context/AuthContext/AuthContext";
import toast from "react-hot-toast";
import { FaArrowRightToBracket } from "react-icons/fa6";
import { io } from "socket.io-client";

export default function Navbar() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifCount, setNotifCount] = useState<number>(0);

  if (!authContext) {
    return <p>Loading...</p>;
  }

  const { user, signOutUser } = authContext;

  const handleLogout = () => {
    signOutUser()
      .then(() => {
        toast.success("Logged out successfully!");
        navigate("/");
      })
      .catch((error: unknown) => {
        console.error("Logout error:", error);
      });
  };

  // initial unread count fetch
  useEffect(() => {
    if (!user) {
      setNotifCount(0);
      return;
    }

    const fetchUnread = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notifications/unread/${user.uid}`);
        if (!res.ok) throw new Error("Failed to fetch unread count");
        const data = await res.json();
        setNotifCount(data.count ?? 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();

    // setup socket to listen for new notifications + mark-read events
    const socket = io("http://localhost:3000");
    socket.emit("join_user", user.uid);

    socket.on("new_notification", () => {
      // increment unread counter by 1 on new_notification
      setNotifCount((c) => c + 1);
    });

    socket.on("notifications_marked_read", () => {
      // server acknowledged marking as read — reset local count
      setNotifCount(0);
    });

    return () => {
      void socket.disconnect();
    };
  }, [user]);

  // when user clicks the bell (navigating to /notifications), mark all read
  const handleNotificationsClick = async () => {
    if (!user) return;
    try {
      await fetch(`http://localhost:3000/notifications/${user.uid}/read`, {
        method: "PUT",
      });
      // optimistically reset
      setNotifCount(0);
    } catch (err) {
      console.error("Error marking notifications read:", err);
    }
  };

  const links = (
    <>
      {user && (
        <>
          <li>
            <NavLink to="/home" className={({ isActive }) => (isActive ? "text-blue-400 underline-offset-4 font-bold" : "")}>
              Newsfeed
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" className={({ isActive }) => (isActive ? "text-blue-400 underline-offset-4 font-bold" : "")}>
              My Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages" className={({ isActive }) => (isActive ? "text-blue-400 underline-offset-4 font-bold" : "")}>
              Messages
            </NavLink>
          </li>
        </>
      )}
    </>
  );

  return (
    <div className="navbar bg-base-100/70 backdrop-blur-md shadow px-8 md:px-36 fixed top-0 left-0 w-full z-50">
      <div className="hidden md:navbar-start">
        <Link to="/" className="font-bold text-3xl flex items-center gap-2">resonance</Link>
      </div>

      <div className="navbar-center flex">
        <ul className="menu menu-horizontal px-1 md:gap-4 md:text-md">{links}</ul>
      </div>

      <div className="navbar-end ml-auto gap-4">
        {user ? (
          <>
            <Link to="/notifications" className="relative" onClick={handleNotificationsClick}>
              <BsBell size={25} />
              {notifCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </Link>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img alt="User Avatar" src={user.photoURL ?? "https://via.placeholder.com/150"} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-md dropdown-content bg-base-100 rounded-box w-52">
                <li className="font-bold"><Link to="/profile">{user.displayName ?? "Profile"}</Link></li>
                <li className="bg-red-600 rounded text-white p-1 font-bold flex items-center gap-1">
                  <button onClick={handleLogout}>Logout <FaArrowRightToBracket /></button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <Link className="btn btn-neutral text-white rounded-full mr-4" to="/login">Login / Signup</Link>
        )}
      </div>
    </div>
  );
}
