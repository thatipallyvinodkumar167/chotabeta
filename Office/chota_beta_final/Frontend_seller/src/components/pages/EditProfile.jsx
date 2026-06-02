import React from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="edit-profile-page">
      {/* Edit Profile Card */}
      <div className="edit-card">
        <div className="edit-header">
          <div className="header-titles">
            <h2 className="section-title">Edit Profile</h2>
            <div className="breadcrumb">
              <span className="home" onClick={() => navigate('/')}>Home</span>
              <span className="separator">/</span>
              <span className="home" onClick={() => navigate('/profile')}>Profile</span>
              <span className="separator">/</span>
              <span className="current active">Edit Profile</span>
            </div>
          </div>
        </div>

        <div className="edit-body">
          <div className="edit-layout">
            <div className="edit-image-col">
              <div className="image-label">Profile Image</div>
              <img 
                src="https://ui-avatars.com/api/?name=Shyam&background=random" 
                alt="Profile" 
                className="edit-avatar"
              />
              <div className="drag-drop-area">
                <span className="drag-text">Drag & Drop your files or </span>
                <span className="browse-link">Browse</span>
              </div>
              <div className="supported-formats">
                Supported formats: JPEG, PNG, JPG, WEBP. Maximum size: 2MB.
              </div>
            </div>

            <div className="edit-form-col">
              <div className="form-group">
                <label>Name <span className="required">*</span></label>
                <input type="text" className="form-control" defaultValue="Shyam" />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="form-control" defaultValue="grocery.cb@gmail.com" disabled />
                <span className="help-text">Email address cannot be changed</span>
              </div>
              
              <div className="form-group">
                <label>Mobile</label>
                <input type="text" className="form-control" defaultValue="8886660033" disabled />
                <span className="help-text">Mobile Number cannot be changed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="edit-footer">
          <button className="btn-cancel" onClick={() => navigate('/profile')}>Cancel</button>
          <button className="btn-save">Update Profile</button>
        </div>
      </div>

      {/* Update Password Card */}
      <div className="edit-card">
        <div className="edit-header">
          <div className="header-titles">
            <h2 className="section-title">Update Password</h2>
            <div className="breadcrumb">
              <span className="home" onClick={() => navigate('/')}>Home</span>
              <span className="separator">/</span>
              <span className="home" onClick={() => navigate('/profile')}>Profile</span>
              <span className="separator">/</span>
              <span className="current active">Edit Profile</span>
            </div>
          </div>
        </div>

        <div className="edit-body">
          <div className="password-grid">
            <div className="form-group">
              <label>Current Password <span className="required">*</span></label>
              <input type="password" className="form-control" />
            </div>
            <div className="form-group">
              <label>New Password <span className="required">*</span></label>
              <input type="password" className="form-control" />
            </div>
            <div className="form-group">
              <label>Confirm Password <span className="required">*</span></label>
              <input type="password" className="form-control" />
            </div>
          </div>
        </div>

        <div className="edit-footer">
          <button className="btn-cancel" onClick={() => navigate('/profile')}>Cancel</button>
          <button className="btn-save">Update Password</button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
