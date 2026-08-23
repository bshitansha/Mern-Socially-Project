import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

function Navbar() {
  const {
    user,
    logout,
  } = useAuth();

  const navigate =
    useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <Link
          to="/"
          className="logo"
        >
          Socially
        </Link>

        <nav className="nav-links">

          <NavLink to="/">
            Home
          </NavLink>

          <NavLink to="/search">
            Search
          </NavLink>

          {user ? (
            <>
              <NavLink to="/create-post">
                Create Post
              </NavLink>

              <NavLink
                to={`/profile/${user.id}`}
              >
                Profile
              </NavLink>

              <button
                className="nav-logout"
                onClick={
                  handleLogout
                }
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                Login
              </NavLink>

              <NavLink to="/register">
                Register
              </NavLink>
            </>
          )}

        </nav>

      </div>
    </header>
  );
}

export default Navbar;