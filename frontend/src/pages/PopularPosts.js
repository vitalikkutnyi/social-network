import React, { useState, useEffect } from "react";
import Post from "../components/Post";
import API from "../API";

const PopularPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPopularPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Увійдіть у систему.");
        setLoading(false);
        return;
      }

      const response = await API.get("/popular-posts/");

      const topPosts = response.data;

      if (topPosts.length === 0) {
        setPosts([]);
      } else if (topPosts.length <= 5) {
        setPosts(topPosts);
      } else {
        const topFive = topPosts.slice(0, 5);
        const randomPosts = [];
        const usedIndices = new Set();
        while (randomPosts.length < 5 && usedIndices.size < topFive.length) {
          const randomIndex = Math.floor(Math.random() * topFive.length);
          if (!usedIndices.has(randomIndex)) {
            randomPosts.push(topFive[randomIndex]);
            usedIndices.add(randomIndex);
          }
        }
        setPosts(randomPosts);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося завантажити дописи.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopularPosts();
  }, []);

  if (loading) return <p className="popular-loading">Завантаження...</p>;
  if (error) return <p className="popular-error">{error}</p>;

  return (
    <div className="popular-posts-page">
      <h2>Популярні дописи</h2>
      {posts.length > 0 ? (
        <div className="popular-posts-section">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              username={post.author}
              disableNavigation={false}
            />
          ))}
        </div>
      ) : (
        <p className="popular-no-results">Немає популярних дописів.</p>
      )}
    </div>
  );
};

export default PopularPosts;
