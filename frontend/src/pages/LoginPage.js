import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);

      if (result.success) {
        // Redirect based on user role
        const roleRoutes = {
          physician: '/physician-dashboard',
          patient: '/patient-dashboard',
          nurse: '/nurse-dashboard',
          admin: '/admin-dashboard'
        };

        navigate(roleRoutes[result.user.role] || '/');
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Login to Unified Patient Manager</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-users">
          <h3>Demo Users</h3>
          <div className="user-list">
            <div className="user-item">
              <strong>Physician:</strong> dr.smith / physician123
            </div>
            <div className="user-item">
              <strong>Patient:</strong> john.doe / patient123
            </div>
            <div className="user-item">
              <strong>Nurse:</strong> nurse.jane / nurse123
            </div>
            <div className="user-item">
              <strong>Admin:</strong> admin / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
