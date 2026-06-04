import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/auth/profile`, { headers });
        const resData = await response.json();
        if (resData.success) {
          setProfile(resData.data);
        } else {
          setError(resData.message || 'Failed to fetch profile data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="profile-page" style={{ color: '#fff', padding: '24px' }}>Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-page" style={{ color: '#ff4d4d', padding: '24px' }}>Error: {error}</div>;
  }

  // Prepend raw base URL for profile image if it is relative
  const rawBaseUrl = API_BASE_URL.replace(/\/api\/seller$/, '').replace(/\/$/, '');
  const avatarUrl = profile.profile_image
    ? (profile.profile_image.startsWith('http') ? profile.profile_image : `${rawBaseUrl}${profile.profile_image}`)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=random`;

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="header-titles">
            <h2 className="section-title">Profile</h2>
            <div className="breadcrumb">
              <span className="home" onClick={() => navigate('/dashboard')}>Home</span>
              <span className="separator">/</span>
              <span className="current active">Profile</span>
            </div>
          </div>
          <button 
            className="btn-edit-profile"
            onClick={() => navigate('/edit-profile')}
          >
            <Edit size={16} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Content */}
        <div className="profile-content">
          <div className="profile-image-section">
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="profile-large-avatar"
            />
          </div>
          
          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">{profile.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{profile.email || 'N/A'}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">{profile.mobile || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">{profile.id}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">{formatDate(profile.created_at)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">{formatDate(profile.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
