import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login attempt with:', { email, password });
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Login failed');
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('token', resData.access_token);
      localStorage.setItem('user', JSON.stringify(resData.data));
      localStorage.setItem('permissions', JSON.stringify(resData.assigned_permissions));
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="logo-wrapper">
        <img src="/chota-beta-logo.jpg" alt="Chota Beta Logo" className="login-logo" />
      </div>

      <div className="login-card">
        <h1 className="login-title">Login to your Seller Console</h1>
        
        {error && <div className="error-message" style={{color: '#ff4d4d', marginBottom: '15px', fontSize: '14px', textAlign: 'center'}}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="email">Email address</label>
            </div>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#" className="forgot-password">I forgot password</a>
            </div>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <label className="remember-me">
            <input type="checkbox" disabled={loading} />
            <span>Remember me on this device</span>
          </label>

          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
