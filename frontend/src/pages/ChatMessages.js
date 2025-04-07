import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TbPointFilled } from "react-icons/tb";
import { FaPaperPlane } from "react-icons/fa";
import PageTitle from "../components/PageTitle";
import API from "../API";

const ChatMessages = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState({
    username: null,
    avatar_url: null,
  });
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const fetchChatData = async () => {
    try {
      const userResponse = await API.get("/api/profile");
      setCurrentUser(userResponse.data.username);

      const chatResponse = await API.get(`/api/chats/${chatId}/`);
      setOtherUser({
        username: chatResponse.data.other_user,
        avatar_url: chatResponse.data.avatar_url,
      });

      const messageResponse = await API.get(`/api/chats/${chatId}/messages/`);
      const sortedMessages = messageResponse.data.sort(
        (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
      );
      setMessages(sortedMessages);

      await markMessagesAsRead(sortedMessages);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Не вдалося завантажити дані чату."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchChatData();
    }

    return () => {
      mounted = false;
    };
  }, [chatId, navigate]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const markMessagesAsRead = async (messages, token) => {
    try {
      const unreadMessages = messages.filter(
        (msg) => !msg.is_read && msg.sender_name !== currentUser
      );

      for (const msg of unreadMessages) {
        const response = await API.put(
          `/api/chats/${chatId}/messages/${msg.message_id}/read/`,
          {}
        );
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          unreadMessages.some((unread) => unread.message_id === msg.message_id)
            ? { ...msg, is_read: true }
            : msg
        )
      );
    } catch (err) {
      console.error("Помилка при позначенні повідомлень як прочитаних:", err);
      console.error("Деталі помилки:", err.response?.data);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await API.post(
        `/api/chats/${chatId}/messages/`,
        { text: newMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, response.data];
        return updatedMessages.sort(
          (a, b) => new Date(a.sent_at) - new Date(b.sent_at)
        );
      });
      setNewMessage("");
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Не вдалося надіслати повідомлення."
      );
    }
  };

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="chat-messages-container">
      <PageTitle chatUsername={otherUser.username} />
      <div className="chat-header">
        <div className="user-info">
          {otherUser.avatar_url ? (
            <img
              src={`${otherUser.avatar_url}`}
              alt={otherUser.username}
              className="chat-avatar"
            />
          ) : (
            <img
              src="/media/avatars/avatar.jpg"
              alt="Аватар за замовчуванням"
              className="chat-avatar"
            />
          )}
          <h2>{otherUser.username}</h2>
        </div>
      </div>
      <div className="messages-list">
        {messages.length === 0 ? (
          <p className="no-message">Немає повідомлень у цьому чаті.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`message ${
                message.sender_name === currentUser ? "sent" : "received"
              }`}
            >
              {message.sender_avatar_url ? (
                <img
                  src={`${message.sender_avatar_url}`}
                  alt="Аватар"
                  className="message-avatar"
                />
              ) : (
                <img
                  src="/media/avatars/avatar.jpg"
                  alt="Аватар за замовчуванням"
                  className="message-avatar"
                />
              )}
              <div className="message-content">
                <p>{message.text}</p>
                <small>
                  {new Intl.DateTimeFormat("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(message.sent_at))}{" "}
                </small>
              </div>
              {message.sender_name === currentUser && (
                <span className="message-status">
                  {message.is_read ? "" : <TbPointFilled />}
                </span>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="input-wrapper">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введіть повідомлення..."
            className="message-input"
          />
          <button type="submit" className="send-message-button">
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatMessages;
