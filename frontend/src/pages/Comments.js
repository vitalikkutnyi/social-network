import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaTrash } from "react-icons/fa";
import Post from "../components/Post";

const Comments = ({ onCommentAdded }) => {
    const { postId, username } = useParams();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [postOwner, setPostOwner] = useState(null);
    const [post, setPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const token = localStorage.getItem("access_token");
                if (!token) {
                    setError("Токен відсутній, будь ласка, увійдіть.");
                    navigate("/login");
                    return;
                }
                const userResponse = await axios.get(`http://127.0.0.1:8000/profile/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCurrentUser(userResponse.data.username);

                const postResponse = await axios.get(`http://127.0.0.1:8000/profile/${username}/posts/${postId}/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setPost(postResponse.data);
                setPostOwner(postResponse.data.author);

                const response = await axios.get(`http://127.0.0.1:8000/profile/${username}/posts/${postId}/comments/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setComments(response.data.reverse());
            } catch (err) {
                console.error("Error fetching data:", err.response?.data || err.message);
                setError(err.response?.data?.detail || "Не вдалося завантажити коментарі.");
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchComments();
    }, [postId, username, navigate]);

    const handleCommentChange = (e) => {
        setNewComment(e.target.value);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
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

            const response = await axios.post(
                `http://127.0.0.1:8000/profile/${username}/posts/${postId}/comments/`,
                { text: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setComments([response.data, ...comments]);
            setNewComment("");
            setPost((prevPost) => ({
                ...prevPost,
                comments_count: prevPost.comments_count + 1,
            }));
            if (onCommentAdded) {
                onCommentAdded(postId);
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Не вдалося додати коментар.");
        } finally {
            setLoading(false);
        }
    };

    const handleCommentDelete = async (commentId) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("access_token");
            if (!token) {
                setError("Увійдіть у систему.");
                setLoading(false);
                return;
            }

            await axios.delete(
                `http://127.0.0.1:8000/profile/${username}/posts/${postId}/comments/${commentId}/delete/`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setComments(comments.filter((comment) => comment.id !== commentId));
            setPost((prevPost) => ({
                ...prevPost,
                comments_count: prevPost.comments_count - 1,
            }));
        } catch (err) {
            setError(err.response?.data?.detail || "Не вдалося видалити коментар.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {loading ? (
                <p>Завантаження...</p>
            ) : post ? (
                <div className="comments-post-container">
                    <Post key={post.id} post={post} username={username} disableNavigation={true} hideMenu={true} />
                </div>
            ) : (
                <p>Допис не знайдено або видалено.</p>
            )}
            <div className="comment-form">
                <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Введіть текст..."
                    rows="3"
                ></textarea>
                <button onClick={handleCommentSubmit} disabled={loading}>
                    {loading ? "Завантаження..." : "Додати коментар"}
                </button>
            </div>
            <div className="post-comments">
                <h4>Коментарі ({comments.length})</h4>
                {loading && <p>Завантаження коментарів...</p>}
                {error && <p>{error}</p>}
                {!loading && comments.length === 0 ? (
                    <p>Немає коментарів.</p>
                ) : (
                    <ul>
                        {comments.map((comment) => (
                            <li key={comment.id} className="comment-item">
                                <div className="comment-item-user">
                                    {comment.avatar ? (
                                        <img
                                            src={comment.avatar}
                                            alt="Аватар"
                                        />
                                    ) : (
                                        (<img 
                                            src={'http://127.0.0.1:8000/media/avatars/avatar.jpg'} 
                                        />)
                                    )}
                                    <strong>{comment.author}</strong>
                                    {postOwner === comment.author && (
                                        <>
                                            <span>•</span>
                                            <strong className="author">Автор</strong>
                                        </>
                                    )}
                                </div>
                                <p>{comment.text}</p>
                                <small>
                                    {new Date(comment.created_at).toLocaleDateString()},{' '}
                                    {new Date(comment.created_at).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </small>
                                {(currentUser === comment.author || currentUser === postOwner) && (
                                    <span
                                        onClick={() => handleCommentDelete(comment.id)}
                                        className="fa-trash"
                                    >
                                        <FaTrash />
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Comments;