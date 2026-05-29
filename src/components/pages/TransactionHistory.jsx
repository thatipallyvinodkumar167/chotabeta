import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  Search,
  Download,
  ArrowUpDown,
  Database,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Check
} from 'lucide-react';
import './TransactionHistory.css';

const TransactionHistory = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();
  const [showColumnsDropdown, setShowColumnsDropdown] = React.useState(false);
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState({
    amount: true,
    type: true,
    method: true,
    status: true,
    description: true,
    createdAt: true
  });

  return (
    <div className="transaction-history-page">
      <div className="history-table-card">
        {/* Row 1: Title/Breadcrumb and Top Filters */}
        <div className="card-top-row">
          <div className="title-section">
            <h1 className="page-title">Transaction History</h1>
            {/* <div className="breadcrumb">
              <span className="home">Home</span>
              <span className="separator">/</span>
              <span className="current">Transaction History</span>
            </div> */}
          </div>

          <div className="top-filters-row">
            <select className="filter-select">
              <option>Transaction Type</option>
              <option>Deposit</option>
              <option>Payment</option>
              <option>Refund</option>
              <option>Adjustment</option>
            </select>
            {/* <select className="filter-select">
              <option>Status</option>
              <option>Success</option>
              <option>Pending</option>
              <option>Failed</option>
            </select> */}
            {/* <select className="filter-select">
              <option>Date Range</option>
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select> */}
            <button className="btn-outline-blue btn-back" onClick={() => navigate('/wallet-balance')}>
              <ArrowLeft size={16} /> Back to Wallet
            </button>
            <button className="btn-outline-blue">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* Row 2: Search, Entries, and Additional Actions */}
        <div className="table-controls-row">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="entries-selector">
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
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
                  <div className="dropdown-item" onClick={() => setVisibleColumns({...visibleColumns, amount: !visibleColumns.amount})}>
                    <span>1: Amount</span>
                    {visibleColumns.amount && <Check size={14} />}
                  </div>
                  <div className="dropdown-item" onClick={() => setVisibleColumns({...visibleColumns, type: !visibleColumns.type})}>
                    <span>2: Transaction Type</span>
                    {visibleColumns.type && <Check size={14} />}
                  </div>
                  <div className="dropdown-item" onClick={() => setVisibleColumns({...visibleColumns, method: !visibleColumns.method})}>
                    <span>3: Payment Method</span>
                    {visibleColumns.method && <Check size={14} />}
                  </div>
                  <div className="dropdown-item" onClick={() => setVisibleColumns({...visibleColumns, status: !visibleColumns.status})}>
                    <span>4: Status</span>
                    {visibleColumns.status && <Check size={14} />}
                  </div>
                  <div className="dropdown-item" onClick={() => setVisibleColumns({...visibleColumns, description: !visibleColumns.description})}>
                    <span>5: Description</span>
                    {visibleColumns.description && <Check size={14} />}
                  </div>
                  <div className="dropdown-item" onClick={() => setVisibleColumns({...visibleColumns, createdAt: !visibleColumns.createdAt})}>
                    <span>6: Created At</span>
                    {visibleColumns.createdAt && <Check size={14} />}
                  </div>
                </div>
              )}
            </div>
            
            <div className="dropdown-container">
              <button className="btn-outline-blue" onClick={() => setShowExportDropdown(!showExportDropdown)}>
                <Download size={14} /> Export <ChevronDown size={14} />
              </button>
              {showExportDropdown && (
                <div className="export-dropdown-menu">
                  <div className="export-dropdown-item" onClick={() => setShowExportDropdown(false)}>
                    <span>Columns</span>
                  </div>
                  <div className="export-dropdown-item" onClick={() => setShowExportDropdown(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>Excel</span>
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
                  <div className="th-content">
                    ID
                    <div className="sort-icons">
                      <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                      <ChevronDown size={10} />
                    </div>
                  </div>
                </th>
                {visibleColumns.amount && (
                  <th>
                    <div className="th-content">
                      AMOUNT
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.type && (
                  <th>
                    <div className="th-content">
                      TRANSACTION TYPE
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.method && (
                  <th>
                    <div className="th-content">
                      PAYMENT METHOD
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.status && (
                  <th>
                    <div className="th-content">
                      STATUS
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.description && (
                  <th>
                    <div className="th-content">
                      DESCRIPTION
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.createdAt && (
                  <th>
                    <div className="th-content">
                      CREATED AT
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={1 + Object.values(visibleColumns).filter(Boolean).length}>
                  <div className="no-data-container">
                    <Database size={48} className="no-data-icon" />
                    <p>No results found matching your filters.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="table-footer">
          <div className="footer-left">
            Showing 1 to 0 of 0 entries
          </div>
          <div className="pagination">
            <button className="pagination-btn disabled"><ChevronsLeft size={16} /></button>
            <button className="pagination-btn disabled"><ChevronLeft size={16} /></button>
            <button className="pagination-btn disabled"><ChevronRight size={16} /></button>
            <button className="pagination-btn disabled"><ChevronsRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;
