import { useState, useEffect } from "react";
import { Link } from "react-router";

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
          `http://localhost:3000/search/users?q=${encodeURIComponent(query)}`
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
      <input
        type="text"
        value={query}
        placeholder="Search..."
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        className="input input-bordered w-full rounded-full px-4 py-2 text-sm md:text-base"
      />

      {showDropdown && query && (
        <div className="absolute mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50">
          {loading && <p className="p-2 text-gray-500">Searching...</p>}
          {!loading && results.length === 0 && (
            <p className="p-2 text-gray-500">No results found</p>
          )}
          {!loading &&
            results.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user.uid}`}
                className="flex items-center gap-3 p-2 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {user.displayName || "No name"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
