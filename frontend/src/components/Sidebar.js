import React from "react";
import { useNavigate } from "react-router-dom";
import { SiHomepage } from "react-icons/si";
import { FaRegUserCircle } from "react-icons/fa";
import { ImSearch } from "react-icons/im";
import { TbMessage2Filled } from "react-icons/tb";

const Sidebar = () => {
  const navigate = useNavigate();

  const goToHomePage = () => navigate("/homepage/");
  const goToProfile = () => navigate("/profile/");
  const goToSearch = () => navigate("/search/");
  const goToChats = () => navigate("/chats/");

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
      </ul>
    </div>
  );
};

export default Sidebar;
