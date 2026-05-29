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
  Check
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Brands.css';

const Brands = () => {
  const [brands, setBrands] = React.useState([]);
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
    scopeType: true,
    image: true,
    status: true,
    createdAt: true,
    action: true
  });

  const columnLabels = [
    { key: 'title', label: 'Title' },
    { key: 'scopeType', label: 'Scope Type' },
    { key: 'image', label: 'Image' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'action', label: 'Action' }
  ];

  React.useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/meta/brands`);
      const result = await response.json();
      if (result.success) {
        setBrands(result.data);
      } else {
        setError(result.message || 'Failed to fetch brands');
      }
    } catch (err) {
      setError('Failed to fetch brands');
    } finally {
      setLoading(false);
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

  // Filter brands
  const filteredBrands = React.useMemo(() => {
    return brands.filter(b => {
      const idMatch = String(b.id).includes(search);
      const titleMatch = b.title ? b.title.toLowerCase().includes(search.toLowerCase()) : false;
      return idMatch || titleMatch;
    });
  }, [brands, search]);

  // Sort brands
  const sortedBrands = React.useMemo(() => {
    return [...filteredBrands].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

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
  }, [filteredBrands, sortField, sortOrder]);

  // Pagination
  const totalEntries = sortedBrands.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = sortedBrands.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Title', 'Scope Type', 'Status', 'Created At'];
    const csvRows = [headers.join(',')];
    
    brands.forEach(b => {
      const row = [
        b.id,
        `"${b.title.replace(/"/g, '""')}"`,
        b.seller_id ? 'SELLER' : 'GLOBAL',
        b.status === 1 || b.status === '1' ? 'ACTIVE' : 'INACTIVE',
        b.created_at || ''
      ];
      csvRows.push(row.join(','));
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'brands.csv');
    a.click();
    setShowExportDropdown(false);
  };

  return (
    <div className="brands-page">
      <div className="brands-card">
        {/* Row 1: Title/Breadcrumb and Refresh */}
        <div className="card-top-row">
          <div className="title-section">
            <h1 className="page-title">Brands</h1>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current">Brands</span>
            </div>
          </div>

          <div className="top-filters-row">
            <button className="btn-outline-blue" onClick={fetchBrands} disabled={loading}>
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
          
          <table className="brands-table">
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
                {visibleColumns.scopeType && (
                  <th onClick={() => handleSort('seller_id')} style={{ cursor: 'pointer' }}>
                    <div className="th-content">
                      SCOPE TYPE
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: sortField === 'seller_id' && sortOrder === 'asc' ? 'rotate(180deg)' : 'none', color: sortField === 'seller_id' ? '#007bff' : '#ccc' }} />
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
                {visibleColumns.action && (
                  <th>
                    <div className="th-content">
                      ACTION
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading brands...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px' }}>
                    No brands found.
                  </td>
                </tr>
              ) : (
                currentEntries.map((brand) => (
                  <tr key={brand.id}>
                    <td className="cell-id">{brand.id}</td>
                    {visibleColumns.title && <td className="cell-title">{brand.title}</td>}
                    {visibleColumns.scopeType && (
                      <td className="cell-scope">
                        <span className={`scope-badge ${brand.seller_id ? 'seller' : 'global'}`}>
                          {brand.seller_id ? 'SELLER' : 'GLOBAL'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.image && (
                      <td className="cell-image">
                        <img 
                          src={brand.image} 
                          alt={brand.title} 
                          className="brand-img"
                          onError={(e) => {
                            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/200px-Coca-Cola_logo.svg.png';
                          }}
                        />
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="cell-status">
                        <span className={`status-badge ${brand.status === 1 || brand.status === '1' ? 'active' : 'inactive'}`}>
                          {brand.status === 1 || brand.status === '1' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    )}
                    {visibleColumns.createdAt && <td className="cell-date">{brand.created_at ? new Date(brand.created_at).toLocaleDateString() : '-'}</td>}
                    {visibleColumns.action && (
                      <td className="cell-action">
                        {/* No special actions required for brands in seller list */}
                      </td>
                    )}
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
    </div>
  );
};

export default Brands;

