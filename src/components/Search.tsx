import { useState, useEffect } from "react";
import { Link } from "react-router";
import { BsSearch } from "react-icons/bs";

interface User {
  _id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://resonance-social-server.vercel.app/search/users?q=${encodeURIComponent(query)}`
        );
        const data: User[] = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div className="relative w-full max-w-xs md:max-w-md lg:max-w-lg">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <BsSearch className="w-4 h-4 text-gray-400" />
      </div>
      
      {/* Search Input */}
      <input
        type="text"
        value={query}
        placeholder="Search..."
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        className="input input-bordered w-full rounded-full pl-10 pr-4 py-2 text-sm md:text-base"
      />

      {/* Search Results Dropdown */}
      {showDropdown && query && (
        <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-200">
          {loading && (
            <div className="p-3 text-center text-gray-500">
              <div className="loading loading-spinner loading-sm mr-2"></div>
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && (
            <p className="p-3 text-gray-500 text-center">No users found</p>
          )}
          {!loading &&
            results.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user.uid}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  setShowDropdown(false);
                  setQuery("");
                }}
              >
                <img
                  src={user.photoURL || "https://via.placeholder.com/40"}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {user.displayName || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}