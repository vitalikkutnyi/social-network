import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegUserCircle, FaSearch } from "react-icons/fa";
/* import { AiOutlineHome } from "react-icons/ai"; */

const Sidebar = () => {
    const navigate = useNavigate();

    /* const goToHomePage = () => navigate("/homepage/"); */
    const goToProfile = () => navigate("/profile/");
    const goToSearch = () => navigate("/search/");

    return (
        <div className="sidebar">
            <h2>Меню</h2>
            <ul>
                {/* <li>
                    <span onClick={goToHomePage} className="nav-link">
                        <AiOutlineHome className="nav-icon" />
                        Головна сторінка
                    </span>
                </li> */}
                <li>
                    <span onClick={goToProfile} className="nav-link">
                        <FaRegUserCircle className="nav-icon" />
                        Профіль
                    </span>
                </li>
                <li>
                    <span onClick={goToSearch} className="nav-link">
                        <FaSearch className="nav-icon" />
                        Пошук
                    </span>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;