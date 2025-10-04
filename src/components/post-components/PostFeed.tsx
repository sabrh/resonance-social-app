import  { type FC } from "react";

type Post = {
  userId: string;  // added for userId
  username: string;
  profilePic: string;
  postId: string;
  content: string;
  media?: string;
  timestamp: string;
  likes: number;
  comments: number;
  hashtags: string[];
};

type PostFeedProps = {
  posts: Post[];
};

const PostFeed: FC<PostFeedProps> = ({ posts }) => {
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.postId}
          className="bg-white shadow rounded-lg p-4 max-w-xl mx-auto"
        >
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={post.profilePic}
              alt={post.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold">{post.username}</h3>
              <p className="text-xs text-gray-500">
                {new Date(post.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Post Content */}
          <p className="mb-3">{post.content}</p>

          {/* Post Media */}
          {post.media && (
            <img
              src={post.media}
              alt="post media"
              className="w-full max-h-80 object-cover rounded-lg mb-3"
            />
          )}

          {/* Hashtags */}
          <div className="mb-3">
            {post.hashtags.map((tag) => (
              <span
                key={tag}
                className="text-blue-500 mr-2 cursor-pointer hover:underline"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Like & Comment Section */}
          <div className="flex justify-between text-sm text-gray-600">
            <span>❤️ {post.likes}</span>
            <span>💬 {post.comments}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostFeed;
