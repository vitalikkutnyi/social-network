import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopSidebar from "./components/TopSidebar";
import Sidebar from "./components/Sidebar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import LikeList from "./pages/LikeList";
import FollowersList from "./pages/FollowersList";
import FollowingList from "./pages/FollowingList";
import PostDetailPage from "./pages/PostDetailPage";
import Comments from "./pages/Comments";
import Chats from "./pages/Chats";
import ChatMessages from "./pages/ChatMessages";
import AIChat from "./pages/AIChat";
import PopularPosts from "./pages/PopularPosts";
import { ThemeProvider } from "./context/ThemeContext";
import PageTitle from "./components/PageTitle";
import ProtectedRoute from "./components/ProtectedRoute";

const BASENAME = "/";

const AuthLayout = ({ children }) => {
  return (
    <>
      <TopSidebar />
      {children}
    </>
  );
};

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <TopSidebar />
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
};

const Layout = () => {
  return (
    <Routes>
      <Route
        path="/register/"
        element={
          <AuthLayout>
            <Register />
          </AuthLayout>
        }
      />
      <Route
        path="/login/"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />
      <Route
        path="*"
        element={
          <MainLayout>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/search/"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username/"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit/"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username/posts/:postId/likes/"
                element={
                  <ProtectedRoute>
                    <LikeList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username/followers/"
                element={
                  <ProtectedRoute>
                    <FollowersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username/following/"
                element={
                  <ProtectedRoute>
                    <FollowingList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username/posts/:pk/"
                element={
                  <ProtectedRoute>
                    <PostDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username/posts/:postId/comments/"
                element={
                  <ProtectedRoute>
                    <Comments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats/"
                element={
                  <ProtectedRoute>
                    <Chats />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chats/:chatId/messages/"
                element={
                  <ProtectedRoute>
                    <ChatMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai-chat/"
                element={
                  <ProtectedRoute>
                    <AIChat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/popular-posts/"
                element={
                  <ProtectedRoute>
                    <PopularPosts />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <div className="App">
      <ThemeProvider>
        <Router basename={BASENAME}>
          <PageTitle />
          <Layout />
        </Router>
      </ThemeProvider>
    </div>
  );
}

export default App;
