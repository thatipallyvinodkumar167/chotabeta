import React from 'react';
import {
  RefreshCw,
  ChevronDown,
  Search,
  Download,
  Database,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Check,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [sortField, setSortField] = React.useState('id');
  const [sortOrder, setSortOrder] = React.useState('desc');

  const [showColumnsDropdown, setShowColumnsDropdown] = React.useState(false);
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState({
    title: true,
    image: true,
    parent: true,
    commission: true,
    status: true,
    requiresApproval: true,
    createdAt: true
  });

  const [showFormModal, setShowFormModal] = React.useState(false);
  const [formMode, setFormMode] = React.useState('add'); // 'add' | 'edit'
  const [selectedCategory, setSelectedCategory] = React.useState(null);
  const [formValues, setFormValues] = React.useState({
    title: '',
    parent_id: '',
    commission: '0',
    status: 'active',
    description: ''
  });
  const [submittingForm, setSubmittingForm] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState(null);

  const columnLabels = [
    { key: 'title', label: 'Title' },
    { key: 'image', label: 'Image' },
    { key: 'parent', label: 'Parent' },
    { key: 'commission', label: 'Commission' },
    { key: 'status', label: 'Status' },
    { key: 'requiresApproval', label: 'Requires Approval' },
    { key: 'createdAt', label: 'Created At' }
  ];

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/meta/categories`);
      const result = await response.json();
      if (result.success) {
        const normalized = result.data.map(cat => ({
          ...cat,
          commission: cat.commission !== null && cat.commission !== undefined ? parseFloat(cat.commission) : parseFloat(cat.commission_rate || 0)
        }));
        setCategories(normalized);
      } else {
        setError(result.message || 'Failed to fetch categories');
      }
    } catch (err) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormMode('add');
    setSelectedCategory(null);
    setFormValues({
      title: '',
      parent_id: '',
      commission: '0',
      status: 'active',
      description: ''
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setFormMode('edit');
    setSelectedCategory(cat);
    setFormValues({
      title: cat.title || '',
      parent_id: cat.parent_id !== null && cat.parent_id !== undefined ? String(cat.parent_id) : '',
      commission: cat.commission !== null && cat.commission !== undefined ? String(cat.commission) : '0',
      status: cat.status || 'active',
      description: cat.description || ''
    });
    setShowFormModal(true);
  };

  const handleOpenDeleteConfirm = (cat) => {
    setCategoryToDelete(cat);
    setShowDeleteConfirm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formValues.title.trim()) {
      alert("Title is required");
      return;
    }
    setSubmittingForm(true);
    try {
      const url = formMode === 'add' 
        ? `${API_BASE_URL}/meta/categories`
        : `${API_BASE_URL}/meta/categories/${selectedCategory.id}`;
      const method = formMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formValues.title.trim(),
          parent_id: formValues.parent_id ? parseInt(formValues.parent_id) : null,
          commission: parseFloat(formValues.commission || 0),
          status: formValues.status,
          description: formValues.description
        })
      });
      const result = await response.json();
      if (result.success) {
        setShowFormModal(false);
        fetchCategories();
      } else {
        alert(result.message || 'Error saving category');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving category');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setSubmittingForm(true);
    try {
      const response = await fetch(`${API_BASE_URL}/meta/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setShowDeleteConfirm(false);
        setCategoryToDelete(null);
        fetchCategories();
      } else {
        alert(result.message || 'Error deleting category');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting category');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Filter categories
  const filteredCategories = React.useMemo(() => {
    return categories.filter(cat => {
      const idMatch = String(cat.id).includes(search);
      const titleMatch = cat.title ? cat.title.toLowerCase().includes(search.toLowerCase()) : false;
      const parentMatch = cat.parent_title ? cat.parent_title.toLowerCase().includes(search.toLowerCase()) : false;
      return idMatch || titleMatch || parentMatch;
    });
  }, [categories, search]);

  // Sort categories
  const sortedCategories = React.useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'parent') {
        aVal = a.parent_title || '';
        bVal = b.parent_title || '';
      }

      if (aVal === undefined || aVal === null) aVal = '';
      if (bVal === undefined || bVal === null) bVal = '';

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  }, [filteredCategories, sortField, sortOrder]);

  // Pagination
  const totalEntries = sortedCategories.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = sortedCategories.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    // Generate simple CSV content as a fallback representation of Excel export
    const headers = ['ID', 'Title', 'Parent', 'Commission', 'Status', 'Created At'];
    const csvRows = [headers.join(',')];
    
    categories.forEach(cat => {
      const row = [
        cat.id,
        `"${cat.title.replace(/"/g, '""')}"`,
        `"${(cat.parent_title || '').replace(/"/g, '""')}"`,
        `"${cat.commission}%"`,
        cat.status === 'active' || cat.status === 1 || cat.status === '1' ? 'ACTIVE' : 'INACTIVE',
        cat.created_at || ''
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'categories.csv');
    a.click();
    setShowExportDropdown(false);
  };

  return (
    <div className="categories-page">
      <div className="categories-card">
        {/* Row 1: Title/Breadcrumb and Refresh */}
        <div className="card-top-row">
          <div className="title-section">
            <h1 className="page-title">Categories</h1>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current">Categories</span>
            </div>
          </div>

          <div className="top-filters-row">
            <button className="btn-outline-blue" onClick={fetchCategories} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Row 2: Search, Entries, Columns, Export */}
        <div className="table-controls-row">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <div className="entries-selector">
            <select value={entriesPerPage} onChange={handleEntriesChange}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="actions-right">
            <div className="dropdown-container">
              <button className="btn-dark-select" onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}>
                Columns <ChevronDown size={14} />
              </button>

              {showColumnsDropdown && (
                <div className="columns-dropdown-menu">
                  {columnLabels.map((col, idx) => (
                    <div
                      key={col.key}
                      className="dropdown-item"
                      onClick={() => toggleColumn(col.key)}
                    >
                      <span>{idx + 1}: {col.label}</span>
                      {visibleColumns[col.key] && <Check size={14} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dropdown-container">
              <button className="btn-outline-blue" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                <Download size={14} /> Export <ChevronDown size={14} />
              </button>
              {showExportDropdown && (
                <div className="export-dropdown-menu">
                  <div className="export-dropdown-item" onClick={exportToExcel}>
                    <span>Excel/CSV</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper">
          {error && <div className="error-message" style={{color: '#ff4d4d', padding: '15px'}}>{error}</div>}
          
          <table className="categories-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                  <div className="th-content">
                    ID
                    <div className="sort-icons">
                      <ChevronDown size={10} style={{ transform: sortField === 'id' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'id' ? '#007bff' : '#ccc' }} />
                    </div>
                  </div>
                </th>
                {visibleColumns.title && (
                  <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      TITLE
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: sortField === 'title' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'title' ? '#007bff' : '#ccc' }} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.image && (
                  <th>
                    <div className="th-content">
                      IMAGE
                    </div>
                  </th>
                )}
                {visibleColumns.parent && (
                  <th onClick={() => handleSort('parent')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      PARENT
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: sortField === 'parent' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'parent' ? '#007bff' : '#ccc' }} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.commission && (
                  <th onClick={() => handleSort('commission')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      COMMISSION
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: sortField === 'commission' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'commission' ? '#007bff' : '#ccc' }} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.status && (
                  <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      STATUS
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: sortField === 'status' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'status' ? '#007bff' : '#ccc' }} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.requiresApproval && (
                  <th>
                    <div className="th-content">
                      REQUIRES APPROVAL
                    </div>
                  </th>
                )}
                {visibleColumns.createdAt && (
                  <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      CREATED AT
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: sortField === 'created_at' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'created_at' ? '#007bff' : '#ccc' }} />
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    No categories found.
                  </td>
                </tr>
              ) : (
                currentEntries.map((cat) => (
                  <tr key={cat.id}>
                    <td className="cell-id">{cat.id}</td>
                    {visibleColumns.title && <td className="cell-title">{cat.title}</td>}
                    {visibleColumns.image && (
                      <td className="cell-image">
                        <img 
                          src={cat.image} 
                          alt={cat.title} 
                          className="category-img" 
                          onError={(e) => {
                            if (e.target.dataset.errorHandled) return;
                            e.target.dataset.errorHandled = true;
                            e.target.src = 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=80&h=80&fit=crop';
                          }}
                        />
                      </td>
                    )}
                    {visibleColumns.parent && <td className="cell-parent">{cat.parent_title || '-'}</td>}
                    {visibleColumns.commission && <td className="cell-commission">{cat.commission}%</td>}
                    {visibleColumns.status && (
                      <td className="cell-status">
                        <span className={`status-badge ${cat.status === 'active' || cat.status === 1 || cat.status === '1' ? 'active' : 'inactive'}`}>
                          {cat.status === 'active' || cat.status === 1 || cat.status === '1' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.requiresApproval && (
                      <td className="cell-approval">
                        <span className="approval-badge not-required">NOT REQUIRED</span>
                      </td>
                    )}
                    {visibleColumns.createdAt && <td className="cell-date">{cat.created_at ? new Date(cat.created_at).toLocaleDateString() : '-'}</td>}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="table-footer">
          <div className="footer-left">
            Showing {totalEntries > 0 ? indexOfFirst + 1 : 0} to {Math.min(indexOfLast, totalEntries)} of {totalEntries} entries
          </div>
          <div className="pagination">
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ margin: '0 10px', alignSelf: 'center', fontSize: '14px' }}>
              Page {currentPage} of {totalPages || 1}
            </span>
            <button 
              className={`pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight size={16} />
            </button>
            <button 
              className={`pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showFormModal && (
        <div className="category-modal-overlay">
          <div className="category-form-modal">
            <div className="modal-header">
              <h2>{formMode === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button className="close-btn" onClick={() => setShowFormModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmitForm}>
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title" 
                  value={formValues.title} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="e.g. Fruits & Vegetables"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="parent_id">Parent Category</label>
                  <select 
                    id="parent_id" 
                    name="parent_id" 
                    value={formValues.parent_id} 
                    onChange={handleInputChange}
                  >
                    <option value="">None (Root Category)</option>
                    {categories
                      .filter(c => {
                        // Exclude the category itself during editing to prevent cyclic dependency
                        if (formMode === 'edit' && selectedCategory) {
                          return c.id !== selectedCategory.id;
                        }
                        return true;
                      })
                      .map(c => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="commission">Commission Rate (%)</label>
                  <input 
                    type="number" 
                    id="commission" 
                    name="commission" 
                    value={formValues.commission} 
                    onChange={handleInputChange} 
                    min="0" 
                    max="100" 
                    step="0.01" 
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select 
                  id="status" 
                  name="status" 
                  value={formValues.status} 
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description" 
                  name="description" 
                  value={formValues.description} 
                  onChange={handleInputChange} 
                  rows="3" 
                  placeholder="Provide category details..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowFormModal(false)}
                  disabled={submittingForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={submittingForm}
                >
                  {submittingForm ? 'Saving...' : (formMode === 'add' ? 'Add Category' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="category-modal-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete the category <strong>{categoryToDelete?.title}</strong>?</p>
            <p className="warning-text">This will soft-delete the category and it will no longer be visible in the active category list.</p>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setCategoryToDelete(null);
                }}
                disabled={submittingForm}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleDeleteCategory}
                disabled={submittingForm}
              >
                {submittingForm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

