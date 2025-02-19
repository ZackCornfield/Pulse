import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { checkAuth } from './services/checkAuth'; // A utility function to check if user is logged in

import UnauthenticatedPage from './pages/UnauthenticatedPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import Post from './pages/Post';
import Feed from './pages/Feed';
import Users from './pages/Users';
import PostForm from './pages/PostForm';
import Notifications from './pages/Notifications';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthenticatedLayout from './contexts/AuthenticatedLayout';
import { UserProvider } from './contexts/UserContext';
import { PuffLoader } from 'react-spinners';



const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if the user is authenticated on component mount
    checkAuth().then((isAuth) => setIsAuthenticated(isAuth));
  }, []);

  if (isAuthenticated === null) {
    return <div className='h-screen w-screen bg-gray-300'>
      <div className="flex flex-col justify-center items-center h-full">
        <PuffLoader color="#424347" size={60} />
        <p className='mt-3 font-semibold text-sm text-gray-950'>Please be patient as the server wakes up!</p>
      </div>
    </div>;
  }

  return (
    <Router>
      <Routes>
        {/* Routes for unauthenticated users */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/feed" /> : <UnauthenticatedPage />} />

        {/* Protected routes */}
        {isAuthenticated ? (
          <Route 
            element={
              <NotificationsProvider>
                <UserProvider>
                  <AuthenticatedLayout />
                </UserProvider>
              </NotificationsProvider>
            }
          >
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/submit-post/:postId?" element={<PostForm />} />
              <Route path="/posts/:postId" element={<Post />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/notifications" element={<Notifications />} />

              {/* User list routes */}
              <Route path="/posts/:id/liked" element={<Users scenario="likedPost" />} />
              <Route path="/comments/:id/liked" element={<Users scenario="likedComment" />} />
              <Route path="/users/:id/followers" element={<Users scenario="followers" />} />
              <Route path="/users/:id/following" element={<Users scenario="following" />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/" />} />
        )}

        {/* Catch-all route for handling invalid routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;