import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

const PageTitle = ({ chatUsername }) => {
  const location = useLocation();
  const { username, postId, chatId, pk } = useParams();

  useEffect(() => {
    const titles = {
      "/": "Головна",
      "/register/": "Реєстрація",
      "/login/": "Авторизація",
      "/search/": "Пошук",
      "/popular-posts/": "Популярне",
      "/chats/": "Чати",
      "/ai-chat/": "Спілкування з ШІ",
      "/profile/edit/": "Редагування профілю",
      "/users/search/": "Пошук",
      "/stories/": "Історії",
    };

    let baseTitle = "";
    const currentUsername = localStorage.getItem("username") || "Мій";

    const setTitle = async () => {
      if (location.pathname === "/profile/edit/") {
        baseTitle = "Редагування профілю";
      } else if (location.pathname.includes("/followers/")) {
        baseTitle = `Слідкувачі ${username || currentUsername}`;
      } else if (location.pathname.includes("/following/")) {
        baseTitle = `Слідкування ${username || currentUsername}`;
      } else if (location.pathname.includes("/posts/")) {
        if (location.pathname.includes("/likes/")) {
          baseTitle = "Вподобання";
        } else if (location.pathname.includes("/comments/")) {
          baseTitle = "Коментарі";
        } else {
          baseTitle = "Деталі допису";
        }
      } else if (location.pathname.startsWith("/profile/")) {
        if (username) {
          baseTitle = `${username}`;
        } else if (location.pathname === "/profile/") {
          baseTitle = `${currentUsername}`;
        }
      } else if (location.pathname.includes("/chats/")) {
        if (location.pathname.includes("/messages/")) {
          baseTitle = `Чат із ${chatUsername || chatId}`;
        } else {
          baseTitle = "Чати";
        }
      } else {
        baseTitle = titles[location.pathname] || "Lynquora";
      }

      document.title = `${baseTitle} / Lynquora`;
    };

    setTitle();
  }, [location, username, postId, chatId, pk, chatUsername]);

  return null;
};

export default PageTitle;
