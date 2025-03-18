import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Fix import
import { useNavigate } from 'react-router-dom';

const SignUp = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null); // State to hold the error message
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
      const response = await axios({
        method: 'post',
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/signup`,
        headers: {
          'Content-Type': 'application/json', // Set the content type header
        },
        data: formData, // Send the form data as JSON
      });

      if (response.status === 201) {
        // Automatically log in after a successful signup
        await handleLogin();
      }
    } catch (error) {
      console.error('Sign up failed', error);
      setError(error.response?.data?.errors?.[0]?.msg || 'Sign up failed. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios({
        method: 'post',
        url: `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        headers: {
          'Content-Type': 'application/json', // Set the content type header
        },
        data: {
          username: formData.username,
          password: formData.password,
        }, // Use the same form data for login
      });

      if (response.status === 200) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.id;
        localStorage.setItem('userId', userId);

        onLogin(); // Notify parent component of login
        navigate('/posts/feed'); // Redirect to feed page
      }
    } catch (error) {
      console.error('Login failed', error);
      setError('Login failed. Please check your username and password and try again.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-white">Sign Up</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields for email, username, password, and confirmPassword */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
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
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
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
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 bg-zinc-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
            placeholder="Confirm your password"
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>} {/* Display error message if exists */}
        <button
          type="submit"
          className="w-full p-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors duration-300"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUp;
