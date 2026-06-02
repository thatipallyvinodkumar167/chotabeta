import React, { useState, useEffect } from 'react';
import { 
  Search, Download, ChevronDown, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, RefreshCw, FileText, FileSpreadsheet,
  Plus, Edit, Trash2, X, Check, Wand2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './SystemUsers.css';

const SystemUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // API states
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states (Add User)
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addMobile, setAddMobile] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRoleIds, setAddRoleIds] = useState([]);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Form states (Edit User)
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRoleIds, setEditRoleIds] = useState([]);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    email: true,
    mobile: true,
    role: true,
    createdAt: true,
    action: true
  });

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch system users
      const usersRes = await fetch(`${API_BASE_URL}/roles/system-users/list`);
      const usersData = await usersRes.json();
      if (!usersData.success) throw new Error(usersData.message || 'Failed to fetch users');

      // 2. Fetch available roles
      const rolesRes = await fetch(`${API_BASE_URL}/roles`);
      const rolesData = await rolesRes.json();
      if (!rolesData.success) throw new Error(rolesData.message || 'Failed to fetch roles');

      setUsers(usersData.data);
      setRoles(rolesData.data);
    } catch (err) {
      setError(err.message || 'An error occurred while loading team data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const generatePassword = (isEdit = false) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (isEdit) {
      setEditPassword(pwd);
      setShowEditPassword(true);
    } else {
      setAddPassword(pwd);
      setShowAddPassword(true);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (addRoleIds.length === 0) {
      alert('Please select at least one role.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/roles/system-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          mobile: addMobile,
          password: addPassword,
          roleIds: addRoleIds
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        // Reset states
        setAddName('');
        setAddEmail('');
        setAddMobile('');
        setAddPassword('');
        setAddRoleIds([]);
        fetchUsersAndRoles();
      } else {
        alert(result.message || 'Failed to create user');
      }
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditMobile(user.mobile || '');
    setEditPassword('');
    
    // Find role IDs for this user by matching their role names to roles array
    const mappedIds = roles
      .filter(r => user.roles.some(ur => ur.toLowerCase() === r.name.toLowerCase()))
      .map(r => r.id);
    setEditRoleIds(mappedIds);

    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editRoleIds.length === 0) {
      alert('Please select at least one role.');
      return;
    }
    try {
      const payload = {
        name: editName,
        email: editEmail,
        mobile: editMobile,
        roleIds: editRoleIds
      };
      if (editPassword.trim()) {
        payload.password = editPassword;
      }

      const response = await fetch(`${API_BASE_URL}/roles/system-users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        setEditPassword('');
        fetchUsersAndRoles();
      } else {
        alert(result.message || 'Failed to update user');
      }
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === 7) {
      alert('Primary user cannot be deleted.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this system user?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/roles/system-users/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        fetchUsersAndRoles();
      } else {
        alert(result.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleToggleAddRole = (roleId) => {
    setAddRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleToggleEditRole = (roleId) => {
    setEditRoleIds(prev =>
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // Filter & Search
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      String(user.id).includes(term) ||
      (user.name && user.name.toLowerCase().includes(term)) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.mobile && user.mobile.toLowerCase().includes(term))
    );
  });

  // Pagination
  const totalEntries = filteredUsers.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filteredUsers.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Name', 'Email', 'Mobile', 'Roles', 'Created At'];
    const csvRows = [headers.join(',')];
    users.forEach(row => {
      csvRows.push([
        row.id,
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        row.mobile || '',
        `"${row.roles.join(', ')}"`,
        row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'system_users.csv');
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div className="system-users-page">
      <div className="users-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="header-titles">
            <h2 className="section-title">System Users</h2>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="home">Roles & Permissions</span>
              <span className="separator">/</span>
              <span className="current active">System User</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn-header-outline add-user-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Add New User</span>
            </button>
            
            <button className="btn-header-outline refresh-btn" onClick={fetchUsersAndRoles} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            
            <div className="entries-selector">
              <select 
                value={entriesPerPage} 
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                <div className="columns-dropdown-menu custom-columns">
                  <div className="column-item" onClick={() => toggleColumn('name')}>
                    <span>Name</span>
                    {visibleColumns.name && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('email')}>
                    <span>Email</span>
                    {visibleColumns.email && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('mobile')}>
                    <span>Mobile</span>
                    {visibleColumns.mobile && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('role')}>
                    <span>Role</span>
                    {visibleColumns.role && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('createdAt')}>
                    <span>Created At</span>
                    {visibleColumns.createdAt && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('action')}>
                    <span>Action</span>
                    {visibleColumns.action && <Check size={14} className="check-icon" />}
                  </div>
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
                  <div className="export-dropdown-item" onClick={exportToExcel}>
                    <FileText size={14} /> CSV/Excel
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper scrollable-table-wrapper">
          {error && <div className="error-message" style={{color: '#ff4d4d', padding: '15px'}}>{error}</div>}
          
          <table className="users-table">
            <thead>
              <tr>
                {visibleColumns.id && <th>ID</th>}
                {visibleColumns.name && <th>NAME</th>}
                {visibleColumns.email && <th>EMAIL</th>}
                {visibleColumns.mobile && <th>MOBILE</th>}
                {visibleColumns.role && <th>ROLE</th>}
                {visibleColumns.createdAt && <th>CREATED AT</th>}
                {visibleColumns.action && <th>ACTION</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>Loading system users...</td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>No system users found.</td>
                </tr>
              ) : (
                currentEntries.map((row) => (
                  <tr key={row.id}>
                    {visibleColumns.id && <td className="center cell-id">{row.id}</td>}
                    {visibleColumns.name && <td>{row.name}</td>}
                    {visibleColumns.email && <td>{row.email}</td>}
                    {visibleColumns.mobile && <td className="center">{row.mobile || '-'}</td>}
                    {visibleColumns.role && (
                      <td>
                        <div className="role-badges">
                          {row.roles.slice(0, entriesPerPage).map((role, idx) => (
                            <span key={idx} className="role-badge">{role.toUpperCase()}</span>
                          ))}
                        </div>
                      </td>
                    )}
                    {visibleColumns.createdAt && <td className="center">{row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''}</td>}
                    {visibleColumns.action && (
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action edit"
                            onClick={() => handleEditClick(row)}
                            title="Edit User"
                          >
                            <Edit size={14} />
                          </button>
                          {row.id !== 7 ? (
                            <button 
                              className="btn-action delete"
                              onClick={() => handleDeleteUser(row.id)}
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <button 
                              className="btn-action delete disabled"
                              style={{ opacity: 0.3, cursor: 'not-allowed' }}
                              disabled
                              title="Primary admin user cannot be deleted"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="dashboard-footer">
          <div className="pagination-info">
            Showing {totalEntries > 0 ? indexOfFirst + 1 : 0} to {Math.min(indexOfLast, totalEntries)} of {totalEntries} entries
          </div>
          <div className="pagination-controls">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ padding: '0 10px', fontSize: '13px' }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              className={`pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add New User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="user-modal">
            <form onSubmit={handleAddSubmit}>
              <div className="modal-header">
                <h3>Add New User</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter full name" 
                      value={addName}
                      onChange={(e) => setAddName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Enter email address" 
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Enter mobile number" 
                      value={addMobile}
                      onChange={(e) => setAddMobile(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password <span className="required">*</span></label>
                    <div className="password-input-group">
                      <input 
                        type={showAddPassword ? "text" : "password"} 
                        className="form-control password-field" 
                        placeholder="Enter password" 
                        value={addPassword}
                        onChange={(e) => setAddPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        className="btn-show-password"
                        onClick={() => setShowAddPassword(!showAddPassword)}
                      >
                        {showAddPassword ? "Hide" : "Show"}
                      </button>
                      <button 
                        type="button" 
                        className="btn-generate-password"
                        onClick={() => generatePassword(false)}
                        title="Generate Password"
                      >
                        <Wand2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Roles <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {roles.map(r => (
                      <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        <input 
                          type="checkbox" 
                          checked={addRoleIds.includes(r.id)} 
                          onChange={() => handleToggleAddRole(r.id)} 
                        />
                        <span>{r.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Add new User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="user-modal">
            <form onSubmit={handleEditSubmit}>
              <div className="modal-header">
                <h3>Edit User</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email <span className="required">*</span></label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Password (Leave blank to keep current)</label>
                    <div className="password-input-group">
                      <input 
                        type={showEditPassword ? "text" : "password"} 
                        className="form-control password-field" 
                        placeholder="Enter new password" 
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-show-password"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                      >
                        {showEditPassword ? "Hide" : "Show"}
                      </button>
                      <button 
                        type="button" 
                        className="btn-generate-password"
                        onClick={() => generatePassword(true)}
                        title="Generate Password"
                      >
                        <Wand2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Roles <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {roles.map(r => (
                      <label key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px' }}>
                        <input 
                          type="checkbox" 
                          checked={editRoleIds.includes(r.id)} 
                          onChange={() => handleToggleEditRole(r.id)} 
                        />
                        <span>{r.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Update User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemUsers;
