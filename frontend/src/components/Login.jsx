import { useState } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(''); // State to hold the error message
  const navigate = useNavigate(); // Initialize React Router's navigate function

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api({
        method: 'post',
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        headers: {
          'Content-Type': 'application/json', // Set the content type header
        },
        data: formData, // Send the form data as JSON
      });
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        localStorage.setItem('userId', userId);

        onLogin(); // Notify parent component of login
        navigate('/posts/feed'); // Use React Router for navigation
      }
    } catch (error) {
      console.error('Login failed', error);
      setError('Login failed. Please check your username and password and try again.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const response = await api({
        method: 'post',
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/login/demo`,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        localStorage.setItem('userId', userId);
        navigate('/posts/feed'); // Use React Router for navigation
      }
    } catch (error) {
      console.error('Demo login failed', error);
      setError('Unable to login to the demo account. Please try again later.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Enter your password"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>} {/* Display error message if exists */}
        <button
          type="submit"
          className="w-full p-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-300"
        >
          Login
        </button>
        {/* Demo Login Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full p-3 bg-zinc-800 text-white font-semibold rounded-lg hover:bg-zinc-900 transition-colors duration-300 mt-4"
        >
          Try Demo
        </button>
      </form>
    </div>
  );
};

export default Login;
