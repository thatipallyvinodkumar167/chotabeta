import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCw,
  Search,
  Download,
  ChevronDown,
  Check,
  Undo2
} from 'lucide-react';
import './SettlementHistory.css';
import { API_BASE_URL } from '../../config';

const SettlementHistory = () => {
  const navigate = useNavigate();
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Live data states
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const initialColumns = [
    { id: 1, label: 'ID', key: 'id', visible: true },
    { id: 2, label: 'Entry Type', key: 'entry_type', visible: true },
    { id: 3, label: 'Details', key: 'details', visible: true },
    { id: 4, label: 'Description', key: 'description', visible: true },
    { id: 5, label: 'Amount', key: 'amount', visible: true },
    { id: 6, label: 'Settlement Date', key: 'settled_at', visible: true }
  ];

  const [columns, setColumns] = useState(initialColumns);

  const toggleColumn = (colId) => {
    setColumns(prev =>
      prev.map(col => col.id === colId ? { ...col, visible: !col.visible } : col)
    );
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/settlements?settlement_status=settled&search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
      const response = await fetch(url);
      const res = await response.json();
      if (res.success) {
        setData(res.data.settlements || []);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
      } else {
        setError(res.message || 'Failed to fetch settlement history');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, page, limit]);

  const handleExport = () => {
    setShowExportDropdown(false);
    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,ID,Entry Type,Details,Description,Amount,Settlement Date\n';
    data.forEach(item => {
      const typeLabel = item.entry_type === 'credit' ? 'Payout/Earning' : 'Deduction/Return';
      const detailsLabel = `${item.reference_type} #${item.reference_id}`;
      const dateVal = item.settled_at || item.posted_at || item.updated_at || item.created_at;
      const dateLabel = dateVal ? new Date(dateVal).toLocaleString() : '';
      csvContent += `"${item.id}","${typeLabel}","${detailsLabel}","${item.description || ''}","₹${item.amount}","${dateLabel}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settlement_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="settlement-history-page">
      <div className="main-card">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Settlement History</h1>
          </div>
          <div className="header-actions">
            <button className="btn-header-outline" onClick={() => navigate('/settlements')}>
              <ArrowLeft size={18} /> Back to Unsettled
            </button>
            <button className="btn-header-outline" onClick={fetchHistory}>
              <RotateCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="table-controls">
            <div className="controls-left">
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search description, reference ID..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="entries-selector">
                <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page</span>
              </div>
            </div>
            <div className="controls-right">
              <div className="dropdown-container">
                <button
                  className="btn-table-action"
                  onClick={() => setShowColumnsDropdown(!showColumnsDropdown)}
                >
                  Columns <ChevronDown size={14} />
                </button>
                {showColumnsDropdown && (
                  <div className="columns-dropdown-menu">
                    {columns.map(col => (
                      <div key={col.id} className="dropdown-item" onClick={() => toggleColumn(col.id)}>
                        <span>{col.label}</span>
                        {col.visible && <Check size={14} className="check-icon" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="dropdown-container">
                <button className="btn-table-action blue" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                  <Download size={16} /> Export <ChevronDown size={14} />
                </button>
                {showExportDropdown && (
                  <div className="export-dropdown-menu">
                    <div className="export-dropdown-item" onClick={handleExport}>
                      <span>CSV / Excel</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            {loading ? (
              <div className="loading-container">
                <RotateCw size={32} className="spinner" />
                <p>Loading history...</p>
              </div>
            ) : data.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    {columns.filter(c => c.visible).map(col => (
                      <th key={col.id}>{col.label.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, entriesPerPage).map(item => {
                    const isCredit = item.entry_type === 'credit';
                    return (
                      <tr key={item.id}>
                        {columns.find(c => c.key === 'id')?.visible && (
                          <td>{item.id}</td>
                        )}
                        {columns.find(c => c.key === 'entry_type')?.visible && (
                          <td>
                            <span className={`entry-type-badge ${item.entry_type}`}>
                              {isCredit ? 'Credit' : 'Debit'}
                            </span>
                          </td>
                        )}
                        {columns.find(c => c.key === 'details')?.visible && (
                          <td className="text-blue font-semibold">
                            {item.reference_type} #{item.reference_id}
                          </td>
                        )}
                        {columns.find(c => c.key === 'description')?.visible && (
                          <td>{item.description}</td>
                        )}
                        {columns.find(c => c.key === 'amount')?.visible && (
                          <td className={isCredit ? 'text-green font-semibold' : 'text-red font-semibold'}>
                            ₹{parseFloat(item.amount).toFixed(2)}
                          </td>
                        )}
                        {columns.find(c => c.key === 'settled_at')?.visible && (
                          <td>
                            {new Date(item.settled_at || item.posted_at || item.updated_at || item.created_at).toLocaleString('en-IN')}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="no-data-container">
                <div className="no-data-content">
                  <div className="no-data-icon">
                    <Undo2 size={32} />
                  </div>
                  <p>No data available.</p>
                </div>
              </div>
            )}
          </div>

          {total > 0 && (
            <div className="table-footer">
              <div className="footer-info">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
              </div>
              <div className="pagination">
                <button
                  className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                >
                  «
                </button>
                <button
                  className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
                  disabled={page === 1}
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                >
                  ‹
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
                  disabled={page === totalPages}
                  onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                >
                  ›
                </button>
                <button
                  className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettlementHistory;
