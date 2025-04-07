import React, { useState } from "react";
import { FaImage, FaVideo, FaMusic } from "react-icons/fa";
import API from "../API";

const CreatePost = ({ username, onPostCreated }) => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postText, setPostText] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);
  const [postAudio, setPostAudio] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);

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
      const response = await API.post(
        `/api/profile/${username}/posts/create/`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (onPostCreated) {
        onPostCreated(response.data);
      }
      toggleCreatePost();
    } catch (err) {
      setPostError(err.response?.data?.detail || "Не вдалося створити допис.");
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <>
      <button className="create-post-button" onClick={toggleCreatePost}>
        +
      </button>
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
                <label
                  htmlFor="image-upload"
                  className={`media-button ${postImage ? "selected" : ""}`}
                  title="Додати фото"
                >
                  <FaImage />
                </label>
                <label
                  htmlFor="video-upload"
                  className={`media-button ${postVideo ? "selected" : ""}`}
                  title="Додати відео"
                >
                  <FaVideo />
                </label>
                <label
                  htmlFor="audio-upload"
                  className={`media-button ${postAudio ? "selected" : ""}`}
                  title="Додати аудіо"
                >
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
                <button
                  type="button"
                  onClick={toggleCreatePost}
                  disabled={postLoading}
                >
                  Скасувати
                </button>
              </div>
              {postError && <p className="error">{postError}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePost;
