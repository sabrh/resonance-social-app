import React, { useState } from "react";
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
  // console.log("rep", reply, "tr", reply.authorEmail === user?.email);

  return (
    <div className="ml-8 mt-2 space-y-2">
      <div className="flex gap-2">
        <img
          src={reply.authorPhoto || "/default-avatar.png"}
          className="h-8 w-8 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm">{reply.authorName}</p>
            <p className="text-xs text-gray-400">
              {reply.createdAt
                ? new Date(reply.createdAt).toLocaleString()
                : ""}
            </p>
          </div>
          <p className="text-sm">{reply.text}</p>

          <div className="flex gap-2 text-xs mt-1">
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
              className="text-gray-500 hover:underline"
            >
              Reply
            </button>
          </div>

          {/* Conditional input for replying */}
          {activeReplyId === reply._id && (
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
                if (e.key === "Enter" && (replyTexts[reply._id] || "").trim()) {
                  await handleAddReply(
                    commentId,
                    replyTexts[reply._id],
                    reply._id
                  );
                  setReplyTexts((prev) => ({ ...prev, [reply._id]: "" }));
                  setActiveReplyId(null); // hide input after submitting
                }
              }}
              className="border rounded px-2 py-1 w-full text-sm mt-1"
            />
          )}
        </div>
      </div>

      {/* Render nested replies recursively */}
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
