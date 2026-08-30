import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { HeartIcon, CommentIcon, ShareIcon, CloseIcon } from "./Icons";

const fallbackImage = (post) => post.image || `https://picsum.photos/seed/${post._id}/900/1200`;

function ReelSlide({ post, onLikeToggle }) {
  const { user } = useAuth();

  const likes = post.likes || [];
  const hasLiked =
    !!user &&
    likes.some((entry) => {
      const likeId = typeof entry === "object" && entry !== null ? entry._id : entry;
      return likeId?.toString() === user.id;
    });

  return (
    <div className="reel-slide">
      <img src={fallbackImage(post)} alt="" className="reel-media" loading="lazy" />
      <div className="reel-gradient" />

      <div className="reel-author">
        <div className="avatar">
          {post.author?.profilePicture ? (
            <img src={post.author.profilePicture} alt={post.author.username} />
          ) : (
            post.author?.username?.charAt(0).toUpperCase()
          )}
        </div>
        <strong>{post.author?.username}</strong>
      </div>

      <p className="reel-caption">{post.content}</p>

      <div className="reel-actions">
        <button className={hasLiked ? "reel-action-btn liked" : "reel-action-btn"} onClick={() => onLikeToggle(post)}>
          <HeartIcon filled={hasLiked} size={28} />
          <span>{likes.length}</span>
        </button>

        <button className="reel-action-btn" onClick={() => onLikeToggle(post, "comment")}>
          <CommentIcon size={28} />
          <span>{post.comments?.length || 0}</span>
        </button>

        <button
          className="reel-action-btn"
          onClick={async () => {
            const url = `${window.location.origin}/posts/${post._id}`;
            try {
              if (navigator.share) await navigator.share({ url });
              else {
                await navigator.clipboard.writeText(url);
                alert("Link copied to clipboard.");
              }
            } catch {
              // cancelled
            }
          }}
        >
          <ShareIcon size={28} />
        </button>
      </div>
    </div>
  );
}

function ReelsViewer({ posts, startIndex = 0, onClose }) {
  const [localPosts, setLocalPosts] = useState(posts);
  const { token } = useAuth();
  const navigate = useNavigate();
  const slideRefs = useRef([]);

  useEffect(() => {
    const node = slideRefs.current[startIndex];
    if (node) node.scrollIntoView({ block: "start" });
  }, [startIndex]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleLikeToggle = async (post, action) => {
    if (action === "comment") {
      onClose();
      navigate(`/posts/${post._id}`);
      return;
    }

    if (!token) {
      alert("Please login to like posts.");
      return;
    }

    try {
      await api.put(`/posts/${post._id}/like`);
      const response = await api.get(`/posts/${post._id}`);
      setLocalPosts((current) => current.map((item) => (item._id === post._id ? response.data : item)));
    } catch (error) {
      alert(error.response?.data?.message || "Unable to like post.");
    }
  };

  return (
    <div className="reels-overlay">
      <button className="reels-close" onClick={onClose} aria-label="Close">
        <CloseIcon size={26} />
      </button>

      <div className="reels-scroll">
        {localPosts.map((post, index) => (
          <div key={post._id} ref={(node) => (slideRefs.current[index] = node)} className="reel-slide-wrap">
            <ReelSlide post={post} onLikeToggle={handleLikeToggle} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReelsViewer;