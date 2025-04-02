import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Post from "../components/Post";
import FollowButton from "../components/FollowButton";
import CreatePost from "../components/CreatePost";
import Story from "../components/Story";
import PageTitle from "../components/PageTitle";
import { BiMessageSquareEdit } from "react-icons/bi";
import { TbMessage2Filled } from "react-icons/tb";
import API from "../API";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [isCreateStoryModalOpen, setIsCreateStoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const { username } = useParams();

  const handleEditProfile = () => {
    navigate(`/profile/edit/`);
  };

  const fetchUserProfile = async () => {
    try {
      const url = username ? `/profile/${username}/` : "/profile/";
      const response = await API.get(url, { withCredentials: true });
      const sortedPosts = [...response.data.posts].sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.is_pinned - a.is_pinned;
      });
      setUser({ ...response.data, posts: sortedPosts });

      if (!currentUserProfile) {
        const currentUserResponse = await API.get("/profile/", {
          withCredentials: true,
        });
        setCurrentUserProfile({
          ...currentUserResponse.data,
          posts: currentUserResponse.data.posts.sort((a, b) => {
            if (a.is_pinned === b.is_pinned) {
              return new Date(b.created_at) - new Date(a.created_at);
            }
            return b.is_pinned - a.is_pinned;
          }),
        });
        localStorage.setItem("username", currentUserResponse.data.username);
      }
    } catch (error) {
      setError(`Помилка: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDelete = (postId) => {
    setUser((prevUser) => ({
      ...prevUser,
      posts: prevUser.posts.filter((post) => post.id !== postId),
    }));
  };

  const handlePostCreated = (newPost) => {
    setUser((prevUser) => {
      const updatedPosts = [newPost, ...prevUser.posts];
      const sortedPosts = updatedPosts.sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.is_pinned - a.is_pinned;
      });
      return { ...prevUser, posts: sortedPosts };
    });
  };

  const handlePinToggle = (postId, isPinned) => {
    setUser((prevUser) => {
      const updatedPosts = prevUser.posts.map((post) =>
        post.id === postId ? { ...post, is_pinned: isPinned } : { ...post }
      );
      const sortedPosts = [...updatedPosts].sort((a, b) => {
        if (a.is_pinned === b.is_pinned) {
          return new Date(b.created_at) - new Date(a.created_at);
        }
        return b.is_pinned - a.is_pinned;
      });
      return { ...prevUser, posts: sortedPosts };
    });
  };

  const handleRepost = (postId, repostData) => {
    setUser((prevUser) => {
      const updatedPosts = prevUser.posts.map((post) =>
        post.id === postId
          ? { ...post, reposts_count: repostData.reposts_count }
          : post
      );
      return { ...prevUser, posts: updatedPosts };
    });

    setCurrentUserProfile((prevProfile) => {
      const newRepost = {
        ...repostData,
        is_repost: true,
        repost_date: new Date().toISOString(),
      };
      const finalPosts = [newRepost, ...prevProfile.posts].sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) {
          return b.is_pinned - a.is_pinned;
        }
        const dateA = a.repost_date || a.created_at;
        const dateB = b.repost_date || b.created_at;
        return new Date(dateB) - new Date(dateA);
      });
      return { ...prevProfile, posts: finalPosts };
    });
  };

  const handleMessageUser = async () => {
    try {
      const chatsResponse = await API.get("/chats/");
      const existingChat = chatsResponse.data.find(
        (chat) => chat.other_user === username
      );

      if (existingChat) {
        navigate(`/chats/${existingChat.id}/messages/`);
        return;
      }

      const createResponse = await API.post("/chats/create/", {
        user2: username,
      });
      const chatId = createResponse.data.id;
      navigate(`/chats/${chatId}/messages/`);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Не вдалося відкрити чат."
      );
      console.error(
        "Chat error:",
        error.response?.status,
        error.response?.data
      );
    }
  };

  const handleStoryCreated = (newStory) => {
    setUser((prevUser) => ({
      ...prevUser,
    }));
    setIsCreateStoryModalOpen(false);
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
        post.id === postId
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ),
    }));
  };

  if (loading) return <p>Завантаження...</p>;
  if (!user) return <p>Користувача не знайдено</p>;

  const currentUsername = localStorage.getItem("username");
  const isOwnProfile = !username || username === currentUsername;

  return (
    <div className="profile-container">
      <PageTitle />
      {isOwnProfile && (
        <CreatePost
          username={user.username}
          onPostCreated={handlePostCreated}
        />
      )}
      <div className="profile-header">
        <div className="profile-header-left">
          <Story
            username={user.username}
            avatarUrl={
              user.avatar_url
                ? `http://127.0.0.1:8000${user.avatar_url}`
                : "http://127.0.0.1:8000/media/avatars/avatar.jpg"
            }
            isOwnProfile={isOwnProfile}
            viewerId={currentUserProfile?.id}
          />
          <h2>{user.username}</h2>
        </div>
        <div className="profile-header-buttons">
          {isOwnProfile ? (
            <>
              <button
                onClick={handleEditProfile}
                className="profile-header-button"
              >
                <BiMessageSquareEdit className="edit-icon" />
                <span className="button-text">Редагувати профіль</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleMessageUser}
                className="profile-header-button profile-header-button--message"
              >
                <TbMessage2Filled className="message-icon" />
                <span className="button-text">Повідомлення</span>
              </button>
              <FollowButton
                username={username}
                initialFollowing={user.is_following}
                setUser={setUser}
              />
            </>
          )}
        </div>
      </div>
      <p className="profile-bio">{user.bio || "Не вказано"}</p>
      <div className="profile-stats">
        <div className="profile-stats-left">
          <p onClick={() => navigate(`/profile/${user.username}/followers/`)}>
            Слідкувачі: {user.followers_count}
          </p>
          <p onClick={() => navigate(`/profile/${user.username}/following/`)}>
            Слідкування: {user.following_count}
          </p>
        </div>
        <p>
          Дата реєстрації: {new Date(user.date_joined).toLocaleDateString()}
        </p>
      </div>
      <div className="profile-posts">
        <h3>Дописи</h3>
        {user.posts && user.posts.length > 0 ? (
          <div className="profile-posts-list">
            {user.posts.map((post) => (
              <Post
                key={post.id}
                post={post}
                username={user.username}
                onDelete={handlePostDelete}
                onCommentAdded={() => handleCommentAdded(post.id)}
                onPinToggle={handlePinToggle}
                onRepost={handleRepost}
              />
            ))}
          </div>
        ) : (
          <p>Немає дописів.</p>
        )}
      </div>
      {isCreateStoryModalOpen && (
        <Story.CreateStoryModal
          onClose={() => setIsCreateStoryModalOpen(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </div>
  );
};

export default Profile;
