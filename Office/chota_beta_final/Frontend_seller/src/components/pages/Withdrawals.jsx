import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  ArrowLeft,
  RotateCw,
  Search,
  Download,
  ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './Withdrawals.css';

const Withdrawals = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [note, setNote] = useState('');
  const [wallet, setWallet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const columns = [
    { id: 1, label: 'Amount' },
    { id: 2, label: 'Status' },
    { id: 3, label: 'Request Note' },
    { id: 4, label: 'Created At' }
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch balance
      const balRes = await fetch(`${API_BASE_URL}/wallet/balance`);
      const balData = await balRes.json();
      if (balData.success && balData.data) {
        setWallet(balData.data);
      }

      // Fetch requests
      const reqRes = await fetch(`${API_BASE_URL}/wallet/withdrawals`);
      const reqData = await reqRes.json();
      if (reqData.success && reqData.data) {
        setRequests(reqData.data);
      }
    } catch (err) {
      console.error('Error fetching withdrawals data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (wallet && parseFloat(wallet.balance) < numAmount) {
      alert('Insufficient wallet balance.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/wallet/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount, request_note: note })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message || 'Withdrawal request submitted successfully');
        setAmount('');
        setNote('');
        fetchData();
      } else {
        alert(data.message || 'Failed to submit request');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const currencySymbol = wallet?.currency_code === 'INR' ? '₹' : wallet?.currency_code === 'USD' ? '$' : '₹';
  const balanceVal = wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00';
  const blockedVal = wallet ? parseFloat(wallet.blocked_balance).toFixed(2) : '0.00';

  // Filter only pending requests for the table
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="withdrawals-page">
      {/* Header Row */}
      <div className="page-header">
        <h1 className="page-title">Request Withdrawal</h1>
        <div className="header-actions">
          <button className="btn-header-outline" onClick={() => navigate('/withdrawal-history')}>
            <History size={18} /> Withdrawal History
          </button>
          <button className="btn-header-outline" onClick={() => navigate('/wallet-balance')}>
            <ArrowLeft size={18} /> Back to Wallet
          </button>
          <button className="btn-header-outline" onClick={fetchData}>
            <RotateCw size={18} /> Refresh
          </button>
        </div>
      </div>

      <div className="withdrawals-content">
        {/* Request Form Card */}
        <div className="main-card withdrawal-form-card">
          <div className="card-header">
            <h2 className="card-title">Request Withdrawal</h2>
          </div>
          <div className="card-body">
            <div className="balance-info">
              <div className="info-group">
                <span className="info-label">Available for Withdrawal</span>
                <div className="info-amount">{currencySymbol}{balanceVal}</div>
              </div>
              <div className="info-group">
                <span className="info-label">Blocked Balance</span>
                <div className="info-amount">{currencySymbol}{blockedVal}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Withdrawal Amount <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label>Request Note</label>
                <textarea
                  placeholder="Enter request note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  disabled={submitting}
                />
              </div>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="main-card pending-requests-card">
          <div className="card-header">
            <h2 className="card-title">Pending Withdrawal Requests</h2>
          </div>
          <div className="card-body">
            <div className="table-controls">
              <div className="controls-left">
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
                        <div key={col.id} className="dropdown-item">
                          <span>{col.id}: {col.label}</span>
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

            <div className="table-wrapper">
              <table className="withdrawals-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>AMOUNT</th>
                    <th>STATUS</th>
                    <th>REQUEST NOTE</th>
                    <th>CREATED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.slice(0, entriesPerPage).map(req => (
                    <tr key={req.id}>
                      <td>{req.id}</td>
                      <td>{currencySymbol}{parseFloat(req.amount).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge pending`}>{req.status.toUpperCase()}</span>
                      </td>
                      <td>{req.request_note || '-'}</td>
                      <td>{new Date(req.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pendingRequests.length === 0 && (
                <div className="no-data-container">
                  <div className="no-data-content">
                    <div className="no-data-icon">
                      <RotateCw size={32} />
                    </div>
                    <p>No data available.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="table-footer">
              <div className="footer-info">Showing {pendingRequests.length} of {pendingRequests.length} entries</div>
              <div className="pagination">
                <button className="pagination-btn disabled">«</button>
                <button className="pagination-btn disabled">‹</button>
                <button className="pagination-btn disabled">›</button>
                <button className="pagination-btn disabled">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;

