import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";
import { RiUserUnfollowLine, RiUserFollowLine } from "react-icons/ri";

const FollowButton = ({ username, initialFollowing, setUser, icon: Icon }) => {
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
      const response = await API.post(
        `/api/profile/${username}/follow/`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newFollowingState = response.status === 201;
      setIsFollowing(newFollowingState);

      setUser((prevUser) => ({
        ...prevUser,
        is_following: newFollowingState,
        followers_count: newFollowingState
          ? prevUser.followers_count + 1
          : prevUser.followers_count - 1,
      }));
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Не можна підписатися на себе.");
      } else if (err.response?.status === 401) {
        setError("Сесія закінчилася. Увійдіть знову.");
        navigate("/login/");
      } else {
        setError("Щось пішло не так.");
      }
      console.error("Follow error:", err.response || err.message);
    } finally {
      setLoading(false);
    }
  };

  const FollowIcon = isFollowing ? RiUserUnfollowLine : RiUserFollowLine;

  return (
    <div>
      <button
        onClick={handleToggleFollow}
        disabled={loading}
        className={`follow-button ${
          isFollowing ? "following" : "not-following"
        }`}
      >
        <FollowIcon className="follow-icon" />
        <span className="follow-text">
          {loading ? "Завантаження..." : isFollowing ? "Не стежити" : "Стежити"}
        </span>
      </button>
    </div>
  );
};

export default FollowButton;
