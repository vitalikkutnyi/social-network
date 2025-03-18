import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/App.css";
import "./styles/Sidebar.css";
import "./styles/Auth.css";
import "./styles/Search.css";
import "./styles/Profile.css";
import "./styles/Post.css";
import "./styles/CreatePost.css";
import "./styles/EditProfile.css";
import "./styles/FollowList.css";
import "./styles/FollowButton.css";
import "./styles/PostDetailPage.css";
import "./styles/Comments.css";
import "./styles/Chats.css";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
