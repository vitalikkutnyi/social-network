import React, { useState, useEffect } from "react";
import { FaImage, FaVideo, FaTrash } from "react-icons/fa";
import API from "../API";

const Story = ({ username, avatarUrl, isOwnProfile, viewerId }) => {
  const [stories, setStories] = useState([]);
  const [viewedStories, setViewedStories] = useState(() => {
    const saved = localStorage.getItem(`viewedStories_${username}_${viewerId}`);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyImage, setStoryImage] = useState(null);
  const [storyVideo, setStoryVideo] = useState(null);
  const [storyLoading, setStoryLoading] = useState(false);
  const [storyError, setStoryError] = useState(null);

  const effectiveViewerId = viewerId || "guest";

  const fetchStories = async () => {
    try {
      const response = await API.get(`/stories/?username=${username}`);
      setStories(response.data);
    } catch (error) {
      console.error(
        "Помилка завантаження сторіз:",
        error.response?.data || error.message
      );
    }
  };

  const fetchViewedStories = async () => {
    if (effectiveViewerId === "guest") {
      return;
    }
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.error("Токен відсутній!");
        setViewedStories(new Set());
        return;
      }
      const response = await API.get(
        `/viewed-stories/?viewer_id=${effectiveViewerId}&username=${username}`
      );
      const viewed = new Set(response.data.map((item) => item.story_id));
      setViewedStories(viewed);
    } catch (error) {
      console.error(
        "Помилка завантаження переглянутих:",
        error.response?.data || error.message
      );
      setViewedStories(new Set());
    }
  };

  const markStoryAsViewed = async (storyId) => {
    if (viewedStories.has(storyId)) {
      return;
    }

    const updated = new Set(viewedStories);
    updated.add(storyId);
    setViewedStories(updated);

    if (effectiveViewerId === "guest") {
      localStorage.setItem(
        `viewedStories_${username}_${effectiveViewerId}`,
        JSON.stringify([...updated])
      );
    } else {
      try {
        const token = localStorage.getItem("access_token");
        const response = await API.post("/viewed-stories/", {
          story_id: storyId,
          user_id: effectiveViewerId,
        });
      } catch (error) {
        console.error(
          "Помилка відправки перегляду:",
          error.response?.data || error.message
        );
      }
    }
  };

  const deleteViewedStory = async (storyId) => {
    if (effectiveViewerId === "guest") {
      const updated = new Set(viewedStories);
      updated.delete(storyId);
      setViewedStories(updated);
      localStorage.setItem(
        `viewedStories_${username}_${effectiveViewerId}`,
        JSON.stringify([...updated])
      );
      return;
    }
    try {
      await API.delete(`/viewed-stories/${storyId}/`, {
        data: { user_id: effectiveViewerId },
      });
      setViewedStories((prev) => {
        const updated = new Set(prev);
        updated.delete(storyId);
        return updated;
      });
    } catch (error) {
      console.error(
        "Помилка видалення перегляду:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchStories();
    fetchViewedStories();
  }, [username, effectiveViewerId]);

  const handleViewStory = () => {
    if (stories.length > 0 && stories[0].id) {
      setIsViewModalOpen(true);
      setCurrentStoryIndex(0);
      const storyId = stories[0].id;
      markStoryAsViewed(storyId);
    } else {
      console.error("Немає валідного ID у сторіз!");
    }
  };

  const handleNextStory = () => {
    const nextIndex = currentStoryIndex + 1;
    if (nextIndex < stories.length && stories[nextIndex].id) {
      const storyId = stories[nextIndex].id;
      setCurrentStoryIndex(nextIndex);
      markStoryAsViewed(storyId);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  const handleCreateStory = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setStoryImage(null);
    setStoryVideo(null);
    setStoryError(null);
  };

  const handleCreateStorySubmit = async (e) => {
    e.preventDefault();
    if (!storyImage && !storyVideo) {
      setStoryError("Виберіть зображення або відео!");
      return;
    }

    setStoryLoading(true);
    setStoryError(null);

    const formData = new FormData();
    if (storyImage) formData.append("image", storyImage);
    if (storyVideo) formData.append("video", storyVideo);

    try {
      const response = await API.post("/stories/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStories((prev) => [...prev, response.data]);
      handleCloseCreateModal();
      fetchStories();
    } catch (error) {
      setStoryError(error.response?.data?.detail || "Помилка створення!");
      console.error("Помилка:", error.response?.data || error.message);
    } finally {
      setStoryLoading(false);
    }
  };

  const handleDeleteStory = async () => {
    const storyId = stories[currentStoryIndex].id;
    try {
      await API.delete(`/stories/${storyId}/`, {});
      if (viewedStories.has(storyId)) {
        await deleteViewedStory(storyId);
      }

      const updatedStories = stories.filter((story) => story.id !== storyId);
      setStories(updatedStories);

      if (updatedStories.length === 0) {
        setIsViewModalOpen(false);
      } else if (currentStoryIndex >= updatedStories.length) {
        setCurrentStoryIndex(updatedStories.length - 1);
      }
    } catch (C) {
      console.error("Помилка видалення:", C.response?.data || C.message);
      alert("Не вдалося видалити!");
    }
  };

  const hasStories = stories.length > 0;
  const allViewed =
    hasStories && stories.every((story) => viewedStories.has(story.id));

  const avatarRingClass = hasStories ? (allViewed ? "viewed" : "active") : "";

  return (
    <div className="stories-container">
      <div
        className={`avatar-wrapper ${avatarRingClass}`}
        onClick={handleViewStory}
      >
        <img src={avatarUrl} alt="Аватар" className="profile-avatar" />
        {isOwnProfile && (
          <button
            className="create-story-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCreateStory();
            }}
          >
            +
          </button>
        )}
      </div>

      {isViewModalOpen && (
        <div className="story-modal">
          <div className="story-modal-content">
            <button
              className="story-modal-close"
              onClick={handleCloseViewModal}
            >
              ×
            </button>
            <button
              className="story-modal-prev"
              onClick={handlePrevStory}
              disabled={currentStoryIndex === 0}
            >
              ←
            </button>
            <button
              className="story-modal-next"
              onClick={handleNextStory}
              disabled={currentStoryIndex === stories.length - 1}
            >
              →
            </button>
            {isOwnProfile && (
              <button
                className="story-modal-delete"
                onClick={handleDeleteStory}
              >
                <FaTrash />
              </button>
            )}
            {stories[currentStoryIndex]?.image ? (
              <img
                src={stories[currentStoryIndex].image}
                alt="Story"
                className="story-media"
              />
            ) : stories[currentStoryIndex]?.video ? (
              <video
                src={stories[currentStoryIndex].video}
                autoPlay
                controls
                className="story-media"
              />
            ) : (
              <p>Немає контенту</p>
            )}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <div className="create-story-modal">
          <div className="create-story-modal-content">
            <h2>Створити сторіз</h2>
            <form onSubmit={handleCreateStorySubmit}>
              <div className="media-buttons">
                <label
                  htmlFor="story-image-upload"
                  className={`media-button ${storyImage ? "selected" : ""}`}
                >
                  <FaImage />
                </label>
                <label
                  htmlFor="story-video-upload"
                  className={`media-button ${storyVideo ? "selected" : ""}`}
                >
                  <FaVideo />
                </label>
              </div>
              <input
                type="file"
                id="story-image-upload"
                accept="image/*"
                onChange={(e) => {
                  setStoryImage(e.target.files[0]);
                  setStoryVideo(null);
                }}
              />
              <input
                type="file"
                id="story-video-upload"
                accept="video/*"
                onChange={(e) => {
                  setStoryVideo(e.target.files[0]);
                  setStoryImage(null);
                }}
              />
              <div className="selected-files">
                {storyImage && <p>Фото: {storyImage.name}</p>}
                {storyVideo && <p>Відео: {storyVideo.name}</p>}
              </div>
              <div className="create-story-buttons">
                <button type="submit" disabled={storyLoading}>
                  {storyLoading ? "Створення..." : "Опублікувати"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  disabled={storyLoading}
                >
                  Скасувати
                </button>
              </div>
              {storyError && <p className="error">{storyError}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Story;
