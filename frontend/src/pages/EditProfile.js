import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../API";

const EditProfile = () => {
  const [data, setData] = useState({
    username: "",
    bio: "",
    avatar: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const goToProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get("/profile/edit/");

        setData({
          username: response.data.username,
          bio: response.data.bio,
          avatar: response.data.avatar || "",
        });
      } catch (error) {
        setError("Не вдалося завантажити дані профілю.");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setData({ ...data, avatar: file, avatarPreview: fileURL });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const dataToSend = new FormData();
    if (data.username) dataToSend.append("username", data.username);
    if (data.bio) dataToSend.append("bio", data.bio);
    if (data.avatar instanceof File) {
      dataToSend.append("avatar", data.avatar);
    }

    try {
      const response = await API.put("/profile/edit/", dataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setData({
        username: response.data.username,
        bio: response.data.bio,
        avatar: response.data.avatar || "",
      });
      setSuccess(true);
    } catch (error) {
      setError("Не вдалося оновити профіль.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await API.delete("/profile/edit/");
      navigate("/login/");
    } catch (error) {
      console.error("Помилка видалення акаунта:", error);
      setError("Не вдалося видалити акаунт.");
    }
  };

  return (
    <div className="profile-edit-container">
      <h2 className="profile-edit-container-title">Редагування профілю</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="file-input-container">
          <input
            type="file"
            accept="image/*"
            name="avatar"
            id="avatar"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <div>
            {data.avatarPreview ? (
              <img
                src={data.avatarPreview}
                className="file-input-container-avatar"
              />
            ) : data.avatar ? (
              <img
                src={`http://127.0.0.1:8000${data.avatar}`}
                className="file-input-container-avatar"
              />
            ) : (
              <img
                src={"http://127.0.0.1:8000/media/avatars/avatar.jpg"}
                className="file-input-container-avatar"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => document.getElementById("avatar").click()}
            className="file-input-button"
          >
            Вибрати файл
          </button>
        </div>
        <label htmlFor="username">Ім'я користувача:</label>
        <input
          type="text"
          name="username"
          id="username"
          value={data.username || ""}
          onChange={handleChange}
        />
        <label htmlFor="bio">Біографія:</label>
        <textarea
          type="text"
          name="bio"
          id="bio"
          value={data.bio || ""}
          onChange={handleChange}
        />
        <div className="buttons">
          <button type="submit" disabled={loading}>
            {loading ? "Оновлення..." : "Зберегти зміни"}
          </button>
          <button type="button" onClick={goToProfile}>
            Назад
          </button>
        </div>
        <div className="separator"></div>
        <div className="profile-delete-container">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="profile-delete-button"
          >
            Видалити акаунт
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
