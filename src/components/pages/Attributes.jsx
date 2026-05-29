import React, { useState } from 'react';
import {
  RefreshCw,
  ChevronDown,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  Check,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Attributes.css';

const Attributes = () => {
  const [activeTab, setActiveTab] = useState('attributes');
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateValueModal, setShowCreateValueModal] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editSwatchType, setEditSwatchType] = useState('text');
  const [showEditSwatchDropdown, setShowEditSwatchDropdown] = useState(false);
  const [editAttributeValues, setEditAttributeValues] = useState([]);
  
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  
  // Create attribute state
  const [newTitle, setNewTitle] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newSwatchType, setNewSwatchType] = useState('text');
  const [showSwatchDropdown, setShowSwatchDropdown] = useState(false);
  const [attributeValues, setAttributeValues] = useState([{ id: Date.now(), value: '', swatch: '' }]);

  // Create attribute value for existing attribute state
  const [selectedAttrId, setSelectedAttrId] = useState('');
  const [showAttrDropdown, setShowAttrDropdown] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    title: true,
    swatchType: true,
    valuesCount: true,
    createdAt: true,
    action: true
  });

  const attributeColumns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'TITLE' },
    { key: 'swatchType', label: 'SWATCH TYPE' },
    { key: 'valuesCount', label: 'VALUES COUNT' },
    { key: 'createdAt', label: 'CREATED AT' },
    { key: 'action', label: 'ACTION' }
  ];

  const valueColumns = [
    { key: 'id', label: 'ID' },
    { key: 'globalAttrId', label: 'GLOBAL ATTRIBUTE ID' },
    { key: 'attrTitle', label: 'ATTRIBUTE TITLE' },
    { key: 'title', label: 'TITLE' },
    { key: 'swatchValue', label: 'SWATCHE VALUE' },
    { key: 'createdAt', label: 'CREATED AT' },
    { key: 'action', label: 'ACTION' }
  ];

  const currentColumns = activeTab === 'attributes' ? attributeColumns : valueColumns;

  React.useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/meta/attributes`);
      const result = await response.json();
      if (result.success) {
        setAttributes(result.data);
      } else {
        setError(result.message || 'Failed to fetch attributes');
      }
    } catch (err) {
      setError('Failed to fetch attributes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAttribute = async () => {
    if (!newTitle.trim()) {
      alert('Title is required');
      return;
    }

    const payload = {
      title: newTitle,
      label: newLabel || newTitle,
      swatche_type: newSwatchType,
      values: attributeValues
        .filter(v => v.value.trim() !== '')
        .map(v => ({ title: v.value, swatche_value: v.swatch }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/meta/attributes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setShowCreateModal(false);
        // Reset state
        setNewTitle('');
        setNewLabel('');
        setNewSwatchType('text');
        setAttributeValues([{ id: Date.now(), value: '', swatch: '' }]);
        fetchAttributes();
      } else {
        alert(result.message || 'Failed to create attribute');
      }
    } catch (err) {
      alert('Failed to create attribute');
    }
  };

  const handleOpenEditModal = (attr) => {
    setEditingAttribute(attr);
    setEditTitle(attr.title || '');
    setEditLabel(attr.label || '');
    setEditSwatchType(attr.swatche_type || 'text');
    if (attr.values && attr.values.length > 0) {
      setEditAttributeValues(
        attr.values.map(v => ({ id: v.id, value: v.title, swatch: v.swatche_value || '' }))
      );
    } else {
      setEditAttributeValues([{ id: Date.now(), value: '', swatch: '' }]);
    }
    setShowEditModal(true);
  };

  const handleUpdateAttribute = async () => {
    if (!editTitle.trim()) {
      alert('Title is required');
      return;
    }

    const payload = {
      title: editTitle,
      label: editLabel || editTitle,
      swatche_type: editSwatchType,
      values: editAttributeValues
        .filter(v => v.value.trim() !== '')
        .map(v => ({ id: v.id, title: v.value, swatche_value: v.swatch }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/meta/attributes/${editingAttribute.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        setShowEditModal(false);
        fetchAttributes();
      } else {
        alert(result.message || 'Failed to update attribute');
      }
    } catch (err) {
      alert('Failed to update attribute');
    }
  };

  const addEditValueField = () => {
    setEditAttributeValues([...editAttributeValues, { id: Date.now(), value: '', swatch: '' }]);
  };

  const removeEditValueField = (id) => {
    if (editAttributeValues.length > 1) {
      setEditAttributeValues(editAttributeValues.filter(v => v.id !== id));
    }
  };

  const handleEditValueFieldChange = (id, field, val) => {
    setEditAttributeValues(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  const handleDeleteAttribute = async (id) => {
    if (window.confirm("Are you sure you want to delete this attribute?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/meta/attributes/${id}`, {
          method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
          fetchAttributes();
        } else {
          alert(result.message || 'Failed to delete attribute');
        }
      } catch (err) {
        alert('Failed to delete attribute');
      }
    }
  };

  const addValueField = () => {
    setAttributeValues([...attributeValues, { id: Date.now(), value: '', swatch: '' }]);
  };

  const removeValueField = (id) => {
    if (attributeValues.length > 1) {
      setAttributeValues(attributeValues.filter(v => v.id !== id));
    }
  };

  const handleValueFieldChange = (id, field, val) => {
    setAttributeValues(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: val };
      }
      return item;
    }));
  };

  // Flattened attribute values
  const allValues = React.useMemo(() => {
    let list = [];
    attributes.forEach(attr => {
      if (attr.values) {
        attr.values.forEach(v => {
          list.push({
            id: v.id,
            globalAttrId: attr.id,
            attrTitle: attr.title,
            title: v.title,
            swatchValue: v.swatche_value,
            createdAt: v.created_at
          });
        });
      }
    });
    return list;
  }, [attributes]);

  const currentData = activeTab === 'attributes' ? attributes : allValues;

  // Filter
  const filteredData = React.useMemo(() => {
    return currentData.filter(row => {
      const idMatch = String(row.id).includes(search);
      const titleMatch = row.title ? row.title.toLowerCase().includes(search.toLowerCase()) : false;
      const extraMatch = activeTab === 'attributes'
        ? (row.label ? row.label.toLowerCase().includes(search.toLowerCase()) : false)
        : (row.attrTitle ? row.attrTitle.toLowerCase().includes(search.toLowerCase()) : false);
      return idMatch || titleMatch || extraMatch;
    });
  }, [currentData, search, activeTab]);

  // Pagination
  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filteredData.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const exportToExcel = () => {
    let csvRows = [];
    if (activeTab === 'attributes') {
      csvRows.push(['ID', 'Title', 'Label', 'Swatch Type', 'Values Count', 'Created At'].join(','));
      attributes.forEach(attr => {
        csvRows.push([
          attr.id,
          `"${attr.title.replace(/"/g, '""')}"`,
          `"${(attr.label || '').replace(/"/g, '""')}"`,
          attr.swatche_type || 'text',
          attr.values ? attr.values.length : 0,
          attr.created_at || ''
        ].join(','));
      });
    } else {
      csvRows.push(['ID', 'Attribute ID', 'Attribute Title', 'Value Title', 'Swatch Value', 'Created At'].join(','));
      allValues.forEach(v => {
        csvRows.push([
          v.id,
          v.globalAttrId,
          `"${v.attrTitle.replace(/"/g, '""')}"`,
          `"${v.title.replace(/"/g, '""')}"`,
          `"${(v.swatchValue || '').replace(/"/g, '""')}"`,
          v.createdAt || ''
        ].join(','));
      });
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `${activeTab}.csv`);
    a.click();
    setShowExportDropdown(false);
  };

  return (
    <div className="attributes-page">
      <div className="attributes-card">
        {/* Row 1: Header */}
        <div className="card-header-row">
          <div className="header-left">
            <h1 className="page-title">Attributes</h1>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current">Attributes</span>
            </div>
          </div>

          <div className="header-right">
            <button className="btn-create blue-light" onClick={() => setShowCreateModal(true)}>
              <Plus size={16} /> Create Attribute
            </button>
            <button className="btn-outline-blue" onClick={fetchAttributes} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Row 2: Tabs */}
        <div className="tabs-row">
          <button
            className={`tab-item ${activeTab === 'attributes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('attributes');
              setCurrentPage(1);
            }}
          >
            Attributes
          </button>
          <button
            className={`tab-item ${activeTab === 'values' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('values');
              setCurrentPage(1);
            }}
          >
            Attribute Values
          </button>
        </div>

        {/* Row 3: Controls */}
        <div className="table-controls-row">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div className="entries-selector">
            <select value={entriesPerPage} onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}>
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
                  {currentColumns.map((col, idx) => (
                    <div key={col.key} className="dropdown-item" onClick={() => toggleColumn(col.key)}>
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

        {/* Row 4: Table */}
        <div className="table-wrapper">
          {error && <div className="error-message" style={{color: '#ff4d4d', padding: '15px'}}>{error}</div>}
          
          <table className="attributes-table">
            <thead>
              <tr>
                {currentColumns.map(col => {
                  const isVisible = visibleColumns[col.key] !== false;
                  if (!isVisible) return null;
                  return (
                    <th key={col.key} className={col.key === 'globalAttrId' ? 'cell-global-id' : ''}>
                      <div className="th-content">
                        {col.label}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading attributes...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    No attribute records found.
                  </td>
                </tr>
              ) : (
                currentEntries.map(row => (
                  <tr key={row.id}>
                    {visibleColumns.id !== false && <td className="cell-id">{row.id}</td>}
                    {activeTab === 'attributes' ? (
                      <>
                        {visibleColumns.title !== false && <td className="cell-title">{row.title}</td>}
                        {visibleColumns.swatchType !== false && <td className="cell-swatch">{row.swatche_type || 'text'}</td>}
                        {visibleColumns.valuesCount !== false && <td className="cell-count">{row.values ? row.values.length : 0}</td>}
                      </>
                    ) : (
                      <>
                        {visibleColumns.globalAttrId !== false && <td className="cell-id">{row.globalAttrId}</td>}
                        {visibleColumns.attrTitle !== false && <td className="cell-title">{row.attrTitle}</td>}
                        {visibleColumns.title !== false && <td className="cell-title">{row.title}</td>}
                        {visibleColumns.swatchValue !== false && <td className="cell-swatch">{row.swatchValue || '-'}</td>}
                      </>
                    )}
                    {visibleColumns.createdAt !== false && <td className="cell-date">{row.created_at || row.createdAt ? new Date(row.created_at || row.createdAt).toLocaleDateString() : '-'}</td>}
                    {visibleColumns.action !== false && (
                      <td className="cell-action">
                        <div className="action-buttons">
                          {activeTab === 'attributes' && (
                            <>
                              <button 
                                className="btn-icon blue" 
                                onClick={() => handleOpenEditModal(row)}
                                title="Edit Attribute"
                                style={{ marginRight: '8px' }}
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="btn-icon red" 
                                onClick={() => handleDeleteAttribute(row.id)}
                                title="Delete Attribute"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
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

        {/* Row 5: Footer */}
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

      {/* Modal Overlay: Create Attribute */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Create New Attribute</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body modal-scrollable">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  placeholder="Attribute Name" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Label</label>
                <input 
                  type="text" 
                  placeholder="Label" 
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Swatch Type</label>
                <div className="modal-dropdown-container">
                  <button className="modal-dropdown-btn" onClick={() => setShowSwatchDropdown(!showSwatchDropdown)}>
                    {newSwatchType} <ChevronDown size={14} />
                  </button>
                  {showSwatchDropdown && (
                    <div className="modal-dropdown-menu">
                      {['text', 'color', 'image'].slice(0, entriesPerPage).map(type => (
                        <div
                          key={type}
                          className={`modal-dropdown-item ${newSwatchType === type ? 'active' : ''}`}
                          onClick={() => {
                            setNewSwatchType(type);
                            setShowSwatchDropdown(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Values list */}
              <div className="values-creator" style={{ marginTop: '15px' }}>
                <label style={{ fontWeight: 'bold' }}>Attribute Values</label>
                {attributeValues.map((field, idx) => (
                  <div key={field.id} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Value (e.g. XL)" 
                      value={field.value} 
                      onChange={(e) => handleValueFieldChange(field.id, 'value', e.target.value)} 
                      style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'inherit', color: 'inherit' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Swatch color/img URL" 
                      value={field.swatch} 
                      onChange={(e) => handleValueFieldChange(field.id, 'swatch', e.target.value)} 
                      style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'inherit', color: 'inherit' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeValueField(field.id)}
                      style={{ background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}
                    >
                      X
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-add-more" 
                  onClick={addValueField}
                  style={{ background: 'transparent', border: '1px dashed #ccc', color: 'inherit', padding: '6px 12px', width: '100%', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}
                >
                  + Add Value Row
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleCreateAttribute}>Create Attribute</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay: Edit Attribute */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container">
            <div className="edit-modal-header">
              <h3>Edit Attribute</h3>
              <button className="edit-close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <div className="edit-modal-body modal-scrollable">
              <div className="edit-form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  placeholder="Attribute Name" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>Label</label>
                <input 
                  type="text" 
                  placeholder="Label" 
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                />
              </div>
              <div className="edit-form-group">
                <label>Swatch Type</label>
                <div className="edit-dropdown-container">
                  <button className="edit-dropdown-btn" onClick={() => setShowEditSwatchDropdown(!showEditSwatchDropdown)}>
                    {editSwatchType} <ChevronDown size={14} />
                  </button>
                  {showEditSwatchDropdown && (
                    <div className="edit-dropdown-menu">
                      {['text', 'color', 'image'].map(type => (
                        <div
                          key={type}
                          className={`edit-dropdown-item ${editSwatchType === type ? 'active' : ''}`}
                          onClick={() => {
                            setEditSwatchType(type);
                            setShowEditSwatchDropdown(false);
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Values list */}
              <div className="values-creator" style={{ marginTop: '15px' }}>
                <label style={{ fontWeight: 'bold', color: 'inherit' }}>Attribute Values</label>
                {editAttributeValues.map((field, idx) => (
                  <div key={field.id} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="Value (e.g. XL)" 
                      value={field.value} 
                      onChange={(e) => handleEditValueFieldChange(field.id, 'value', e.target.value)} 
                      style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'inherit', color: 'inherit' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Swatch color/img URL" 
                      value={field.swatch} 
                      onChange={(e) => handleEditValueFieldChange(field.id, 'swatch', e.target.value)} 
                      style={{ flex: 1, padding: '6px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: 'inherit', color: 'inherit' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeEditValueField(field.id)}
                      style={{ background: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}
                    >
                      X
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="btn-add-more" 
                  onClick={addEditValueField}
                  style={{ background: 'transparent', border: '1px dashed #ccc', color: 'inherit', padding: '6px 12px', width: '100%', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}
                >
                  + Add Value Row
                </button>
              </div>
            </div>
            <div className="edit-modal-footer">
              <button className="edit-btn-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="edit-btn-submit" onClick={handleUpdateAttribute}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attributes;

