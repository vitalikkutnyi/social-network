import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); 
  const navigate = useNavigate();

  const fetchUsers = async (searchQuery) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Увійдіть у систему.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/search/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchQuery, 
        },
      });

      setResults(response.data); 
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося виконати пошук.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(query);
    }, 300); 

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSearchClick = () => {
    fetchUsers(query);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}/`);
    setQuery(""); 
    setResults([]); 
  };

  const updateFollowingState = (username, newFollowingState) => {
    setResults((prevResults) =>
      prevResults.map((user) =>
        user.username === username ? { ...user, is_following: newFollowingState } : user
      )
    );
  };

  return (
    <div className="search-container">
        <div className="search">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Пошук користувачів..."
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
        {!loading && !error && query && results.length === 0 && (
            <p className="search-no-results">Користувача не знайдено.</p>
        )}
        {results.length > 0 && (
            <ul className="search-results">
                {results.map((user) => (
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
        )}
    </div>
  );
};

export default Search;