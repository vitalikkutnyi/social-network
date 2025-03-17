import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Post from "../components/Post";
import FollowButton from "../components/FollowButton";
import CreatePost from "../components/CreatePost";

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();
    const { username } = useParams();

    const handleEditProfile = () => {
        navigate(`/profile/edit`);
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

    const handlePostCreated = (newPost) => {
        setUser((prevUser) => ({
          ...prevUser,
          posts: [newPost, ...prevUser.posts],
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

    const handleCommentAdded = (postId) => {
        setUser((prevUser) => ({
            ...prevUser,
            posts: prevUser.posts.map((post) =>
                post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
            ),
        }));
    };

    if (loading) return <p>Завантаження...</p>;
    if (!user) return <p>Користувача не знайдено</p>;

    const currentUsername = localStorage.getItem("username");
    const isOwnProfile = !username || (username === currentUsername);

    return (
        <div className="profile-container">
            {isOwnProfile && <CreatePost username={user.username} onPostCreated={handlePostCreated} />}
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
                            <Post key={post.id} post={post} username={user.username} onDelete={handlePostDelete} onCommentAdded={() => handleCommentAdded(post.id)} />
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