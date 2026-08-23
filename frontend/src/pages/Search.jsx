import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import api from "../api";

function Search() {
  const [query,
    setQuery] =
    useState("");

  const [users,
    setUsers] =
    useState([]);

  const [loading,
    setLoading] =
    useState(false);

  const [error,
    setError] =
    useState("");

  const handleSearch =
    async (event) => {
      event.preventDefault();

      setError("");

      if (!query.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const response =
          await api.get(
            `/users/search?q=${encodeURIComponent(
              query.trim()
            )}`
          );

        setUsers(
          response.data
        );
      } catch (error) {
        setError(
          error.response?.data
            ?.message ||
            "Unable to search users."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <section className="page">

      <div className="page-header">
        <div>
          <h1>
            Search Users
          </h1>

          <p>
            Find people by username.
          </p>
        </div>
      </div>

      <form
        className="search-form"
        onSubmit={
          handleSearch
        }
      >

        <input
          type="search"
          value={query}
          onChange={(event) =>
            setQuery(
              event.target.value
            )
          }
          placeholder="Search username..."
        />

        <button
          className="primary-button"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Searching..."
            : "Search"}
        </button>

      </form>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      {!loading &&
        query &&
        users.length === 0 &&
        !error && (
          <div className="empty-state">
            <h3>
              No users found
            </h3>

            <p>
              Try another username.
            </p>
          </div>
        )}

      <div className="search-results">

        {users.map(
          (user) => (
            <Link
              key={user._id}
              to={`/profile/${user._id}`}
              className="user-result"
            >

              <div className="avatar">
                {user.profilePicture ? (
                  <img
                    src={
                      user.profilePicture
                    }
                    alt={
                      user.username
                    }
                  />
                ) : (
                  user.username
                    ?.charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div>
                <strong>
                  {user.username}
                </strong>

                <p>
                  {user.bio ||
                    "No bio yet."}
                </p>
              </div>

            </Link>
          )
        )}

      </div>

    </section>
  );
}

export default Search;