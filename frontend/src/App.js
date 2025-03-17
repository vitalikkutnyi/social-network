import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Register from './pages/Register';
import Login from './pages/Login';
import Search from "./pages/Search";
import Profile from './pages/Profile';
import EditProfile from "./pages/EditProfile";
import FollowersList from "./pages/FollowersList";
import FollowingList from "./pages/FollowingList";
import PostDetailPage from "./pages/PostDetailPage";
import Comments from "./pages/Comments";

const Layout = () => {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="app-container">
      {!hideSidebar && <Sidebar />} 
      <div className="main-content">
        <Routes>
          <Route path="/register/" element={<Register />} />
          <Route path="/login/" element={<Login />} />
          <Route path="/search/" element={<Search />} />
          <Route path="/profile/" element={<Profile />} />
          <Route path="/profile/:username/" element={<Profile />} />
          <Route path="/profile/edit/" element={<EditProfile />} />
          <Route path="/profile/:username/followers/" element={<FollowersList />} />
          <Route path="/profile/:username/following/" element={<FollowingList />} />
          <Route path="/profile/:username/posts/:pk/" element={<PostDetailPage />} />
          <Route path="/profile/:username/posts/:postId/comments/" element={<Comments />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Router>
        <Layout /> 
      </Router>
    </div>
  );
}

export default App;