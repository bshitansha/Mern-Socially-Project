import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";

function CreatePost() {
  const {
    user,
  } = useAuth();

  const [content,
    setContent] =
    useState("");

  const [error,
    setError] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const navigate =
    useNavigate();

  if (!user) {
    return null;
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        !content.trim()
      ) {
        setError(
          "Post content cannot be empty."
        );
        return;
      }

      try {
        setLoading(true);

        await api.post(
          "/posts",
          {
            content:
              content.trim(),
          }
        );

        navigate("/");
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to create post."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="form-page">

      <div className="form-card">

        <h1>
          Create a Post
        </h1>

        <p className="form-description">
          Share something with the
          community.
        </p>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >

          <label>
            Your post
          </label>

          <textarea
            className="large-textarea"
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            placeholder="What's on your mind?"
            maxLength={1000}
          />

          <div className="form-bottom">

            <span>
              {content.length}/1000
            </span>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Publishing..."
                : "Publish Post"}
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}

export default CreatePost;