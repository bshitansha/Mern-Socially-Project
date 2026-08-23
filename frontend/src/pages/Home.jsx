import { useCallback, useEffect, useState } from "react";
import api from "../api";
import PostCard from "../components/PostCard";
import Loading from "../components/Loading";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      setError("");
      const response = await api.get("/posts");
      setPosts(response.data);
    } catch (err) {
      console.error("Home page error:", err);
      setError("Posts could not be loaded. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Home</h1>
          <p>See what the community is sharing.</p>
        </div>
      </div>

      {loading && <Loading message="Loading posts..." />}

      {!loading && error && <div className="error-box">{error}</div>}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <h3>No posts yet</h3>
          <p>Be the first to share something.</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} refreshPosts={fetchPosts} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Home;