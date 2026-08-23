import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import api from "../api";

import {
  useAuth,
} from "../context/AuthContext";

function Login() {
  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
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

  const location =
    useLocation();

  const from =
    location.state?.from
      ?.pathname || "/";

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!username.trim()) {
        setError(
          "Please enter your username."
        );
        return;
      }

      if (!password) {
        setError(
          "Please enter your password."
        );
        return;
      }

      try {
        setLoading(true);

        const response =
          await api.post(
            "/auth/login",
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

        navigate(from, {
          replace: true,
        });
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to login. Please try again."
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
            Welcome Back
          </h1>

          <p>
            Login to your account
          </p>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
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
            placeholder="Enter username"
            autoComplete="username"
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
            placeholder="Enter password"
            autoComplete="current-password"
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>
        </p>

      </div>

    </section>
  );
}

export default Login;