import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import type { Comment } from "../PostCard";

type ReplyItemProps = {
  reply: Comment;
  commentId: string;
  parentReplyId?: string;
  user: {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  handleAddReply: (
    commentId: string,
    text: string,
    parentReplyId?: string
  ) => Promise<void>;
  handleEditReply: (commentId: string, replyId: string) => void;
  handleDeleteReply: (commentId: string, replyId: string) => void;
  replyTexts: { [key: string]: string };
  setReplyTexts: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
};

const ReplyItem = ({
  reply,
  commentId,
  user,
  handleAddReply,
  handleEditReply,
  handleDeleteReply,
  replyTexts,
  setReplyTexts,
}: ReplyItemProps) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  return (
    <div className="mt-2 ml-8 sm:ml-10 overflow-x-hidden">
      <div className="flex items-start gap-2">
        {/* Profile Photo */}
        <img
          src={reply.authorPhoto || "/default-avatar.png"}
          alt={reply.authorName}
          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
        />

        {/* Reply Content Box */}
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-3 py-2 shadow-sm w-full break-words">
            <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {reply.authorName}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 break-words">
              {reply.parentUser && (
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  @{reply.parentUser}{" "}
                </span>
              )}
              {reply.text}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {reply.createdAt
                ? new Date(reply.createdAt).toLocaleString()
                : ""}
            </span>

            {reply.authorEmail === user?.email && (
              <>
                <button
                  onClick={() => handleEditReply(commentId, reply._id)}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteReply(commentId, reply._id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </>
            )}

            <button
              onClick={() =>
                setActiveReplyId(activeReplyId === reply._id ? null : reply._id)
              }
              className="hover:underline"
            >
              Reply
            </button>
          </div>

          {/* Reply Input */}
          {activeReplyId === reply._id && (
            <div className="flex items-center gap-2 mt-2 ml-6 sm:ml-8">
              <img
                src={user?.photoURL || "/default-avatar.png"}
                alt="user"
                className="h-7 w-7 rounded-full object-cover"
              />
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyTexts[reply._id] || ""}
                onChange={(e) =>
                  setReplyTexts((prev) => ({
                    ...prev,
                    [reply._id]: e.target.value,
                  }))
                }
                onKeyDown={async (e) => {
                  if (
                    e.key === "Enter" &&
                    (replyTexts[reply._id] || "").trim()
                  ) {
                    await handleAddReply(
                      commentId,
                      replyTexts[reply._id],
                      reply._id
                    );
                    setReplyTexts((prev) => ({ ...prev, [reply._id]: "" }));
                    setActiveReplyId(null);
                  }
                }}
                className="bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 flex-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={async () => {
                  if ((replyTexts[reply._id] || "").trim()) {
                    await handleAddReply(
                      commentId,
                      replyTexts[reply._id],
                      reply._id
                    );
                    setReplyTexts((prev) => ({ ...prev, [reply._id]: "" }));
                    setActiveReplyId(null);
                  }
                }}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50"
                disabled={!replyTexts[reply._id]?.trim()}
              >
                <IoSend size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {reply.replies &&
        reply.replies.length > 0 &&
        reply.replies.map((nested) => (
          <ReplyItem
            key={nested._id}
            reply={nested}
            commentId={commentId}
            user={user}
            handleAddReply={handleAddReply}
            handleEditReply={handleEditReply}
            handleDeleteReply={handleDeleteReply}
            replyTexts={replyTexts}
            setReplyTexts={setReplyTexts}
          />
        ))}
    </div>
  );
};

export default ReplyItem;
