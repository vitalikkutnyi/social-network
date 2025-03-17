import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaImage, FaVideo, FaMusic } from "react-icons/fa";
import Post from "../components/Post";
import FollowButton from "../components/FollowButton";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [showCreatePost, setShowCreatePost] = useState(false); 
    const [postText, setPostText] = useState("");
    const [postImage, setPostImage] = useState(null);
    const [postVideo, setPostVideo] = useState(null);
    const [postAudio, setPostAudio] = useState(null);
    const [postLoading, setPostLoading] = useState(false);
    const [postError, setPostError] = useState(null);
    const navigate = useNavigate();
    const { username } = useParams();

    const handleEditProfile = () => {
        navigate(`/profile/edit`);
    };

    const toggleCreatePost = () => {
        setShowCreatePost(!showCreatePost);
        setPostText(""); 
        setPostImage(null);
        setPostVideo(null);
        setPostAudio(null);
        setPostError(null);
    };

    const handleCreatePostSubmit = async (e) => {
        e.preventDefault();
        setPostLoading(true);
        setPostError(null);

        const formData = new FormData();
        formData.append("text", postText);
        if (postImage) formData.append("image", postImage);
        if (postVideo) formData.append("video", postVideo);
        if (postAudio) formData.append("audio", postAudio);

        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.post(`http://127.0.0.1:8000/profile/${username}/posts/create/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setUser((prevUser) => ({
                ...prevUser,
                posts: [response.data, ...prevUser.posts],
            }));
            toggleCreatePost(); 
        } catch (err) {
            setPostError(err.response?.data?.detail || "Не вдалося створити допис.");
        } finally {
            setPostLoading(false);
        }
    };

    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const exp = decoded.exp * 1000;
            return Date.now() >= exp;
        } catch (e) {
            return true; 
        }
    };

    const refreshToken = async () => {
        try {
            const refresh_token = localStorage.getItem("refresh_token");
            const response = await axios.post(
                "http://127.0.0.1:8000/token/refresh/",
                { refresh_token }, 
            );
            const { access } = response.data;
            localStorage.setItem("access_token", access);
            return access;
        } catch (err) {
            setError("Не вдалося оновити токен. Увійдіть знову.");
            navigate("/login");
            return null;
        }
    };

    const fetchUserProfile = async () => {
        let token = localStorage.getItem("access_token");
        if (!token) {
            setError("Токен відсутній, будь ласка, увійдіть.");
            navigate("/login");
            return;
        }

        if (isTokenExpired(token)) {
            token = await refreshToken();
            if (!token) return;
            localStorage.setItem("access_token", token);
        }

        try {
            const url = username ? `http://127.0.0.1:8000/profile/${username}/` : "http://127.0.0.1:8000/profile/";
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const sortedPosts = response.data.posts.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            setUser({ ...response.data, posts: sortedPosts });
            if (!username) {
                localStorage.setItem("username", response.data.username);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                const newToken = await refreshToken();
                if (newToken) {
                    try {
                        const url = username ? `http://127.0.0.1:8000/profile/${username}/` : "http://127.0.0.1:8000/profile/";
                        const retryResponse = await axios.get(url, {
                            headers: { Authorization: `Bearer ${newToken}` },
                        });
                        const sortedPosts = retryResponse.data.posts.sort((a, b) => 
                            new Date(b.created_at) - new Date(a.created_at)
                        );
                        setUser({ ...retryResponse.data, posts: sortedPosts });
                    } catch (retryError) {
                        setError("Помилка після оновлення токена.");
                        navigate("/login");
                    }
                }
            } else {
                setError(`Помилка: ${error.response?.data?.detail || error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/logout/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            });

            if (response.status === 200) {
                navigate('/login');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                setMessage(message = response.data.message); 
                setError('');
            }
        } catch (error) {
            console.error("Помилка при виході:", error);
            setError("Сталася помилка при виході з акаунта");
            setMessage('');
        }
    };

    const handlePostDelete = (postId) => {
        setUser((prevUser) => ({
            ...prevUser,
            posts: prevUser.posts.filter((post) => post.id !== postId),
        }));
    };

    useEffect(() => {
        let mounted = true;
        if (mounted) {
            fetchUserProfile();
        }
        return () => {
            mounted = false;
        };
    }, [navigate, username]);

    if (loading) return <p>Завантаження...</p>;
    if (!user) return <p>Користувача не знайдено</p>;

    const currentUsername = localStorage.getItem("username");
    const isOwnProfile = !username || (username === currentUsername);

    return (
        <div className="profile-container">
            {isOwnProfile && (
                <button className="create-post-button" onClick={toggleCreatePost}>
                    +
                </button>
            )}
            {showCreatePost && (
                <div className="create-post-modal">
                    <div className="create-post-modal-content">
                        <h2>Створити допис</h2>
                        <form onSubmit={handleCreatePostSubmit}>
                            <textarea
                                value={postText}
                                onChange={(e) => setPostText(e.target.value)}
                                placeholder="Текст допису..."
                                rows="5"
                            />
                            <div className="media-buttons">
                                <label htmlFor="image-upload" className={`media-button ${postImage ? "selected" : ""}`} title="Додати фото">
                                    <FaImage />
                                </label>
                                <label htmlFor="video-upload" className={`media-button ${postVideo ? "selected" : ""}`} title="Додати відео">
                                    <FaVideo />
                                </label>
                                <label htmlFor="audio-upload" className={`media-button ${postAudio ? "selected" : ""}`} title="Додати аудіо">
                                    <FaMusic />
                                </label>
                            </div>
                            <input
                                type="file"
                                id="image-upload"
                                accept="image/*"
                                onChange={(e) => setPostImage(e.target.files[0])}
                            />
                            <input
                                type="file"
                                id="video-upload"
                                accept="video/*"
                                onChange={(e) => setPostVideo(e.target.files[0])}
                            />
                            <input
                                type="file"
                                id="audio-upload"
                                accept="audio/*"
                                onChange={(e) => setPostAudio(e.target.files[0])}
                            />
                            <div className="selected-files">
                                {postImage && <p>Фото: {postImage.name}</p>}
                                {postVideo && <p>Відео: {postVideo.name}</p>}
                                {postAudio && <p>Аудіо: {postAudio.name}</p>}
                            </div>
                            <div className="create-post-buttons">
                                <button type="submit" disabled={postLoading}>
                                    {postLoading ? "Створення..." : "Опублікувати"}
                                </button>
                                <button type="button" onClick={toggleCreatePost} disabled={postLoading}>
                                    Скасувати
                                </button>
                            </div>
                            {postError && <p className="error">{postError}</p>}
                        </form>
                    </div>
                </div>
            )}
            <div className="profile-header">
                <div>
                    {user.avatar_url ? (
                        <img
                            src={`http://127.0.0.1:8000${user.avatar_url}`}
                            alt="Аватар"
                            className="profile-avatar"
                        />
                    ) : (
                        (<img 
                            src={'http://127.0.0.1:8000/media/avatars/avatar.jpg'} 
                            className="profile-avatar"
                        />)
                    )}
                    <h2>{user.username}</h2>
                </div>
                <div className="profile-header-buttons">
                    { isOwnProfile ? (
                        <>
                            <button onClick={handleEditProfile} className="profile-header-button">Редагувати профіль</button>
                            <button onClick={handleLogout} className="profile-header-button">Вихід</button>
                        </>
                    ) : (
                        <FollowButton username={username} initialFollowing={user.is_following} setUser={setUser} />
                    )}
                </div>
            </div>
            <p className="profile-bio">{user.bio || "Не вказано"}</p>
            <div className="profile-stats">
                <div className="profile-stats-left">
                    <p onClick={() => navigate(`/profile/${user.username}/followers/`)}>Підписники: {user.followers_count}</p>
                    <p onClick={() => navigate(`/profile/${user.username}/following/`)}>Підписки: {user.following_count}</p>
                </div>
                <p>Дата реєстрації: {new Date(user.date_joined).toLocaleDateString()}</p>
            </div>
            <div className="profile-posts">
                <h3>Дописи</h3>
                {user.posts && user.posts.length > 0 ? (
                    <div>
                        {user.posts.map((post) => (
                            <Post key={post.id} post={post} username={user.username} onDelete={handlePostDelete} />
                        ))}
                    </div>
                ) : (
                    <p>Немає дописів.</p>
                )}
            </div>
        </div>
    );
};

export default Profile;