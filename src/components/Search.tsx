import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";


export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ users: any[]; posts: any[] }>({
    users: [],
    posts: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length === 0) {
      setResults({ users: [], posts: [] });
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:3000/search?query=${value}`
      );
      setResults(res.data);
    } catch (error) {
      console.error("Search error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full md:w-80">
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Search users or posts..."
        className="input input-bordered w-full rounded-full px-4"
      />

      {/* Results Dropdown */}
      {query && (results?.users?.length > 0 || results.posts.length > 0) && (
        <div className="absolute top-12 left-0 w-full bg-white shadow-md rounded-lg z-50 max-h-80 overflow-y-auto">
          {loading && <p className="p-2 text-sm">Searching...</p>}
          console.log(users)

          {/* Users */}
          {results.users.length > 0 && (
            <div className="border-b">
              <h3 className="font-bold p-2 text-sm">Users</h3>
              {results.users.map((user) => (
                <Link
                  key={user.uid}
                  to={`/user/${user.uid}`}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100"
                >
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{user.displayName || user.email}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Posts */}
          {results.posts.length > 0 && (
            <div>
              <h3 className="font-bold p-2 text-sm">Posts</h3>
              {results.posts.map((post, idx) => (
                <Link
                  key={idx}
                  to={`/post/${post._id}`}
                  className="block p-2 hover:bg-gray-100"
                >
                  <p className="text-sm">{post.text.slice(0, 50)}...</p>
                  <span className="text-xs text-gray-500">
                    by {post.userName}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
