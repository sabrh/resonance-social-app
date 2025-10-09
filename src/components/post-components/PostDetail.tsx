// src/pages/PostDetail.tsx - নতুন ফাইল
import { useParams, Link } from "react-router";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext/AuthContext";
import type { Post } from "../../types/post";
import PostCard from "./PostCard";
// import { AuthContext } from "../context/AuthContext/AuthContext";
// import type { Post } from "../types/post";
// import PostCard from "../components/PostCard";

const PostDetail = () => {
    const { postId } = useParams();
    const { user } = useContext(AuthContext)!;
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`http://localhost:3000/socialPost/${postId}`);
                if (!res.ok) throw new Error('Post not found');
                const data = await res.json();
                setPost(data);
            } catch (err) {
                console.error(err);
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
    }, [postId]);

    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error) return <div className="text-center text-red-500 mt-6">{error}</div>;
    if (!post) return <div className="text-center mt-6">Post not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="max-w-2xl mx-auto px-4">
                <Link
                    to="/notifications"
                    className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6 transition-colors"
                >
                    <span>←</span> Back to Notifications
                </Link>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* নোটিফিকেশন থেকে আসলে শুধু এই পোস্টটি দেখাবে */}
                    <PostCard
                        post={post}
                        currentUserId={user?.uid || ""}
                    />
                </div>

                {/* অন্যান্য সাজেশন */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">More Posts</h3>
                    <p className="text-gray-500 text-center py-4">
                        Other posts would appear here in a real application
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;