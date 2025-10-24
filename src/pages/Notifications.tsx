// src/pages/Notifications.tsx
import type { FC } from "react";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext/AuthContext";
import { Link } from "react-router";
import toast from "react-hot-toast";

type Notification = {
  _id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  postId: string;
  postText: string;
  type: "like" | "comment" | "reply" | "follow" | "share";
  message: string;
  commentText: string;
  isRead: boolean;
  createdAt: string;
};

interface NotificationsProps {
  onNotificationRead?: () => void;
}

const Notifications: FC<NotificationsProps> = ({ onNotificationRead }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const { user } = useContext(AuthContext)!;

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/notifications/${user?.uid}`
      );
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `http://localhost:3000/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://localhost:3000/notifications/${user?.uid}/read-all`, {
        method: "PUT",
      });

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      if (onNotificationRead) {
        onNotificationRead();
      }

      toast.success("All notifications marked as read");
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Handle reply to notification - FIXED VERSION
  const handleReply = async (notification: Notification) => {
    console.log("Replying to notification:", notification);

    if (!replyText.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setReplyLoading(true);
    try {
      // For all notification types, add a new comment mentioning the user
      const commentRes = await fetch(
        `http://localhost:3000/socialPost/${notification.postId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user?.uid,
            text: `@${notification.senderName} ${replyText}`,
            authorPhoto: user?.photoURL,
            authorEmail: user?.email,
            userName: user?.displayName,
            senderId: user?.uid,
          }),
        }
      );

      if (!commentRes.ok) {
        const errorData = await commentRes.json();
        throw new Error(errorData.error || "Failed to add comment");
      }

      // Create a new notification for the original sender
      try {
        await fetch(`http://localhost:3000/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipientId: notification.senderId,
            senderId: user?.uid,
            senderName: user?.displayName,
            senderPhoto: user?.photoURL,
            postId: notification.postId,
            postText: notification.postText,
            type: "reply",
            commentText: replyText,
          }),
        });
      } catch (notifErr) {
        console.warn("Failed to create notification, but reply was sent");
      }

      // Reset reply state
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply sent successfully!");
    } catch (err: any) {
      console.error("Failed to send reply:", err);
      toast.error(err.message || "Failed to send reply");
    } finally {
      setReplyLoading(false);
    }
  };

  const startReply = (notificationId: string) => {
    setReplyingTo(notificationId);
    setReplyText("");
    // Mark as read when starting to reply
    const notification = notifications.find((n) => n._id === notificationId);
    if (notification && !notification.isRead) {
      markAsRead(notificationId);
    }
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyText("");
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen mt-16">
        <div className="text-lg">Loading notifications...</div>
      </div>
    );
  }

  return (
   <div className="max-w-2xl mx-auto p-4 mt-16">
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-base-content">Notifications</h1>
    {notifications.some((n) => !n.isRead) && (
      <button
        onClick={markAllAsRead}
        className="btn btn-primary text-primary-content px-4 py-2 rounded hover:bg-primary-focus transition-colors"
      >
        Mark all as read
      </button>
    )}
  </div>

  {notifications.length === 0 ? (
    <div className="text-center text-base-content/70 py-8">
      <p className="text-lg">No notifications yet</p>
      <p className="text-sm mt-2">
        When someone interacts with your posts, you'll see it here.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={`p-4 border rounded-lg transition-all duration-200 ${
            notification.isRead
              ? "bg-base-100 border-base-300"
              : "bg-primary/10 border-primary/20 shadow-sm"
          } hover:shadow-md`}
        >
          <div className="flex items-start gap-3">
            <Link to={`/profile/${notification.senderId}`}>
              <img
                src={notification.senderPhoto || "/default-avatar.png"}
                alt={notification.senderName}
                className="w-12 h-12 rounded-full cursor-pointer object-cover border-2 border-base-300"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm">
                    <Link
                      to={`/profile/${notification.senderId}`}
                      className="font-semibold hover:underline text-base-content"
                    >
                      {notification.senderName}
                    </Link>
                    <span className="text-base-content/70">
                      {" "}
                      {notification.message}
                    </span>
                  </p>

                  {notification.commentText && (
                    <div className="mt-2 p-3 bg-base-200 rounded-lg border border-base-300">
                      <p className="text-sm text-base-content/70 italic">
                        "{notification.commentText}"
                      </p>
                    </div>
                  )}

                  {notification.postText && (
                    <p className="text-base-content/50 text-xs mt-2 line-clamp-2">
                      Post: {notification.postText}
                    </p>
                  )}

                  <p className="text-base-content/40 text-xs mt-2">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className="w-3 h-3 bg-primary rounded-full ml-2 flex-shrink-0 mt-1"></div>
                )}
              </div>

              {/* Reply section - FIXED */}
              {(notification.type === "comment" ||
                notification.type === "reply" ||
                notification.type === "like") && (
                <div className="mt-3">
                  {replyingTo === notification._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${notification.senderName}...`}
                        className="w-full border border-base-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-base-100 text-base-content"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={cancelReply}
                          className="px-4 py-2 text-sm border border-base-300 rounded-lg hover:bg-base-200 transition-colors text-base-content"
                          disabled={replyLoading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(notification)}
                          className="px-4 py-2 text-sm bg-primary text-primary-content rounded-lg hover:bg-primary-focus disabled:bg-primary/30 disabled:cursor-not-allowed transition-colors"
                          disabled={replyLoading || !replyText.trim()}
                        >
                          {replyLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-primary-content border-t-transparent rounded-full animate-spin"></div>
                              Sending...
                            </span>
                          ) : (
                            "Send Reply"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => startReply(notification._id)}
                        className="text-primary hover:text-primary-focus text-sm font-medium transition-colors"
                      >
                        Reply
                      </button>
                      <Link
                        to={`/post/${notification.postId}`}
                        className="text-base-content/70 hover:text-base-content text-sm transition-colors"
                      >
                        View Post
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* For follow notifications */}
              {notification.type === "follow" && (
                <div className="flex gap-3 mt-2">
                  <Link
                    to={`/profile/${notification.senderId}`}
                    className="text-primary hover:text-primary-focus text-sm font-medium transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => startReply(notification._id)}
                    className="text-base-content/70 hover:text-base-content text-sm transition-colors"
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
  );
};

export default Notifications;
