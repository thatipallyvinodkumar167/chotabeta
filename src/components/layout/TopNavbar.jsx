import React, { useState, useEffect } from 'react';
import { Sun, Moon, Languages, Bell, User, LogOut, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './TopNavbar.css';

const TopNavbar = ({ onThemeToggle, theme }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [currentLang, setCurrentLang] = useState('English');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const resData = await response.json();
      if (resData.success) {
        setNotifications(resData.data.slice(0, 5)); // Show top 5 in dropdown
        setUnreadCount(resData.data.filter(n => n.status === 'Unread').length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);
  return (
    <div className="top-navbar">
      <div className="navbar-left">
        <span className="brand-text">
          Chota Beta <span className="separator">|</span> More Sellers. More Choices. Better Deals.
        </span>
        <span className="vendor-badge">Multiple Vendor</span>
      </div>
      
      <div className="navbar-right">
        <button className="icon-btn theme-toggle" onClick={onThemeToggle}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div 
          className="status-badge" 
          style={{ cursor: 'pointer' }}
          onClick={() => navigate('/plans')}
        >
          <span className="active-dot">ACTIVE</span>
          <span className="trial-text">FREE TRIAL</span>
        </div>
        
        <div className="language-wrapper" style={{ position: 'relative' }}>
          <button 
            className="icon-btn lang-toggle"
            title={`Language: ${currentLang}`}
            onClick={() => {
              setShowLangMenu(!showLangMenu);
              setShowNotificationsMenu(false);
              setShowProfileMenu(false);
            }}
          >
            <Languages size={20} />
          </button>

          {showLangMenu && (
            <div className="profile-dropdown-menu" style={{ minWidth: '120px', right: '-10px' }}>
              <div className="profile-dropdown-item" onClick={() => { setCurrentLang('English'); setShowLangMenu(false); }}>
                English {currentLang === 'English' && <CheckCheck size={14} style={{ marginLeft: 'auto' }}/>}
              </div>
              <div className="profile-dropdown-item" onClick={() => { setCurrentLang('Hindi'); setShowLangMenu(false); }}>
                Hindi {currentLang === 'Hindi' && <CheckCheck size={14} style={{ marginLeft: 'auto' }}/>}
              </div>
              <div className="profile-dropdown-item" onClick={() => { setCurrentLang('Telugu'); setShowLangMenu(false); }}>
                Telugu {currentLang === 'Telugu' && <CheckCheck size={14} style={{ marginLeft: 'auto' }}/>}
              </div>
            </div>
          )}
        </div>
        
        <div className="notification-wrapper">
          <button 
            className="icon-btn" 
            onClick={() => {
              setShowNotificationsMenu(!showNotificationsMenu);
              setShowProfileMenu(false);
              setShowLangMenu(false);
            }}
          >
            <Bell size={20} />
          </button>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}

          {showNotificationsMenu && (
            <div className="notifications-dropdown-menu">
              <div className="notifications-dropdown-header">
                <h3>Notifications</h3>
                <span className="mark-read" onClick={() => {
                   fetch(`${API_BASE_URL}/notifications/mark-read`, { method: 'PUT' })
                     .then(() => fetchNotifications());
                }}>
                  <CheckCheck size={14} /> Mark all read
                </span>
              </div>
              <div className="notifications-dropdown-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">No notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`notification-dropdown-item ${notif.status === 'Unread' ? 'unread' : ''}`}
                    >
                      <div className="notif-title">{notif.title}</div>
                      <div className="notif-message">{notif.message}</div>
                      <div className="notif-time">{notif.createdAt}</div>
                    </div>
                  ))
                )}
              </div>
              <div 
                className="notifications-dropdown-footer"
                onClick={() => {
                  setShowNotificationsMenu(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </div>
            </div>
          )}
        </div>
        
        <div className="user-profile-container">
          <div 
            className="user-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationsMenu(false);
              setShowLangMenu(false);
            }}
          >
            <img 
              src="https://ui-avatars.com/api/?name=Seller&background=random" 
              alt="User Avatar" 
              className="avatar-img"
            />
          </div>
          
          {showProfileMenu && (
            <div className="profile-dropdown-menu">
              <div 
                className="profile-dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/profile');
                }}
              >
                <User size={18} />
                <span>Profile</span>
              </div>
              <div 
                className="profile-dropdown-item"
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/');
                }}
              >
                <LogOut size={18} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;
