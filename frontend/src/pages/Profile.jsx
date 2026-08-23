import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Loading from "../components/Loading";

const Profile = () => {
  const { id } = useParams();
  const { user: loggedInUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setError("");
      const response = await api.get(`/users/${id}`);
      setProfile(response.data.user);
      setPosts(response.data.posts || []);
    } catch (err) {
      console.error("Profile error:", err);
      setError(err.response?.data?.message || "Unable to load this profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const isOwnProfile = loggedInUser && loggedInUser.id === id;

  if (loading) {
    return (
      <section className="page">
        <Loading message="Loading profile..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="page">
        <div className="error-box">{error}</div>
      </section>
    );
  }

  if (!profile) return null;

  return (
    <section className="page">
      <div className="profile-card">
        <div className="profile-avatar">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt={profile.username} />
          ) : (
            profile.username?.charAt(0).toUpperCase()
          )}
        </div>

        <div className="profile-info">
          <h1>{profile.username}</h1>
          <p>{profile.bio || "No bio yet."}</p>

          {isOwnProfile && (
            <Link to="/profile/edit" className="secondary-button">
              Edit Profile
            </Link>
          )}
        </div>
      </div>

      <div className="profile-section">
        <h2>Posts</h2>

        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>
              {isOwnProfile
                ? "Share your first post from the Create Post page."
                : "This user hasn't posted anything yet."}
            </p>
          </div>
        ) : (
          <div className="post-list">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                refreshPosts={fetchProfile}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;