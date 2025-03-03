import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import FollowList from './pages/FollowList';
import ChatList from './pages/ChatList';
import ChatDetail from './pages/ChatDetail';
import UserProfile from './pages/UserProfile';
import UserSearch from './pages/UserSearch';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div className="App">
        <Router>
            <Routes>
                <Route path="/register/" element={<Register />} />
                {/* <Route path="/login/" element={<Login />} />
                <Route path="/profile/" element={<Profile />} />
                <Route path="/profile/edit/" element={<EditProfile />} />
                <Route path="/profile/:user_id/follow/" element={<FollowList />} />
                <Route path="/profile/int:user_id/followers/" element={<FollowList />} />
                <Route path="/chats/" element={<ChatList />} />
                <Route path="/chats/:pk/" element={<ChatDetail />} />
                <Route path="/profile/:user_id/" element={<UserProfile />} />
                <Route path="/profile/search/" element={<UserSearch />} />
                <Route path="/homepage/" element={<HomePage />} /> */}
            </Routes>
        </Router>
    </div>
  );
}

export default App;
