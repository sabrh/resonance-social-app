// src/pages/Notifications.tsx
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext/AuthContext";
import { io } from "socket.io-client";
import { Link } from "react-router";

type Notification = {
  _id: string;
  type: "like" | "comment" | "share";
  actorId: string;
  actorName: string;
  actorPhoto?: string;
  postId: string;
  postText?: string;       // 🔹 পোস্টের কিছু টেক্সট/প্রিভিউ
  commentText?: string;    // 🔹 কমেন্টের টেক্সট
  createdAt: string;
  read?: boolean;
};

const Notifications = () => {
  const { user } = useContext(AuthContext)!;
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;

    // fetch all notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notifications/${user.uid}`);
        const data = await res.json();
        setNotifications(data);

        // mark all as read once page opened
        await fetch(`http://localhost:3000/notifications/${user.uid}/read`, {
          method: "PUT",
        });
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifications();

    // socket setup
    const socket = io("http://localhost:3000");
    socket.emit("join_user", user.uid);

    socket.on("new_notification", (notif: Notification) => {
      // prepend new notification
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on("notifications_marked_read", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });

    return () => {
      void socket.disconnect();
    };
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications yet.</p>
      )}

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n._id}
            className={`shadow rounded-lg p-3 flex gap-3 items-start ${n.read ? "bg-white" : "bg-blue-50"
              }`}
          >
            <img
              src={
                n.actorPhoto ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt={n.actorName}
              className="h-10 w-10 rounded-full"
            />
            <div>
              <p className="text-sm">
                <span className="font-semibold">{n.actorName}</span>{" "}
                {n.type === "like" && (
                  <>
                    liked your post{" "}
                    <Link
                      to={`/post/${n.postId}`}
                      className="text-blue-600 underline"
                    >
                      {n.postText ? `"${n.postText.slice(0, 20)}..."` : ""}
                    </Link>
                  </>
                )}
                {n.type === "comment" && (
                  <>
                    commented:{" "}
                    <span className="italic text-gray-700">
                      "{n.commentText}"
                    </span>{" "}
                    on your post{" "}
                    <Link
                      to={`/post/${n.postId}`}
                      className="text-blue-600 underline"
                    >
                      {n.postText ? `"${n.postText.slice(0, 20)}..."` : ""}
                    </Link>
                  </>
                )}
                {n.type === "share" && (
                  <>
                    shared your post{" "}
                    <Link
                      to={`/post/${n.postId}`}
                      className="text-blue-600 underline"
                    >
                      {n.postText ? `"${n.postText.slice(0, 20)}..."` : ""}
                    </Link>
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
