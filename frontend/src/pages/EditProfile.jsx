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

function EditProfile() {
  const {
    user,
    updateUser,
  } = useAuth();

  const navigate =
    useNavigate();

  const [username,
    setUsername] =
    useState(
      user?.username || ""
    );

  const [bio,
    setBio] =
    useState(
      user?.bio || ""
    );

  const [profilePicture,
    setProfilePicture] =
    useState(
      user?.profilePicture ||
        ""
    );

  const [password,
    setPassword] =
    useState("");

  const [error,
    setError] =
    useState("");

  const [success,
    setSuccess] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  if (!user) {
    return null;
  }

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      if (
        username.trim().length <
        3
      ) {
        setError(
          "Username must contain at least 3 characters."
        );
        return;
      }

      if (
        password &&
        password.length < 6
      ) {
        setError(
          "New password must contain at least 6 characters."
        );
        return;
      }

      try {
        setLoading(true);

        const data = {
          username:
            username.trim(),

          bio: bio.trim(),

          profilePicture:
            profilePicture.trim(),
        };

        if (password) {
          data.password =
            password;
        }

        const response =
          await api.put(
            `/users/${user.id}`,
            data
          );

        updateUser(
          response.data.user
        );

        setPassword("");

        setSuccess(
          "Profile updated successfully."
        );

        setTimeout(() => {
          navigate(
            `/profile/${user.id}`
          );
        }, 800);
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to update profile."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="form-page">

      <div className="form-card">

        <h1>
          Edit Profile
        </h1>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {success && (
          <div className="success-box">
            {success}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >

          <label>
            Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(event) =>
              setUsername(
                event.target.value
              )
            }
            minLength={3}
            maxLength={30}
            required
          />

          <label>
            Bio
          </label>

          <textarea
            value={bio}
            onChange={(event) =>
              setBio(
                event.target.value
              )
            }
            maxLength={250}
            placeholder="Tell people about yourself..."
          />

          <label>
            Profile Picture URL
          </label>

          <input
            type="url"
            value={
              profilePicture
            }
            onChange={(event) =>
              setProfilePicture(
                event.target.value
              )
            }
            placeholder="https://example.com/photo.jpg"
          />

          <label>
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            minLength={6}
            placeholder="Leave blank to keep current password"
          />

          <div className="form-bottom">

            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                navigate(-1)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}

export default EditProfile;