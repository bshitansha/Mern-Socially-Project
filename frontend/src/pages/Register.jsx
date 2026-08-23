import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";

function Register() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword,
    setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const {
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (
        username.trim().length < 3
      ) {
        setError(
          "Username must contain at least 3 characters."
        );
        return;
      }

      if (password.length < 6) {
        setError(
          "Password must contain at least 6 characters."
        );
        return;
      }

      if (
        password !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/auth/register",
            {
              username:
                username.trim(),
              password,
            }
          );

        login(
          response.data.user,
          response.data.token
        );

        navigate("/");
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to create account."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="auth-page">

      <div className="auth-card">

        <div className="auth-heading">
          <h1>
            Create Account
          </h1>

          <p>
            Join the community
          </p>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
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
            placeholder="Choose a username"
            minLength={3}
            maxLength={30}
            required
          />

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="At least 6 characters"
            minLength={6}
            required
          />

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            value={
              confirmPassword
            }
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Repeat your password"
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Register"}
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </section>
  );
}

export default Register;