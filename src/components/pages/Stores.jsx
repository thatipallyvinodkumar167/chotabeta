import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, ChevronDown, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, RefreshCw, FileText, FileSpreadsheet,
  Plus, Edit, Trash2, Wrench
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Stores.css';

const Stores = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [storesData, setStoresData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stores`);
      const resData = await response.json();
      if (resData.success) {
        setStoresData(resData.data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleDeleteStore = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete store "${name}"?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/stores/${id}`, {
          method: 'DELETE',
        });
        const resData = await response.json();
        if (resData.success) {
          setStoresData(prevData => prevData.filter(store => store.id !== id));
        } else {
          alert(resData.message || 'Failed to delete store');
        }
      } catch (err) {
        console.error('Error deleting store:', err);
        alert('An error occurred while deleting the store.');
      }
    }
  };


  return (
    <div className="stores-page">
      <div className="stores-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="header-titles">
            <h2 className="section-title">Stores</h2>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current active">Stores</span>
            </div>
          </div>
          <div className="header-actions">
            <div className="select-wrapper">
              <select className="status-select">
                <option value="">Select Verification Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>

            <div className="select-wrapper">
              <select className="status-select">
                <option value="">Select Visibility Status</option>
                <option value="visible">Visible</option>
                <option value="hidden">Draft</option>
              </select>
              <ChevronDown size={14} className="select-icon" />
            </div>

            <button 
              className="btn-header-outline add-store-btn"
              onClick={() => navigate('/add-store')}
            >
              <Plus size={16} />
              <span>Add New Store</span>
            </button>

            <button className="btn-header-outline">
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
                    <input type="checkbox" defaultChecked /> NAME
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> CITY
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> CONTACT NUMBER
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> VERIFICATION STATUS
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> VISIBILITY STATUS
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> CREATED AT
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> STORE CONFIGURATION
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
          <table className="stores-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">ID <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">NAME <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">CITY <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">CONTACT NUMBER <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">VERIFICATION STATUS <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">VISIBILITY STATUS <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">CREATED AT <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">STORE CONFIGURATION <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">ACTION</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>Loading stores...</td>
                </tr>
              ) : storesData.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px' }}>No stores found.</td>
                </tr>
              ) : (
                storesData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td className="cell-name">{row.name}</td>
                    <td>{row.city}</td>
                    <td>{row.contact_number}</td>
                    <td>
                      <span className={`status-badge ${(row.verification_status || '').toLowerCase()}`}>
                        {(row.verification_status || '').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${(row.visibility_status || '').toLowerCase()}`}>
                        {(row.visibility_status || '').toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(row.created_at).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-store-config"
                        onClick={() => navigate(`/store-config/${row.id}`, { state: { storeName: row.name } })}
                      >
                        <Wrench size={14} />
                        Store Config
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action edit"
                          onClick={() => navigate(`/edit-store/${row.id}`, { state: { storeName: row.name } })}
                        >
                          <Edit size={14} />
                        </button>
                        <button className="btn-action delete" onClick={() => handleDeleteStore(row.id, row.name)}>
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
            Showing 1 to {storesData.length} of {storesData.length} entry
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
    </div>
  );
};

export default Stores;
