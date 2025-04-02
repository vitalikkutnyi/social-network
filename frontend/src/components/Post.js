import React, { useState, useEffect } from "react";
import { IoIosHeart } from "react-icons/io";
import {
  FaComment,
  FaPenToSquare,
  FaTrashCan,
  FaEllipsisVertical,
  FaThumbtack,
  FaThumbtackSlash,
  FaShare,
} from "react-icons/fa6";
import { GrFormPin } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import API from "../API";

const Post = ({
  post,
  username,
  onDelete,
  disableNavigation,
  hideMenu = false,
  onCommentAdded,
  onPinToggle,
  onRepost,
}) => {
  const {
    id,
    text,
    image,
    video,
    audio,
    created_at,
    likes_count,
    comments_count,
    is_liked_by_user,
    is_pinned = false,
    is_repost = false,
    reposts_count = 0,
    original_author_username,
    original_author_avatar,
    is_editable = true,
  } = post;

  const [isLiked, setIsLiked] = useState(is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(likes_count);
  const [commentsCount, setCommentsCount] = useState(comments_count);
  const [repostsCount, setRepostsCount] = useState(reposts_count);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [showMenu, setShowMenu] = useState(false);
  const [currentPost, setCurrentPost] = useState(post);
  const [isDeleted, setIsDeleted] = useState(false);
  const navigate = useNavigate();

  const renderTextWithHashtags = (text) => {
    if (!text) return null;
    const hashtagRegex = /(#\w+)/g;
    const parts = text.split(hashtagRegex);

    return parts.map((part, index) => {
      if (part.match(hashtagRegex)) {
        return (
          <span
            key={index}
            className="hashtag"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/search?query=${encodeURIComponent(part)}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [currentUserResponse, userResponse] = await Promise.all([
          API.get(`/profile/`, {}),
          API.get(`/profile/${username}/`, {}),
        ]);

        setCurrentUser(currentUserResponse.data.username);
        setUser(userResponse.data);
      } catch (err) {
        console.error("Помилка при завантаженні профілю користувача:", err);
        setError("Не вдалося завантажити дані користувача.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  const date = new Date(created_at);
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
    hour12: false,
  };
  const dateOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Kyiv",
  };
  const formattedTime = date.toLocaleString("uk-UA", timeOptions);
  const formattedDate = date.toLocaleString("uk-UA", dateOptions);

  useEffect(() => {
    setLikesCount(likes_count);
    setIsLiked(is_liked_by_user || false);
    setCommentsCount(comments_count);
    setRepostsCount(reposts_count);
    setCurrentPost(post);
  }, [id, likes_count, is_liked_by_user, comments_count]);

  const handleRepost = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError(null);

    try {
      const response = await API.post(
        `/profile/${currentUser}/posts/${id}/repost/`,
        {}
      );
      setRepostsCount(response.data.reposts_count);
      setCurrentPost({
        ...currentPost,
        reposts_count: response.data.reposts_count,
      });
      if (onRepost) {
        onRepost(id, response.data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося зробити репост.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError(null);

    try {
      const response = await API.post(
        `/profile/${username}/posts/${id}/like/`,
        {}
      );

      if (response.data.message === "Лайк додано") {
        setIsLiked(true);
        setLikesCount((prevCount) => prevCount + 1);
        setCurrentPost({
          ...currentPost,
          likes_count: likesCount + 1,
          is_liked_by_user: true,
        });
      } else if (response.data.message === "Лайк видалено") {
        setIsLiked(false);
        setLikesCount((prevCount) => prevCount - 1);
      }
    } catch (err) {
      console.error("Помилка при лайку:", err);
      setError(err.response?.data?.error || "Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleLikesCountClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${username}/posts/${id}/likes/`);
  };

  const handlePostClick = () => {
    if (!disableNavigation) {
      navigate(`/profile/${username}/posts/${id}/`);
    }
  };

  const handleCommentsClick = (e) => {
    e.stopPropagation();
    navigate(`/profile/${username}/posts/${id}/comments/`);
  };

  const handleEditToggle = (e) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
    setShowMenu(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = { text: editedText };

    try {
      await API.put(`/profile/${username}/posts/${id}/update/`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setIsEditing(false);
      setCurrentPost({ ...currentPost, text: editedText });
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося відредагувати допис.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      await API.delete(`/profile/${username}/posts/${id}/delete/`);
      setIsDeleted(true);
      onDelete(id);
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося видалити допис.");
    } finally {
      setLoading(false);
      setShowMenu(false);
    }
  };

  const handlePinToggle = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setError(null);

    try {
      const response = await API.post(
        `/profile/${username}/posts/${id}/pin/`,
        {}
      );
      const newPinnedStatus = response.data.is_pinned;
      setCurrentPost({ ...currentPost, is_pinned: newPinnedStatus });
      setShowMenu(false);
      if (onPinToggle) {
        onPinToggle(id, newPinnedStatus);
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося закріпити допис.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleUserClick = (e, targetUsername) => {
    e.stopPropagation();
    navigate(`/profile/${targetUsername}`);
  };

  const isAuthor = currentUser && currentUser === username;
  if (isDeleted) return null;

  if (loading || !user || !currentUser) {
    return (
      <div className="post-container loading">
        <p>Завантаження...</p>
      </div>
    );
  }

  return (
    <div className="post-container" onClick={handlePostClick}>
      {user && (
        <div className="post-container-header">
          <div className="post-container-user">
            {user.avatar_url ? (
              <img
                src={`http://127.0.0.1:8000${user.avatar_url}`}
                alt="Аватар"
              />
            ) : (
              <img src={"http://127.0.0.1:8000/media/avatars/avatar.jpg"} />
            )}
            <span>
              <strong>{user.username}</strong>
              {currentPost.is_repost && (
                <span className="repost-info">
                  Репост із{" "}
                  <a
                    href={`/profile/${currentPost.original_author_username}`}
                    onClick={(e) =>
                      handleUserClick(e, currentPost.original_author_username)
                    }
                  >
                    {currentPost.original_author_username}
                  </a>
                </span>
              )}
            </span>
          </div>
          <div className="post-header-right">
            {currentPost.is_pinned && (
              <span className="pinned">
                <GrFormPin />
              </span>
            )}
            {is_editable && isAuthor && !isEditing && (
              <div className="post-menu">
                <button className="menu-button" onClick={toggleMenu}>
                  <FaEllipsisVertical />
                </button>
                {showMenu && (
                  <div className="post-actions-menu">
                    {!currentPost.is_repost && (
                      <button onClick={handleEditToggle}>
                        <FaPenToSquare /> Редагувати
                      </button>
                    )}
                    <button onClick={handleDelete} disabled={loading}>
                      <FaTrashCan /> {loading ? "Видалення..." : "Видалити"}
                    </button>
                    <button onClick={handlePinToggle} disabled={loading}>
                      {currentPost.is_pinned ? (
                        <>
                          <FaThumbtackSlash /> Відкріпити
                        </>
                      ) : (
                        <>
                          <FaThumbtack /> Закріпити
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div>
        {image && <img src={image} alt="Зображення" className="post-media" />}
        {video && (
          <video controls className="post-media">
            <source src={video} type="video/mp4" />
            Ваш браузер не підтримує відео.
          </video>
        )}
        {audio && (
          <audio controls className="post-audio">
            <source src={audio} type="audio/mpeg" />
            Ваш браузер не підтримує аудіо.
          </audio>
        )}
        {!isEditing && currentPost.text && (
          <p className="post-text">
            {renderTextWithHashtags(currentPost.text)}
          </p>
        )}
      </div>
      {isEditing && (
        <form
          className="edit-form"
          onSubmit={handleEditSubmit}
          onClick={(e) => e.stopPropagation()}
        >
          <textarea
            className="edit-textarea"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="Текст допису..."
          />
          <div className="edit-button-group">
            <button
              className="edit-save-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Збереження..." : "Зберегти"}
            </button>
            <button
              className="edit-cancel-button"
              type="button"
              onClick={handleEditToggle}
              disabled={loading}
            >
              Скасувати
            </button>
          </div>
        </form>
      )}
      <div className="post-meta">
        <div className="post-meta-left">
          <span className={isLiked ? "liked" : "unliked"}>
            <span onClick={handleLikeToggle}>
              <IoIosHeart />
            </span>
            <span onClick={handleLikesCountClick}>{likesCount}</span>
          </span>
          <span onClick={handleCommentsClick}>
            <FaComment />
            {commentsCount}
          </span>
          {!currentPost.is_repost && (
            <span onClick={handleRepost}>
              <FaShare />
              {repostsCount > 0 && <span>{repostsCount}</span>}
            </span>
          )}
        </div>
        <span>
          {formattedTime} год. • {formattedDate}
        </span>
      </div>
      {error && <p className="post-text">{error}</p>}
    </div>
  );
};

export default Post;
