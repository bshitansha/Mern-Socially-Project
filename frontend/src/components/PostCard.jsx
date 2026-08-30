import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, MoreIcon } from "./Icons";

const CAPTION_LIMIT = 140;

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const steps = [["y", 31536000], ["w", 604800], ["d", 86400], ["h", 3600], ["m", 60]];
  for (const [label, secs] of steps) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value}${label}`;
  }
  return "just now";
}

function PostCard({ post, refreshPosts }) {
  const { user, token } = useAuth();

  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandCaption, setExpandCaption] = useState(false);
  const [saved, setSaved] = useState(false);
  const [burst, setBurst] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isOwner = user && post.author?._id === user.id;

  const likes = post.likes || [];
  const hasLiked =
    !!user &&
    likes.some((entry) => {
      const likeId = typeof entry === "object" && entry !== null ? entry._id : entry;
      return likeId?.toString() === user.id;
    });

  const likerNames = likes
    .map((entry) => (typeof entry === "object" && entry !== null ? entry.username : null))
    .filter(Boolean);

  const likedByText = (() => {
    if (likes.length === 0) return null;
    if (hasLiked) {
      return likes.length === 1
        ? "Liked by you"
        : `Liked by you and ${likes.length - 1} other${likes.length - 1 > 1 ? "s" : ""}`;
    }
    if (likerNames.length === 0) {
      return `${likes.length} like${likes.length > 1 ? "s" : ""}`;
    }
    return likes.length === 1
      ? `Liked by ${likerNames[0]}`
      : `Liked by ${likerNames[0]} and ${likes.length - 1} other${likes.length - 1 > 1 ? "s" : ""}`;
  })();

  const comments = post.comments || [];
  const visibleComments = showAllComments ? comments : comments.slice(-2);

  const caption = post.content || "";
  const captionIsLong = caption.length > CAPTION_LIMIT;
  const captionToShow = !captionIsLong || expandCaption ? caption : `${caption.slice(0, CAPTION_LIMIT)}…`;

  const runLike = async () => {
    if (!token) {
      alert("Please login to like posts.");
      return;
    }
    try {
      setActionLoading(true);
      await api.put(`/posts/${post._id}/like`);
      await refreshPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to like post.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDoubleClickMedia = () => {
    if (!hasLiked) runLike();
    setBurst(true);
    setTimeout(() => setBurst(false), 700);
  };

  const handleDelete = async () => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setActionLoading(true);
      await api.delete(`/posts/${post._id}`);
      await refreshPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to delete post.");
    } finally {
      setActionLoading(false);
      setMenuOpen(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      setActionLoading(true);
      await api.put(`/posts/${post._id}`, { content: editContent.trim() });
      setEditing(false);
      await refreshPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update post.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!token) {
      alert("Please login to comment.");
      return;
    }
    if (!comment.trim()) return;
    try {
      setCommentLoading(true);
      await api.post(`/posts/${post._id}/comments`, { text: comment.trim() });
      setComment("");
      setShowAllComments(true);
      await refreshPosts();
    } catch (error) {
      alert(error.response?.data?.message || "Unable to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${post._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Check out this post", url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard.");
      }
    } catch {
      // share sheet cancelled — ignore
    }
  };

  return (
    <article className="post-card">
      <div className="post-header">
        <Link to={`/profile/${post.author?._id}`} className="author-info">
          <div className="avatar">
            {post.author?.profilePicture ? (
              <img src={post.author.profilePicture} alt={post.author.username} />
            ) : (
              post.author?.username?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="author-meta">
            <strong>{post.author?.username}</strong>
            <span className="meta-dot">&middot;</span>
            <span className="post-time">{timeAgo(post.createdAt)}</span>
          </div>
        </Link>

        {isOwner && !editing && (
          <div className="post-menu" ref={menuRef}>
            <button className="menu-trigger" onClick={() => setMenuOpen((open) => !open)} aria-label="Post options">
              <MoreIcon />
            </button>
            {menuOpen && (
              <div className="menu-dropdown">
                <button onClick={() => { setEditing(true); setMenuOpen(false); }}>Edit post</button>
                <button className="danger" onClick={handleDelete} disabled={actionLoading}>Delete post</button>
              </div>
            )}
          </div>
        )}
      </div>

      {post.image && (
        <div className="post-media" onDoubleClick={handleDoubleClickMedia}>
          <img src={post.image} alt="" loading="lazy" />
          {burst && (
            <span className="like-burst">
              <HeartIcon filled size={84} />
            </span>
          )}
        </div>
      )}

      <div className="post-actions">
        <button className={hasLiked ? "icon-button liked" : "icon-button"} onClick={runLike} disabled={actionLoading} aria-label="Like post">
          <HeartIcon filled={hasLiked} />
        </button>

        <button className="icon-button" onClick={() => document.getElementById(`comment-input-${post._id}`)?.focus()} aria-label="Comment">
          <CommentIcon />
        </button>

        <button className="icon-button" onClick={handleShare} aria-label="Share post">
          <ShareIcon />
        </button>

        <button
          className={saved ? "icon-button liked save-button" : "icon-button save-button"}
          onClick={() => setSaved((value) => !value)}
          aria-label="Save post"
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      {likedByText && <p className="liked-by">{likedByText}</p>}

      {editing ? (
        <div className="edit-post">
          <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} maxLength={1000} />
          <div className="inline-actions">
            <button className="primary-button" onClick={handleUpdate} disabled={actionLoading}>Save</button>
            <button className="secondary-button" onClick={() => { setEditing(false); setEditContent(post.content); }}>Cancel</button>
          </div>
        </div>
      ) : (
        caption && (
          <p className="caption">
            <Link to={`/profile/${post.author?._id}`}><strong>{post.author?.username}</strong></Link>{" "}
            {captionToShow}{" "}
            {captionIsLong && (
              <button className="text-link" onClick={() => setExpandCaption((value) => !value)}>
                {expandCaption ? "less" : "more"}
              </button>
            )}
          </p>
        )
      )}

      {comments.length > 0 && (
        <div className="comments">
          {comments.length > 2 && !showAllComments && (
            <button className="view-comments-btn" onClick={() => setShowAllComments(true)}>
              View all {comments.length} comments
            </button>
          )}

          {visibleComments.map((item) => (
            <div className="comment" key={item._id}>
              <div className="small-avatar">
                {item.author?.profilePicture ? (
                  <img src={item.author.profilePicture} alt={item.author.username} />
                ) : (
                  item.author?.username?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <strong>{item.author?.username}</strong>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {user && (
        <form className="comment-form" onSubmit={handleComment}>
          <input
            id={`comment-input-${post._id}`}
            type="text"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Add a comment..."
            maxLength={500}
          />
          <button type="submit" disabled={commentLoading || !comment.trim()}>
            {commentLoading ? "..." : "Post"}
          </button>
        </form>
      )}
    </article>
  );
}

export default PostCard;