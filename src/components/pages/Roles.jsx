import React, { useState, useEffect } from 'react';
import { 
  Search, Download, ChevronDown, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, RefreshCw, FileText, FileSpreadsheet,
  Plus, Edit, Trash2, LogIn, X, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Roles.css';

const Roles = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Form input state
  const [newRoleName, setNewRoleName] = useState('');
  const [editRoleName, setEditRoleName] = useState('');

  // API data states
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    guardName: true,
    createdAt: true,
    permissions: true,
    action: true
  });

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/roles`);
      const result = await response.json();
      if (result.success) {
        setRoles(result.data);
      } else {
        setError(result.message || 'Failed to fetch roles');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      alert('Role name is required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoleName })
      });
      const result = await response.json();
      if (result.success) {
        setShowAddModal(false);
        setNewRoleName('');
        fetchRoles();
      } else {
        alert(result.message || 'Failed to add role');
      }
    } catch (err) {
      alert('Error adding role: ' + err.message);
    }
  };

  const handleEditRole = async (e) => {
    e.preventDefault();
    if (!editRoleName.trim()) {
      alert('Role name is required');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editRoleName })
      });
      const result = await response.json();
      if (result.success) {
        setShowEditModal(false);
        setSelectedRole(null);
        setEditRoleName('');
        fetchRoles();
      } else {
        alert(result.message || 'Failed to update role');
      }
    } catch (err) {
      alert('Error updating role: ' + err.message);
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        fetchRoles();
      } else {
        alert(result.message || 'Failed to delete role');
      }
    } catch (err) {
      alert('Error deleting role: ' + err.message);
    }
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    setEditRoleName(role.name);
    setShowEditModal(true);
  };

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  // Filter & Search
  const filteredRoles = roles.filter(role => {
    const term = searchTerm.toLowerCase();
    return (
      String(role.id).includes(term) ||
      (role.name && role.name.toLowerCase().includes(term)) ||
      (role.guard_name && role.guard_name.toLowerCase().includes(term))
    );
  });

  // Pagination
  const totalEntries = filteredRoles.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filteredRoles.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Name', 'Guard Name', 'Created At'];
    const csvRows = [headers.join(',')];
    roles.forEach(row => {
      csvRows.push([
        row.id,
        `"${row.name.replace(/"/g, '""')}"`,
        row.guard_name,
        row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'roles.csv');
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div className="roles-page">
      <div className="roles-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="header-titles">
            <h2 className="section-title">Roles</h2>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="home">Roles & Permissions</span>
              <span className="separator">/</span>
              <span className="current active">Roles</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn-header-outline add-role-btn"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Add New Role</span>
            </button>
            
            <button className="btn-header-outline refresh-btn" onClick={fetchRoles} disabled={loading}>
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
                  <div className="column-item" onClick={() => toggleColumn('id')}>
                    <span>ID</span>
                    {visibleColumns.id && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('name')}>
                    <span>Name</span>
                    {visibleColumns.name && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('guardName')}>
                    <span>Guard Name</span>
                    {visibleColumns.guardName && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('createdAt')}>
                    <span>Created At</span>
                    {visibleColumns.createdAt && <Check size={14} className="check-icon" />}
                  </div>
                  <div className="column-item" onClick={() => toggleColumn('permissions')}>
                    <span>Permissions</span>
                    {visibleColumns.permissions && <Check size={14} className="check-icon" />}
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
        <div className="table-wrapper">
          {error && <div className="error-message" style={{color: '#ff4d4d', padding: '15px'}}>{error}</div>}
          
          <table className="roles-table">
            <thead>
              <tr>
                {visibleColumns.id && <th>ID</th>}
                {visibleColumns.name && <th>NAME</th>}
                {visibleColumns.guardName && <th>GUARD NAME</th>}
                {visibleColumns.createdAt && <th>CREATED AT</th>}
                {visibleColumns.permissions && <th>PERMISSIONS</th>}
                {visibleColumns.action && <th>ACTION</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>Loading roles...</td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px' }}>No roles found.</td>
                </tr>
              ) : (
                currentEntries.map((row) => (
                  <tr key={row.id}>
                    {visibleColumns.id && <td className="center cell-id">{row.id}</td>}
                    {visibleColumns.name && <td>{row.name}</td>}
                    {visibleColumns.guardName && <td>{row.guard_name}</td>}
                    {visibleColumns.createdAt && <td>{row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''}</td>}
                    {visibleColumns.permissions && (
                      <td>
                        <button 
                          className="btn-link permissions-link"
                          onClick={() => navigate(`/add-permissions/${row.id}`, { state: { roleName: row.name } })}
                        >
                          <LogIn size={14} className="flip-icon" />
                          Permissions
                        </button>
                      </td>
                    )}
                    {visibleColumns.action && (
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action edit"
                            onClick={() => handleEditClick(row)}
                            title="Edit Role"
                          >
                            <Edit size={14} />
                          </button>
                          {/* Disable deleting roles 2, 6, 7 since they are core template roles */}
                          {row.id > 2 && row.id !== 6 && row.id !== 7 ? (
                            <button 
                              className="btn-action delete"
                              onClick={() => handleDeleteRole(row.id)}
                              title="Delete Role"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <button 
                              className="btn-action delete disabled"
                              style={{ opacity: 0.3, cursor: 'not-allowed' }}
                              disabled
                              title="Core role cannot be deleted"
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

      {/* Add New Role Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="role-modal">
            <form onSubmit={handleAddRole}>
              <div className="modal-header">
                <h3>Add New Role</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group full-width">
                  <label>Role Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Administrator, Editor, etc." 
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Add new Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedRole && (
        <div className="modal-overlay">
          <div className="role-modal">
            <form onSubmit={handleEditRole}>
              <div className="modal-header">
                <h3>Edit Role</h3>
                <button type="button" className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                  <X size={18} />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="form-group full-width">
                  <label>Role Name <span className="required">*</span></label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={editRoleName}
                    onChange={(e) => setEditRoleName(e.target.value)}
                    placeholder="Administrator, Editor, etc." 
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-modal-cancel" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Update Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
