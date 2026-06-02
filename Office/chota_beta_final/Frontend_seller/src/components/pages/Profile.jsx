import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Header */}
        <div className="profile-header">
          <div className="header-titles">
            <h2 className="section-title">Profile</h2>
            <div className="breadcrumb">
              <span className="home" onClick={() => navigate('/')}>Home</span>
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
              src="https://ui-avatars.com/api/?name=Shyam&background=random" 
              alt="Profile" 
              className="profile-large-avatar"
            />
          </div>
          
          <div className="profile-details-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value">Shyam</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">grocery.cb@gmail.com</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Mobile</span>
              <span className="detail-value">8886660033</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">7</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Created At</span>
              <span className="detail-value">Mar 24, 2026</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Last Updated</span>
              <span className="detail-value">May 18, 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
