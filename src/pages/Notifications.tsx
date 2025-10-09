// src/pages/Notifications.tsx - সম্পূর্ণ আপডেটেড
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext/AuthContext";
import { io } from "socket.io-client";
import { useNavigate } from "react-router";

type Notification = {
  _id: string;
  type: "like" | "comment" | "share";
  actorId: string;
  actorName: string;
  actorPhoto?: string;
  postId: string;
  postText?: string;
  commentText?: string;
  reactionType?: string;
  createdAt: string;
  read?: boolean;
};

const Notifications = () => {
  const { user } = useContext(AuthContext)!;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:3000/notifications/${user.uid}`);
        const data = await res.json();
        setNotifications(data);

        await fetch(`http://localhost:3000/notifications/${user.uid}/read`, {
          method: "PUT",
        });
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifications();

    const socket = io("http://localhost:3000");
    socket.emit("join_user", user.uid);

    socket.on("new_notification", (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    socket.on("notifications_marked_read", () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // ✅ নোটিফিকেশন ক্লিক করলে পোস্টে নিয়ে যাবে
  const handleNotificationClick = (postId: string) => {
    navigate(`/post/${postId}`);
  };

  // ✅ রিয়্যাক্ট টাইপ অনুযায়ী আইকন
  const getReactionIcon = (type?: string) => {
    switch (type) {
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  };

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
            className={`shadow rounded-lg p-3 flex gap-3 items-start cursor-pointer hover:bg-gray-50 transition-colors ${n.read ? "bg-white" : "bg-blue-50"
              }`}
            onClick={() => handleNotificationClick(n.postId)}
          >
            <img
              src={n.actorPhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt={n.actorName}
              className="h-10 w-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-semibold">{n.actorName}</span>{" "}
                {n.type === "like" && (
                  <>
                    <span className="mx-1">{getReactionIcon(n.reactionType)}</span>
                    reacted to your post
                  </>
                )}
                {n.type === "comment" && (
                  <>
                    commented:{" "}
                    <span className="italic text-gray-700">
                      "{n.commentText}"
                    </span>{" "}
                    on your post
                  </>
                )}
                {n.type === "share" && (
                  <>shared your post</>
                )}
              </p>
              {n.postText && (
                <p className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded">
                  "{n.postText.slice(0, 50)}..."
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
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