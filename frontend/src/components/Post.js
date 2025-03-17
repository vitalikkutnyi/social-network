import React, { useState, useEffect } from "react";
import axios from "axios";
import { IoIosHeart } from "react-icons/io";
import { FaComment, FaPenToSquare, FaTrashCan, FaEllipsisVertical } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const Post = ({ post, username, onDelete, disableNavigation }) => {
    const { id, text, image, video, audio, created_at, likes_count, comments_count, is_liked_by_user } = post;

    const [isLiked, setIsLiked] = useState(is_liked_by_user || false); 
    const [likesCount, setLikesCount] = useState(likes_count);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null); 
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(text);
    const [showMenu, setShowMenu] = useState(false);
    const [currentPost, setCurrentPost] = useState(post);
    const [isDeleted, setIsDeleted] = useState(false);
    const navigate = useNavigate(); 

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) return;

                const currentUserResponse = await axios.get(`http://127.0.0.1:8000/profile/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCurrentUser(currentUserResponse.data.username);

                const response = await axios.get(`http://127.0.0.1:8000/profile/${username}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (err) {
                console.error("Помилка при завантаженні профілю користувача:", err);
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
    }, [id]);

    const handleLikeToggle = async (e) => {
        e.stopPropagation();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setError("Увійдіть.");
                setLoading(false);
                return;
            }

            const response = await axios.post(
                `http://127.0.0.1:8000/profile/${username}/posts/${id}/like/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.message === "Лайк додано") {
                setIsLiked(true);
                setLikesCount((prevCount) => prevCount + 1);
                setCurrentPost({ ...currentPost, likes_count: likesCount + 1, is_liked_by_user: true });
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
            const token = localStorage.getItem("access_token");
            await axios.put(`http://127.0.0.1:8000/profile/${username}/posts/${id}/`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
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
            const token = localStorage.getItem("access_token");
            await axios.delete(`http://127.0.0.1:8000/profile/${username}/posts/${id}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsDeleted(true);
            onDelete(id);
        } catch (err) {
            setError(err.response?.data?.detail || "Не вдалося видалити допис.");
        } finally {
            setLoading(false);
            setShowMenu(false);
        }
    };

    const toggleMenu = (e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    }

    const isAuthor = currentUser && currentUser === username;
    if (isDeleted) return null;

    return (
        <div className="post-container" onClick={handlePostClick}>
            {user && (
                <div className="post-container-header">
                    <div className="post-container-user">
                        <img src={user.avatar} alt="Avatar" onError={() => console.log("Помилка завантаження аватара")} />
                        <strong>{user.username}</strong>
                    </div>
                    {isAuthor && !isEditing && (
                        <div className="post-menu">
                            <button className="menu-button" onClick={toggleMenu}>
                                <FaEllipsisVertical />
                            </button>
                            {showMenu && (
                                <div className="post-actions-menu">
                                    <button onClick={handleEditToggle}>
                                        <FaPenToSquare /> Редагувати
                                    </button>
                                    <button onClick={handleDelete} disabled={loading}>
                                        <FaTrashCan /> {loading ? "Видалення..." : "Видалити"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
                {!isEditing && currentPost.text && <p className="post-text">{currentPost.text}</p>}
            </div>
            {isEditing && (
                <form className="edit-form" onSubmit={handleEditSubmit} onClick={(e) => e.stopPropagation()}>
                    <textarea
                        className="edit-textarea"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        placeholder="Текст допису..."
                    />
                    <div className="edit-button-group">
                        <button className="edit-save-button" type="submit" disabled={loading}>
                            {loading ? "Збереження..." : "Зберегти"}
                        </button>
                        <button className="edit-cancel-button" type="button" onClick={handleEditToggle} disabled={loading}>
                            Скасувати
                        </button>
                    </div>
                </form>
            )}
            <div className="post-meta">
                <div className="post-meta-left">
                    <span onClick={handleLikeToggle} className={isLiked ? 'liked' : 'unliked'}>
                        <IoIosHeart />
                        {likesCount}
                    </span>
                    <span onClick={handleCommentsClick}>
                        <FaComment />
                        {comments_count}
                    </span>
                </div>
                <span>{formattedTime} (UTC+2) • {formattedDate}</span>
            </div>
            {error && <p className="post-text">{error}</p>}
        </div>
    );
};

export default Post;