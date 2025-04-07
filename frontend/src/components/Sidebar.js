import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SiHomepage } from "react-icons/si";
import { FaRegUserCircle, FaHotjar } from "react-icons/fa";
import { ImSearch } from "react-icons/im";
import { TbMessage2Filled } from "react-icons/tb";
import { BsRobot } from "react-icons/bs";
import { TbLogout } from "react-icons/tb";
import API from "../API";

const Sidebar = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const goToHomePage = useCallback(() => navigate("/"), [navigate]);
  const goToProfile = useCallback(() => navigate("/profile/"), [navigate]);
  const goToSearch = useCallback(() => navigate("/search/"), [navigate]);
  const goToChats = useCallback(() => navigate("/chats/"), [navigate]);
  const goToTop = useCallback(() => navigate("/popular-posts/"), [navigate]);
  const goToAIChat = useCallback(() => navigate("/ai-chat/"), [navigate]);

  const handleLogout = async () => {
    try {
      const response = await API.post("/api/logout/");

      if (response.status === 200) {
        navigate("/login/");
        localStorage.removeItem("username");
        setMessage(response.data.message);
        setError("");
      }
    } catch (error) {
      console.error("Помилка при виході:", error);
      setError("Сталася помилка при виході з акаунта");
      setMessage("");
    }
  };

  return (
    <div className="sidebar">
      <h2>Меню</h2>
      <ul>
        <li onClick={goToHomePage}>
          <span className="nav-link">
            <SiHomepage className="nav-icon" />
            Головна
          </span>
        </li>
        <li onClick={goToProfile}>
          <span className="nav-link">
            <FaRegUserCircle className="nav-icon" />
            Профіль
          </span>
        </li>
        <li onClick={goToSearch}>
          <span className="nav-link">
            <ImSearch className="nav-icon" />
            Пошук
          </span>
        </li>
        <li onClick={goToChats}>
          <span className="nav-link">
            <TbMessage2Filled className="nav-icon" />
            Чати
          </span>
        </li>
        <li onClick={goToAIChat}>
          <span className="nav-link">
            <BsRobot className="nav-icon" />
            Спілкування з ШІ
          </span>
        </li>
        <li onClick={goToTop}>
          <span className="nav-link">
            <FaHotjar className="nav-icon" />
            Популярне
          </span>
        </li>
      </ul>
      <div className="sidebar-bottom">
        <div onClick={handleLogout} className="sidebar-logout">
          <span className="nav-link">
            <TbLogout className="nav-icon" />
            Вихід
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
