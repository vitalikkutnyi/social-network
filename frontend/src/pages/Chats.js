import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [newChatUsername, setNewChatUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          setError("Увійдіть у систему.");
          navigate("/login");
          return;
        }

        const userResponse = await axios.get("http://127.0.0.1:8000/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentUser(userResponse.data.username);

        const response = await axios.get("http://127.0.0.1:8000/chats/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setChats(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Не вдалося завантажити чати.");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [navigate]);

  const handleSearchUsers = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://127.0.0.1:8000/search/?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSearchResults(response.data);
    } catch (err) {
      setError("Не вдалося знайти користувачів.");
      setSearchResults([]);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearchUsers(newChatUsername);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [newChatUsername]);

  const handleCreateChat = async (selectedUsername) => {
    if (!selectedUsername) {
      setError("Введіть ім’я користувача.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        "http://127.0.0.1:8000/chats/create/",
        {
          user2: selectedUsername,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats((prevChats) => [...prevChats, response.data]);
      setNewChatUsername("");
      setSearchResults([]);
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Не вдалося створити чат."
      );
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.delete(`http://127.0.0.1:8000/chats/${chatId}/delete/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося видалити чат.");
    }
  };

  {
    /* const handleChatClick = (chatId) => {
        navigate(`/chats/${chatId}`);
    } */
  }

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="chats-container">
      <div className="chats-container-header">
        <h2>Список чатів</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="create-chat-button"
        >
          +
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Створити новий чат</h3>
            <input
              type="text"
              value={newChatUsername}
              onChange={(e) => setNewChatUsername(e.target.value)}
              placeholder="Введіть ім’я користувача"
              className="chat-input"
            />
            {searchResults.length > 0 && (
              <ul className="chat-search-results">
                {searchResults.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleCreateChat(user.username)}
                    className="chat-search-result-item"
                  >
                    {user.avatar_url ? (
                      <img
                        src={`http://127.0.0.1:8000${user.avatar_url}`}
                        alt="Аватар"
                        className="chat-search-avatar"
                      />
                    ) : (
                      <img
                        src={"http://127.0.0.1:8000/media/avatars/avatar.jpg"}
                        alt="Аватар за замовчуванням"
                        className="chat-search-avatar"
                      />
                    )}
                    <span>{user.username}</span>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setIsModalOpen(false)}
              className="modal-cancel-button"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
      {chats.length === 0 ? (
        <p className="no-chats-message">У вас немає активних чатів.</p>
      ) : (
        <ul className="chat-list">
          {chats.map((chat) => (
            <li
              key={chat.id}
              /* onClick={() => handleChatClick(chats.id)} */
              className="chat-item"
            >
              <div className="chat-info">
                <div className="chat-info-header">
                  <div className="chat-info-header-left">
                    {chat.avatar_url ? (
                      <img
                        src={`http://127.0.0.1:8000${chat.avatar_url}`}
                        alt="Аватар"
                        className="chat-info-avatar"
                      />
                    ) : (
                      <img
                        src={"http://127.0.0.1:8000/media/avatars/avatar.jpg"}
                        alt="Аватар за замовчуванням"
                        className="chat-info-avatar"
                      />
                    )}
                    <strong>{chat.other_user}</strong>
                  </div>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    className="delete-chat-button"
                  >
                    <FaTrash />
                  </button>
                </div>
                {chat.last_message ? (
                  <p>
                    {chat.last_message.sender_name === currentUser
                      ? `Ви: ${chat.last_message.text}`
                      : `${chat.last_message.sender_name}: ${chat.last_message.text}`}
                    <small>
                      {new Intl.DateTimeFormat("uk-UA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(chat.last_message.sent_at))}
                    </small>
                  </p>
                ) : (
                  <p>
                    Немає повідомлень.
                    <small>
                      {new Intl.DateTimeFormat("uk-UA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(chat.created_at))}
                    </small>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Chats;
