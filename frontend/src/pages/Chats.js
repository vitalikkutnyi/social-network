import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { TbPointFilled } from "react-icons/tb";
import API from "../API";

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
        const userResponse = await API.get("/profile/");
        setCurrentUser(userResponse.data.username);

        const response = await API.get("/chats/");

        const sortedChats = response.data.sort((a, b) => {
          const aTime = a.last_message
            ? new Date(a.last_message.sent_at)
            : new Date(a.created_at);
          const bTime = b.last_message
            ? new Date(b.last_message.sent_at)
            : new Date(b.created_at);
          return bTime - aTime;
        });

        setChats(sortedChats);
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
      const response = await API.get(`/users/search/?q=${query}`);
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
      const response = await API.post("/chats/create/", {
        user2: selectedUsername,
      });

      setChats((prevChats) => {
        const updatedChats = [...prevChats, response.data];
        return updatedChats.sort((a, b) => {
          const aTime = a.last_message
            ? new Date(a.last_message.sent_at)
            : new Date(a.created_at);
          const bTime = b.last_message
            ? new Date(b.last_message.sent_at)
            : new Date(b.created_at);
          return bTime - aTime;
        });
      });

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
      await API.delete(`/chats/${chatId}/delete/`);

      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Не вдалося видалити чат.");
    }
  };

  const handleChatClick = (chatId) => {
    navigate(`/chats/${chatId}/messages/`);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    const time = new Intl.DateTimeFormat("uk-UA", timeOptions).format(date);

    if (isToday) {
      return time;
    } else {
      const dateOptions = {
        day: "numeric",
        month: "short",
      };
      const datePart = new Intl.DateTimeFormat("uk-UA", dateOptions).format(
        date
      );
      return `${datePart} • ${time}`;
    }
  };

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
          {chats.map((chat) => {
            const isLastMessageUnread =
              chat.last_message &&
              chat.last_message.sender_name !== currentUser &&
              !chat.last_message.is_read;

            return (
              <li
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="delete-chat-button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  {chat.last_message ? (
                    <p>
                      <span
                        className={`text ${
                          isLastMessageUnread ? "unread-text" : ""
                        }`}
                      >
                        {chat.last_message.sender_name === currentUser
                          ? `Ви: ${chat.last_message.text}`
                          : `${chat.last_message.sender_name}: ${chat.last_message.text}`}
                      </span>
                      <span className="unread">
                        {isLastMessageUnread ? <TbPointFilled /> : ""}
                      </span>
                      <span className="meta">
                        <small>
                          {formatDateTime(chat.last_message.sent_at)}
                        </small>
                      </span>
                    </p>
                  ) : (
                    <p>
                      <span className="text">Немає повідомлень.</span>
                      <span className="meta">
                        <small>{formatDateTime(chat.created_at)}</small>
                      </span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Chats;
