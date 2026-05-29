import React, { useState } from 'react';
import { 
  Search, Download, ChevronDown, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, RefreshCw, FileText, FileSpreadsheet,
  CheckCheck, X, Eye, Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Notifications.css';

const Notifications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [notificationsData, setNotificationsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/notifications`);
      const resData = await response.json();
      if (resData.success) {
        setNotificationsData(resData.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await fetch(`${API_BASE_URL}/notifications/mark-read`, { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE' });
        setNotificationsData(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    }
  };

  const handleView = (notification) => {
    setSelectedNotification(notification);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNotification(null);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="header-titles">
            <h2 className="section-title">Notifications</h2>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current active">Notifications</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header-outline mark-read-btn" onClick={handleMarkAllAsRead}>
              <CheckCheck size={16} />
              <span>Mark All as Read</span>
            </button>
            
            <button className="btn-header-outline refresh-btn" onClick={fetchNotifications}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Toolbar Section */}
        <div className="table-toolbar">
          <div className="toolbar-left">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="entries-selector">
              <select 
                value={entriesPerPage} 
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>entries per page</span>
            </div>
          </div>

          <div className="toolbar-right">
            <div className="dropdown-container">
              <button 
                className="btn-dark-select" 
                onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              >
                Columns
                <ChevronDown size={14} className="select-arrow" />
              </button>
              {showColumnsMenu && (
                <div className="columns-dropdown-menu">
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> ID
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> TITLE
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> MESSAGE
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> STATUS
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> CREATED AT
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> ACTION
                  </label>
                </div>
              )}
            </div>

            <div className="dropdown-container">
              <button 
                className="btn-dark-select export-btn" 
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download size={14} />
                Export
                <ChevronDown size={14} className="select-arrow" />
              </button>
              {showExportMenu && (
                <div className="export-dropdown-menu">
                  <div className="export-dropdown-item">
                    <FileText size={14} /> CSV
                  </div>
                  <div className="export-dropdown-item">
                    <FileSpreadsheet size={14} /> Excel
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper scrollable-table-wrapper">
          <table className="notifications-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">ID <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">TITLE <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">MESSAGE</div>
                </th>
                <th>
                  <div className="th-content">STATUS <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">CREATED AT <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">ACTION <div className="sort-arrows"><span className="down">▼</span></div></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading notifications...</td>
                </tr>
              ) : notificationsData.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No notifications found.</td>
                </tr>
              ) : (
                notificationsData.map((row) => (
                  <tr key={row.id}>
                    <td className="cell-id">{row.id}</td>
                    <td>
                      <div className="cell-title-group">
                        <div className="cell-title-main">{row.title}</div>
                        <div className="cell-title-sub">{row.subTitle}</div>
                      </div>
                    </td>
                    <td>{row.message}</td>
                    <td>
                      <span className={`status-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.createdAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action close" onClick={() => handleDelete(row.id)}>
                          <X size={14} />
                        </button>
                        <button 
                          className="btn-action view"
                          onClick={() => handleView(row)}
                        >
                          <Eye size={14} />
                        </button>
                        <button className="btn-action delete" onClick={() => handleDelete(row.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="dashboard-footer">
          <div className="pagination-info">
            Showing 1 to {notificationsData.length} of {notificationsData.length} entry
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn disabled"><ChevronsLeft size={14} /></button>
            <button className="pagination-btn disabled"><ChevronLeft size={14} /></button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn disabled"><ChevronRight size={14} /></button>
            <button className="pagination-btn disabled"><ChevronsRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* Notification Details Modal */}
      {showModal && selectedNotification && (
        <div className="modal-overlay">
          <div className="notification-modal">
            <div className="modal-header">
              <h3>Notification Details</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Title</span>
                  <span className="detail-value">{selectedNotification.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Type</span>
                  <span className="detail-value">{selectedNotification.type || 'system'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Sent To</span>
                  <span className="detail-value">{selectedNotification.sentTo || 'seller'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    <span className={`status-badge ${selectedNotification.status.toLowerCase()}`}>
                      {selectedNotification.status}
                    </span>
                  </span>
                </div>
              </div>

              <div className="detail-item full-width">
                <span className="detail-label">Message</span>
                <span className="detail-value">{selectedNotification.message}</span>
              </div>
              
              <div className="detail-item full-width">
                <span className="detail-label">Created At</span>
                <span className="detail-value">5/18/2026, 5:39:22 PM</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
