import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Post from "../components/Post";
import API from "../API";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await API.get("/");

        setPosts(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Не вдалося завантажити пости.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleDelete = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  const handlePinToggle = (postId, newPinnedStatus) => {
    setPosts(
      posts
        .map((post) =>
          post.id === postId ? { ...post, is_pinned: newPinnedStatus } : post
        )
        .sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        })
    );
  };

  const handleCommentAdded = (postId) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      )
    );
  };

  const handleRepost = (postId, updatedData) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, ...updatedData } : post
      )
    );
  };

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="homepage-container">
      <h2>Головна сторінка</h2>
      {posts.length === 0 ? (
        <p>Немає дописів для відображення.</p>
      ) : (
        <div className="posts-list">
          {posts.map((post) => (
            <Post
              key={post.id}
              post={post}
              username={post.author_username || post.author}
              onDelete={handleDelete}
              onPinToggle={handlePinToggle}
              onCommentAdded={handleCommentAdded}
              onRepost={handleRepost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
