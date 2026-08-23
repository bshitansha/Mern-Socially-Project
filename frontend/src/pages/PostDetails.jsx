import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import PostCard from "../components/PostCard";
import Loading from "../components/Loading";

const PostDetails = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPost = useCallback(async () => {
    try {
      setError("");
      const response = await api.get(`/posts/${id}`);
      setPost(response.data);
    } catch (err) {
      console.error("Post details error:", err);
      setError(err.response?.data?.message || "Unable to load this post.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Post</h1>
          <p>
            <Link to="/">&larr; Back to feed</Link>
          </p>
        </div>
      </div>

      {loading && <Loading message="Loading post..." />}

      {!loading && error && <div className="error-box">{error}</div>}

      {!loading && !error && post && (
        <div className="post-list">
          <PostCard post={post} refreshPosts={fetchPost} />
        </div>
      )}
    </section>
  );
};

export default PostDetails;