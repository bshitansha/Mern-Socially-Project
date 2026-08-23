import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";

function PostCard({
  post,
  refreshPosts,
}) {
  const {
    user,
    token,
  } = useAuth();

  const [editing, setEditing] =
    useState(false);

  const [editContent,
    setEditContent] =
    useState(post.content);

  const [comment,
    setComment] =
    useState("");

  const [commentLoading,
    setCommentLoading] =
    useState(false);

  const [actionLoading,
    setActionLoading] =
    useState(false);

  const isOwner =
    user &&
    post.author?._id ===
      user.id;

  const hasLiked =
    user &&
    post.likes?.some(
      (likeId) =>
        likeId.toString() ===
        user.id
    );

  const handleLike =
    async () => {
      if (!token) {
        alert(
          "Please login to like posts."
        );
        return;
      }

      try {
        setActionLoading(true);

        await api.put(
          `/posts/${post._id}/like`
        );

        await refreshPosts();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Unable to like post."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleDelete =
    async () => {
      if (!token) return;

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this post?"
        );

      if (!confirmed) return;

      try {
        setActionLoading(true);

        await api.delete(
          `/posts/${post._id}`
        );

        await refreshPosts();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Unable to delete post."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleUpdate =
    async () => {
      if (
        !editContent.trim()
      ) {
        return;
      }

      try {
        setActionLoading(true);

        await api.put(
          `/posts/${post._id}`,
          {
            content:
              editContent.trim(),
          }
        );

        setEditing(false);

        await refreshPosts();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Unable to update post."
        );
      } finally {
        setActionLoading(false);
      }
    };

  const handleComment =
    async (event) => {
      event.preventDefault();

      if (!token) {
        alert(
          "Please login to comment."
        );
        return;
      }

      if (
        !comment.trim()
      ) {
        return;
      }

      try {
        setCommentLoading(true);

        await api.post(
          `/posts/${post._id}/comments`,
          {
            text:
              comment.trim(),
          }
        );

        setComment("");

        await refreshPosts();
      } catch (error) {
        alert(
          error.response?.data
            ?.message ||
            "Unable to add comment."
        );
      } finally {
        setCommentLoading(false);
      }
    };

  return (
    <article className="post-card">

      <div className="post-top">

        <Link
          to={`/profile/${post.author?._id}`}
          className="author-info"
        >

          <div className="avatar">
            {post.author?.username
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {
                post.author
                  ?.username
              }
            </strong>

            <small>
              {new Date(
                post.createdAt
              ).toLocaleString()}
            </small>
          </div>

        </Link>

      </div>

      {editing ? (
        <div className="edit-post">

          <textarea
            value={editContent}
            onChange={(event) =>
              setEditContent(
                event.target.value
              )
            }
            maxLength={1000}
          />

          <div className="inline-actions">

            <button
              className="primary-button"
              onClick={
                handleUpdate
              }
              disabled={
                actionLoading
              }
            >
              Save
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                setEditing(false);
                setEditContent(
                  post.content
                );
              }}
            >
              Cancel
            </button>

          </div>

        </div>
      ) : (
        <p className="post-content">
          {post.content}
        </p>
      )}

      <div className="post-stats">

        <button
          className={
            hasLiked
              ? "stat-button liked"
              : "stat-button"
          }
          onClick={
            handleLike
          }
          disabled={
            actionLoading
          }
        >
          ♥ {post.likes?.length || 0}
        </button>

        <span className="comment-count">
          💬{" "}
          {post.comments?.length ||
            0}
        </span>

      </div>

      {isOwner &&
        !editing && (
          <div className="post-owner-actions">

            <button
              className="edit-button"
              onClick={() =>
                setEditing(true)
              }
            >
              Edit
            </button>

            <button
              className="delete-button"
              onClick={
                handleDelete
              }
              disabled={
                actionLoading
              }
            >
              Delete
            </button>

          </div>
        )}

      {post.comments?.length >
        0 && (
        <div className="comments">

          {post.comments.map(
            (item) => (
              <div
                className="comment"
                key={item._id}
              >

                <div className="small-avatar">
                  {item.author
                    ?.username
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {
                      item.author
                        ?.username
                    }
                  </strong>

                  <p>
                    {item.text}
                  </p>
                </div>

              </div>
            )
          )}

        </div>
      )}

      {user && (
        <form
          className="comment-form"
          onSubmit={
            handleComment
          }
        >

          <input
            type="text"
            value={comment}
            onChange={(event) =>
              setComment(
                event.target.value
              )
            }
            placeholder="Write a comment..."
            maxLength={500}
          />

          <button
            type="submit"
            disabled={
              commentLoading
            }
          >
            {commentLoading
              ? "..."
              : "Comment"}
          </button>

        </form>
      )}

    </article>
  );
}

export default PostCard;