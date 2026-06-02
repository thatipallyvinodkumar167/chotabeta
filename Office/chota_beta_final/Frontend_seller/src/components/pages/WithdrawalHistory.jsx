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
import './WithdrawalHistory.css';
import { API_BASE_URL } from '../../config';

const WithdrawalHistory = () => {
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

  const initialColumns = [
    { id: 1, label: 'ID', key: 'id', visible: true },
    { id: 2, label: 'Amount', key: 'amount', visible: true },
    { id: 3, label: 'Status', key: 'status', visible: true },
    { id: 4, label: 'Request Note', key: 'request_note', visible: true },
    { id: 5, label: 'Admin Remark', key: 'admin_remark', visible: true },
    { id: 6, label: 'Processed At', key: 'processed_at', visible: true },
    { id: 7, label: 'Created At', key: 'created_at', visible: true }
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
      const response = await fetch(`${API_BASE_URL}/wallet/withdrawals`);
      const res = await response.json();
      if (res.success) {
        setData(res.data || []);
      } else {
        setError(res.message || 'Failed to fetch history');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter data client-side based on search term
  const filteredData = data.filter(item => {
    const term = search.toLowerCase();
    return (
      item.id.toString().includes(term) ||
      (item.request_note && item.request_note.toLowerCase().includes(term)) ||
      (item.admin_remark && item.admin_remark.toLowerCase().includes(term)) ||
      item.status.toLowerCase().includes(term) ||
      item.amount.toString().includes(term)
    );
  });

  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const handleExport = () => {
    setShowExportDropdown(false);
    if (data.length === 0) {
      alert('No data to export.');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,ID,Amount,Status,Request Note,Admin Remark,Processed At,Created At\n';
    data.forEach(item => {
      csvContent += `"${item.id}","₹${item.amount}","${item.status}","${item.request_note || ''}","${item.admin_remark || ''}","${item.processed_at ? new Date(item.processed_at).toLocaleString() : ''}","${new Date(item.created_at).toLocaleString()}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `withdrawal_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="withdrawal-history-page">
      <div className="main-card">
        <div className="page-header">
          <h1 className="page-title">Withdrawal History</h1>
          <div className="header-actions">
            <button className="btn-header-outline" onClick={() => navigate('/settlements')}>
              <ArrowLeft size={18} /> Back to Settlements
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
                  placeholder="Search request note, status..."
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
            ) : paginatedData.length > 0 ? (
              <table className="history-table">
                <thead>
                  <tr>
                    {columns.filter(c => c.visible).map(col => (
                      <th key={col.id}>{col.label.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.slice(0, entriesPerPage).map(item => (
                    <tr key={item.id}>
                      {columns.find(c => c.key === 'id')?.visible && (
                        <td>{item.id}</td>
                      )}
                      {columns.find(c => c.key === 'amount')?.visible && (
                        <td className="font-semibold text-blue-payout">₹{parseFloat(item.amount).toFixed(2)}</td>
                      )}
                      {columns.find(c => c.key === 'status')?.visible && (
                        <td>
                          <span className={`status-badge ${(item.status || 'pending').toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                      )}
                      {columns.find(c => c.key === 'request_note')?.visible && (
                        <td>{item.request_note || '-'}</td>
                      )}
                      {columns.find(c => c.key === 'admin_remark')?.visible && (
                        <td>{item.admin_remark || '-'}</td>
                      )}
                      {columns.find(c => c.key === 'processed_at')?.visible && (
                        <td>
                          {item.processed_at
                            ? new Date(item.processed_at).toLocaleString('en-IN')
                            : '-'}
                        </td>
                      )}
                      {columns.find(c => c.key === 'created_at')?.visible && (
                        <td>{new Date(item.created_at).toLocaleString('en-IN')}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-container">
                <div className="no-data-content">
                  <div className="no-data-icon">
                    <Undo2 size={32} />
                  </div>
                  <p>No withdrawal history available.</p>
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

export default WithdrawalHistory;
