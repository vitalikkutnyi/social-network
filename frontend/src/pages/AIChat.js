import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";
import PageTitle from "../components/PageTitle";
import API from "../API";
import ReactMarkdown from "react-markdown";

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = {
      message_id: Date.now(),
      text: newMessage,
      sender_name: "Ви",
      sender_avatar_url: null,
      sent_at: new Date().toISOString(),
      is_read: true,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setNewMessage("");
    setLoading(true);
    setError(null);

    try {
      const response = await API.post(
        "/ai-chat/",
        { message: newMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse = response.data.response;

      const aiMessage = {
        message_id: Date.now() + 1,
        text: aiResponse,
        sender_name: "ChatGPT",
        sender_avatar_url: null,
        sent_at: new Date().toISOString(),
        is_read: true,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (err) {
      setError("Не вдалося отримати відповідь від ШІ.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-messages-container">
      <PageTitle chatUsername="Google Gemini" />
      <div className="chat-header">
        <div className="user-info">
          <img
            src="http://127.0.0.1:8000/media/avatars/gemini.png"
            alt="Google Gemini"
            className="chat-avatar"
          />
          <h2>Google Gemini</h2>
        </div>
      </div>
      <div className="messages-list">
        {messages.length === 0 ? (
          <p className="no-message">Почніть спілкування з ШІ!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`message ${
                message.sender_name === "Ви" ? "sent" : "received"
              }`}
            >
              {message.sender_name === "Ви" ? (
                <img
                  src="http://127.0.0.1:8000/media/avatars/avatar.jpg"
                  alt="Ви"
                  className="message-avatar"
                />
              ) : (
                <img
                  src="http://127.0.0.1:8000/media/avatars/gemini.png"
                  alt="Google Gemini"
                  className="message-avatar"
                />
              )}
              <div className="message-content">
                <p>
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </p>
                <small>
                  {new Intl.DateTimeFormat("uk-UA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(message.sent_at))}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {loading && <p>ШІ думає...</p>}
      {error && <p>{error}</p>}
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

export default AIChat;
