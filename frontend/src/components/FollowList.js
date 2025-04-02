import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FollowButton from "./FollowButton";
import PageTitle from "../components/PageTitle";
import API from "../API";

const FollowList = ({ type }) => {
  const { username } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUsername = localStorage.getItem("username");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `/profile/${username}/${type}/`;
        const response = await API.get(url);

        setUsers(response.data);
      } catch (error) {
        console.error("ERROR", error);
        setError("Помилка при завантаженні списку.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, type]);

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="follow-list">
      <PageTitle />
      {users.length === 0 ? (
        <p>Список порожній.</p>
      ) : (
        <>
          <h2>
            {type === "followers"
              ? "Слідкувачі користувача "
              : "Слідкування користувача "}
            <span className="user">{username}</span>
          </h2>
          <ul>
            {users.map((user) => (
              <li
                key={user.id}
                onClick={() =>
                  navigate(
                    user.username === currentUsername
                      ? "/profile/"
                      : `/profile/${user.username}/`
                  )
                }
              >
                <div className="user-info">
                  {user.avatar_url ? (
                    <img
                      src={`http://127.0.0.1:8000${user.avatar_url}`}
                      alt={user.username}
                    />
                  ) : (
                    <img
                      src={"http://127.0.0.1:8000/media/avatars/avatar.jpg"}
                    />
                  )}
                  <span>{user.username}</span>
                </div>
                {user.username !== currentUsername && (
                  <div onClick={(event) => event.stopPropagation()}>
                    <FollowButton
                      username={user.username}
                      initialFollowing={user.is_following}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default FollowList;
