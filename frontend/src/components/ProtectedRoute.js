import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../API";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await API.get("/profile/", { withCredentials: true });

        if (response.data.username) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) return <div>Завантаження...</div>;

  return isAuthenticated ? children : <Navigate to="/login/" replace />;
};

export default ProtectedRoute;
