import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Post from "../components/Post.js";
import API from "../API";

const PostDetailPage = () => {
  const { username, pk } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await API.get(`/profile/${username}/posts/${pk}/`);
        setPost(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Не вдалося завантажити допис.");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [username, pk]);

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>{error}</p>;
  if (!post) return <p>Допис не знайдено.</p>;

  return (
    <div className="post-detail-container">
      <Post post={post} username={username} />
      <button
        onClick={() => navigate(`/profile/${username}/posts/${pk}/comments/`)}
        className="post-detail-container-button"
      >
        Перейти до коментарів
      </button>
    </div>
  );
};

export default PostDetailPage;
