import React, { useState } from 'react';
import { 
  Search, Download, ChevronDown, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, RefreshCw, FileText, FileSpreadsheet 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './TaxRates.css';

const TaxRates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  
  const [taxRates, setTaxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    title: true,
    rate: true,
    createdAt: true,
    action: true
  });

  React.useEffect(() => {
    fetchTaxRates();
  }, []);

  const fetchTaxRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/meta/tax-rates`);
      const result = await response.json();
      if (result.success) {
        setTaxRates(result.data);
      } else {
        setError(result.message || 'Failed to fetch tax rates');
      }
    } catch (err) {
      setError('Failed to fetch tax rates');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter tax rates
  const filteredRates = React.useMemo(() => {
    return taxRates.filter(row => {
      const idMatch = String(row.id).includes(searchTerm);
      const titleMatch = row.title ? row.title.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      return idMatch || titleMatch;
    });
  }, [taxRates, searchTerm]);

  // Pagination
  const totalEntries = filteredRates.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filteredRates.slice(indexOfFirst, indexOfLast);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Title', 'Rate (%)', 'Created At'];
    const csvRows = [headers.join(',')];
    taxRates.forEach(row => {
      csvRows.push([
        row.id,
        `"${row.title.replace(/"/g, '""')}"`,
        row.rate,
        row.created_at || ''
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'tax_rates.csv');
    a.click();
    setShowExportMenu(false);
  };

  return (
    <div className="tax-rates-page">
      <div className="tax-card">
        {/* Header Section */}
        <div className="card-header">
          <div className="header-titles">
            <h2 className="section-title">Tax Groups</h2>
            <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current active">Tax Rates</span>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header-outline" onClick={fetchTaxRates} disabled={loading}>
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
                onChange={handleSearchChange}
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
                <div className="columns-dropdown-menu">
                  <label className="column-checkbox">
                    <input type="checkbox" checked={visibleColumns.id} onChange={() => toggleColumn('id')} /> ID
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" checked={visibleColumns.title} onChange={() => toggleColumn('title')} /> TITLE
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" checked={visibleColumns.rate} onChange={() => toggleColumn('rate')} /> RATE (%)
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" checked={visibleColumns.createdAt} onChange={() => toggleColumn('createdAt')} /> CREATED AT
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" checked={visibleColumns.action} onChange={() => toggleColumn('action')} /> ACTION
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
                  <div className="export-dropdown-item" onClick={exportToExcel}>
                    <FileText size={14} /> Excel/CSV
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper">
          {error && <div className="error-message" style={{color: '#ff4d4d', padding: '15px'}}>{error}</div>}
          
          <table className="tax-table">
            <thead>
              <tr>
                {visibleColumns.id && (
                  <th>
                    <div className="th-content">ID</div>
                  </th>
                )}
                {visibleColumns.title && (
                  <th>
                    <div className="th-content">TITLE</div>
                  </th>
                )}
                {visibleColumns.rate && (
                  <th>
                    <div className="th-content">RATE (%)</div>
                  </th>
                )}
                {visibleColumns.createdAt && (
                  <th>
                    <div className="th-content">CREATED AT</div>
                  </th>
                )}
                {visibleColumns.action && (
                  <th>
                    <div className="th-content">ACTION</div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                    Loading tax rates...
                  </td>
                </tr>
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}>
                    No tax rates found.
                  </td>
                </tr>
              ) : (
                currentEntries.map((row) => (
                  <tr key={row.id}>
                    {visibleColumns.id && <td>{row.id}</td>}
                    {visibleColumns.title && <td className="cell-title">{row.title}</td>}
                    {visibleColumns.rate && <td className="cell-rates">{row.rate}%</td>}
                    {visibleColumns.createdAt && <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '-'}</td>}
                    {visibleColumns.action && <td></td>}
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
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft size={14} />
            </button>
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
            <button 
              className={`pagination-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxRates;

