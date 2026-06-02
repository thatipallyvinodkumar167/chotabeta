import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Download, ChevronDown, ChevronLeft, ChevronRight, 
  ChevronsLeft, ChevronsRight, ArrowLeft, RefreshCw, FileText, FileSpreadsheet 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './SubscriptionHistory.css';

const SubscriptionHistory = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/meta/subscriptions/history`);
      const resData = await response.json();
      if (resData.success) {
        setHistoryData(resData.data);
      }
    } catch (err) {
      console.error('Error fetching subscription history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);


  return (
    <div className="subscription-history-page">
      <div className="history-card">
        {/* Header Section */}
        <div className="card-header">
          <h2 className="section-title">Subscription History</h2>
          <div className="header-actions">
            <button className="btn-header-outline" onClick={() => navigate('/plans')}>
              <ArrowLeft size={16} />
              <span>Back to Plans</span>
            </button>
            <button className="btn-header-outline" onClick={() => navigate('/current-subscription')}>
              <span>Current Subscription</span>
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
                    <input type="checkbox" defaultChecked /> PLAN
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> PRICE PAID
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> STATUS
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> START DATE
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> END DATE
                  </label>
                  <label className="column-checkbox">
                    <input type="checkbox" defaultChecked /> CREATED AT
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
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>
                  <div className="th-content">ID <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">PLAN <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">PRICE PAID <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">STATUS <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">START DATE <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">END DATE <div className="sort-arrows"><span className="up">▲</span><span className="down">▼</span></div></div>
                </th>
                <th>
                  <div className="th-content">CREATED AT</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>Loading subscription history...</td>
                </tr>
              ) : historyData.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No history found</td>
                </tr>
              ) : (
                historyData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td className="cell-plan">{row.plan_name ? row.plan_name.toUpperCase() : ''}</td>
                    <td>₹{parseFloat(row.price_paid).toFixed(2)}</td>
                    <td>
                      <div className="status-cell-wrapper">
                        <span className={`status-badge ${row.status.toLowerCase()}`}>
                          {row.status.toUpperCase()}
                        </span>
                        <span className="check-status-link">check status</span>
                      </div>
                    </td>
                    <td>{new Date(row.start_date).toLocaleDateString()}</td>
                    <td>{new Date(row.end_date).toLocaleDateString()}</td>
                    <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="dashboard-footer">
          <div className="pagination-info">
            Showing 1 to {historyData.length} of {historyData.length} entries
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

export default SubscriptionHistory;
