import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Post from "../components/Post";
import API from "../API";

const Search = () => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlQuery = new URLSearchParams(location.search).get("query");
    if (urlQuery) {
      setQuery(urlQuery);
      fetchResults(urlQuery);
    }
  }, [location.search]);

  const fetchResults = async (searchQuery) => {
    if (!searchQuery) {
      setUsers([]);
      setPosts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usersResponse = await API.get("/users/search/", {
        params: { q: searchQuery },
      });
      setUsers(usersResponse.data);

      const postsResponse = await API.get("/posts/search/", {
        params: { query: searchQuery },
      });
      setPosts(postsResponse.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося виконати пошук.");
      setUsers([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query) {
        fetchResults(query);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearchClick = () => {
    if (query) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
      fetchResults(query);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}/`);
    setQuery("");
    setUsers([]);
    setPosts([]);
  };

  return (
    <div className="search-container">
      <div className="search">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Пошук"
          className="search-input"
        />
        <button
          onClick={handleSearchClick}
          disabled={loading}
          className="search-button"
        >
          {loading ? "Пошук..." : "Пошук"}
        </button>
      </div>
      {loading && <p className="search-loading">Завантаження...</p>}
      {error && <p className="search-error">{error}</p>}
      {!loading &&
        !error &&
        query &&
        users.length === 0 &&
        posts.length === 0 && (
          <p className="search-no-results">Нічого не знайдено.</p>
        )}

      {users.length > 0 && (
        <div className="search-section">
          <h3>Користувачі</h3>

          <ul className="search-results">
            {users.map((user) => (
              <li
                key={user.id}
                className="search-result-item"
                onClick={() => handleUserClick(user.username)}
              >
                {user.avatar_url ? (
                  <img
                    src={`http://127.0.0.1:8000${user.avatar_url}`}
                    alt="Аватар"
                    className="search-avatar"
                  />
                ) : (
                  <img
                    src={"http://127.0.0.1:8000/media/avatars/avatar.jpg"}
                    alt="Аватар за замовчуванням"
                    className="search-avatar"
                  />
                )}
                <span>{user.username}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {posts.length > 0 && (
        <div className="search-section">
          <h3>Дописи</h3>
          <div className="search-posts">
            {posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                username={post.author}
                disableNavigation={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
