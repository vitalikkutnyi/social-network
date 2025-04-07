import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../API";

const LikeList = () => {
  const { username, postId } = useParams();
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const response = await API.get(
          `/api/profile/${username}/posts/${postId}/likes/`
        );
        setLikes(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Не вдалося завантажити лайки.");
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [username, postId, navigate]);

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="like-list-page">
      {likes.length === 0 ? (
        <p>Ще ніхто не лайкнув цей допис.</p>
      ) : (
        <>
          <h2>Кому сподобалось</h2>
          <ul className="like-list">
            {likes.map((like) => (
              <li
                key={like.user_id}
                className="like-item"
                onClick={() => navigate(`/profile/${like.username}/`)}
              >
                <div className="user-info">
                  <img
                    src={
                      like.avatar_url
                        ? like.avatar_url
                        : "/media/avatars/avatar.jpg"
                    }
                    alt="Аватар"
                    className="like-avatar"
                  />
                  <span>{like.username}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default LikeList;
