import React from "react";
import { useNavigate } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const TopSidebar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="top-sidebar">
      <h1 className="top-sidebar-title" onClick={handleClick}>
        Lynquora
      </h1>
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === "light" ? <FiSun /> : <FiMoon />}
      </button>
    </div>
  );
};

export default TopSidebar;
