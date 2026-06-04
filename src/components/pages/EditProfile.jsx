import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States for Profile Info
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [profileImage, setProfileImage] = useState(''); // Stores filename returned by server
  const [previewUrl, setPreviewUrl] = useState(''); // Stores full url for preview image
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);

  // States for Password Info
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // States for Image Upload status
  const [uploading, setUploading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/profile`, { headers: getHeaders() });
        const resData = await response.json();
        if (resData.success) {
          setProfile(resData.data);
          setName(resData.data.name || '');
          setEmail(resData.data.email || '');
          setMobile(resData.data.mobile || '');
          setPreviewUrl(resData.data.profile_image);
          // Extract filename if it is a relative url
          if (resData.data.profile_image && !resData.data.profile_image.startsWith('http')) {
            const parts = resData.data.profile_image.split('/');
            setProfileImage(parts[parts.length - 1]);
          }
        } else {
          setProfileError(resData.message || 'Failed to load profile');
        }
      } catch (err) {
        setProfileError(err.message || 'An error occurred loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('File size exceeds the 2MB limit');
      return;
    }

    try {
      setUploading(true);
      setProfileError('');
      setProfileSuccess('');

      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      const resData = await response.json();
      if (resData.success) {
        setProfileImage(resData.data.filename);
        
        // Setup full URL preview
        const rawBaseUrl = API_BASE_URL.replace(/\/api\/seller$/, '').replace(/\/$/, '');
        setPreviewUrl(`${rawBaseUrl}${resData.data.url}`);
        setProfileSuccess('Profile image uploaded. Don\'t forget to click Update Profile to save changes.');
      } else {
        setProfileError(resData.message || 'Image upload failed');
      }
    } catch (err) {
      setProfileError(err.message || 'Image upload failed due to network error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          name,
          email,
          mobile,
          profile_image: profileImage
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setProfileSuccess('Profile updated successfully!');
        // Update stored user in localStorage
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        storedUser.name = resData.data.name;
        storedUser.email = resData.data.email;
        storedUser.mobile = resData.data.mobile;
        storedUser.profile_image = resData.data.profile_image;
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        // Fire custom event to sync with TopNavbar in real time
        window.dispatchEvent(new Event('seller_user_updated'));
        
        // Redirect to profile after a short delay
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        setProfileError(resData.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError(err.message || 'Network error updating profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setPasswordSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(resData.message || 'Failed to update password');
      }
    } catch (err) {
      setPasswordError(err.message || 'Network error updating password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-page" style={{ color: '#fff', padding: '24px' }}>Loading...</div>;
  }

  // Prepend base url if previewUrl is relative and starts with slash
  const rawBaseUrl = API_BASE_URL.replace(/\/api\/seller$/, '').replace(/\/$/, '');
  const finalAvatarUrl = previewUrl ? (previewUrl.startsWith('http') ? previewUrl : `${rawBaseUrl}${previewUrl}`) : `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=random`;

  return (
    <div className="edit-profile-page">
      {/* Hidden file selector */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={handleFileChange} 
      />

      {/* Edit Profile Card */}
      <div className="edit-card">
        <div className="edit-header">
          <div className="header-titles">
            <h2 className="section-title">Edit Profile</h2>
            <div className="breadcrumb">
              <span className="home" onClick={() => navigate('/dashboard')}>Home</span>
              <span className="separator">/</span>
              <span className="home" onClick={() => navigate('/profile')}>Profile</span>
              <span className="separator">/</span>
              <span className="current active">Edit Profile</span>
            </div>
          </div>
        </div>

        <div className="edit-body">
          {profileError && <div className="error-message" style={{ color: '#ef4444', marginBottom: '15px' }}>{profileError}</div>}
          {profileSuccess && <div className="success-message" style={{ color: '#10b981', marginBottom: '15px' }}>{profileSuccess}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="edit-layout">
              <div className="edit-image-col">
                <div className="image-label">Profile Image</div>
                <img 
                  src={finalAvatarUrl} 
                  alt="Profile" 
                  className="edit-avatar"
                />
                <div 
                  className="drag-drop-area"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                >
                  <span className="drag-text">Drag & Drop your files or </span>
                  <span className="browse-link">Browse</span>
                </div>
                <div className="supported-formats">
                  {uploading ? 'Uploading image...' : 'Supported formats: JPEG, PNG, JPG, WEBP. Maximum size: 2MB.'}
                </div>
              </div>

              <div className="edit-form-col">
                <div className="form-group">
                  <label>Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
                
                <div className="form-group">
                  <label>Mobile</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={mobile} 
                    onChange={(e) => setMobile(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            <div className="edit-footer">
              <button type="button" className="btn-cancel" onClick={() => navigate('/profile')}>Cancel</button>
              <button type="submit" className="btn-save" disabled={profileSaving || uploading}>
                {profileSaving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Update Password Card */}
      <div className="edit-card">
        <div className="edit-header">
          <div className="header-titles">
            <h2 className="section-title">Update Password</h2>
            <div className="breadcrumb">
              <span className="home" onClick={() => navigate('/dashboard')}>Home</span>
              <span className="separator">/</span>
              <span className="home" onClick={() => navigate('/profile')}>Profile</span>
              <span className="separator">/</span>
              <span className="current active">Edit Profile</span>
            </div>
          </div>
        </div>

        <div className="edit-body">
          {passwordError && <div className="error-message" style={{ color: '#ef4444', marginBottom: '15px' }}>{passwordError}</div>}
          {passwordSuccess && <div className="success-message" style={{ color: '#10b981', marginBottom: '15px' }}>{passwordSuccess}</div>}

          <form onSubmit={handleUpdatePassword}>
            <div className="password-grid">
              <div className="form-group">
                <label>Current Password <span className="required">*</span></label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>New Password <span className="required">*</span></label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Confirm Password <span className="required">*</span></label>
                <input 
                  type="password" 
                  className="form-control" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="edit-footer">
              <button type="button" className="btn-cancel" onClick={() => navigate('/profile')}>Cancel</button>
              <button type="submit" className="btn-save" disabled={passwordSaving}>
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
