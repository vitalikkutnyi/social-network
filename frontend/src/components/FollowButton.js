import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const FollowButton = ({ username, initialFollowing, setUser }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const handleToggleFollow = async () => {
    const currentUsername = localStorage.getItem("username");
    if (username === currentUsername) {
      setError("Це ваш профіль.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Увійдіть у систему.");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `http://127.0.0.1:8000/profile/${username}/follow/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newFollowingState = response.status === 201;
      setIsFollowing(newFollowingState);

      setUser((prevUser) => ({
        ...prevUser,
        followers_count: newFollowingState
          ? prevUser.followers_count + 1
          : prevUser.followers_count - 1,
      }));
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Не можна підписатися на себе.");
      } else if (err.response?.status === 401) {
        setError("Сесія закінчилася. Увійдіть знову.");
        navigate("/login");
      } else {
        setError("Щось пішло не так.");
      }
      console.error("Follow error:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`follow-button ${
          isFollowing ? "following" : "not-following"
        }`}
      >
        {loading
          ? "Завантаження..."
          : isFollowing
          ? "Відписатися"
          : "Підписатися"}
      </button>
    </div>
  );
};

export default FollowButton;
