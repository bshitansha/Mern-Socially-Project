import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import Loading from "../components/Loading";
import ReelsViewer from "../components/ReelsViewer";
import { HeartIcon, CommentIcon } from "../components/Icons";

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

function Search() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [explorePosts, setExplorePosts] = useState([]);
  const [exploreLoading, setExploreLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  const fetchExplore = useCallback(async () => {
    try {
      setExploreLoading(true);
      const response = await api.get("/posts");
      setExplorePosts(response.data);
    } catch (err) {
      console.error("Explore fetch error:", err);
    } finally {
      setExploreLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExplore();
  }, [fetchExplore]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setUsers([]);
      setSearched(false);
      setError("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get(`/users/search?q=${encodeURIComponent(trimmed)}`);
        setUsers(response.data);
        setSearched(true);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to search users.");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const isSearching = query.trim().length > 0;

  return (
    <section className="page search-page">
      <div className="search-bar">
        <SearchIcon />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for people..."
          autoFocus
        />
      </div>

      {isSearching && (
        <>
          {loading && <Loading message="Searching..." />}
          {!loading && error && <div className="error-box">{error}</div>}

          {!loading && !error && searched && users.length === 0 && (
            <div className="empty-state">
              <h3>No users found</h3>
              <p>Try another username.</p>
            </div>
          )}

          <div className="search-results">
            {users.map((user) => (
              <Link key={user._id} to={`/profile/${user._id}`} className="user-result">
                <div className="avatar">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.username} />
                  ) : (
                    user.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="user-result-info">
                  <strong>{user.username}</strong>
                  <p>{user.bio || "No bio yet."}</p>
                </div>
                <ChevronIcon />
              </Link>
            ))}
          </div>
        </>
      )}

      {!isSearching && (
        <>
          <h2 className="explore-heading">Explore</h2>

          {exploreLoading && <Loading message="Loading explore feed..." />}

          {!exploreLoading && explorePosts.length === 0 && (
            <div className="empty-state">
              <h3>Nothing to explore yet</h3>
              <p>Posts will show up here once the community starts sharing.</p>
            </div>
          )}

          {!exploreLoading && explorePosts.length > 0 && (
            <div className="explore-grid">
              {explorePosts.map((post, index) => (
                <button key={post._id} className="explore-tile" onClick={() => setActiveIndex(index)}>
                  <img src={post.image || `https://picsum.photos/seed/${post._id}/500/500`} alt="" loading="lazy" />
                  <div className="explore-overlay">
                    <span className="explore-stat"><HeartIcon filled size={18} /> {post.likes?.length || 0}</span>
                    <span className="explore-stat"><CommentIcon size={18} /> {post.comments?.length || 0}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {activeIndex !== null && (
        <ReelsViewer posts={explorePosts} startIndex={activeIndex} onClose={() => setActiveIndex(null)} />
      )}
    </section>
  );
}

export default Search;