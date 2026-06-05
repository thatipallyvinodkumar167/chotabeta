import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCw,
  History,
  ChevronDown,
  Download,
  Search,
  Check,
  CircleDollarSign,
  Undo2,
  Plus,
  Trash2,
  X,
  SquarePen
} from 'lucide-react';
import './Settlements.css';
import { API_BASE_URL } from '../../config';

const Settlements = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payouts');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
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

  // CRUD Modals state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    entry_type: 'credit',
    amount: '',
    currency_code: 'INR',
    reference_type: 'manual',
    reference_id: '',
    description: '',
    settlement_status: 'pending',
    settlement_reference: ''
  });

  const payoutColumns = [
    { id: 1, label: 'ID', key: 'id', visible: true },
    { id: 2, label: 'Order Details', key: 'description', visible: true },
    { id: 3, label: 'Marketplace Fee', key: 'fees', visible: true },
    { id: 4, label: 'Payout Amount', key: 'amount', visible: true },
    { id: 5, label: 'Last Update', key: 'updated_at', visible: true }
  ];

  const returnColumns = [
    { id: 1, label: 'ID', key: 'id', visible: true },
    { id: 2, label: 'Details', key: 'description', visible: true },
    { id: 3, label: 'Debit Amount', key: 'amount', visible: true },
    { id: 4, label: 'Last Update', key: 'updated_at', visible: true }
  ];

  const [visiblePayoutColumns, setVisiblePayoutColumns] = useState(payoutColumns);
  const [visibleReturnColumns, setVisibleReturnColumns] = useState(returnColumns);

  const currentColumns = activeTab === 'payouts' ? visiblePayoutColumns : visibleReturnColumns;

  const toggleColumn = (colId) => {
    if (activeTab === 'payouts') {
      setVisiblePayoutColumns(prev =>
        prev.map(col => col.id === colId ? { ...col, visible: !col.visible } : col)
      );
    } else {
      setVisibleReturnColumns(prev =>
        prev.map(col => col.id === colId ? { ...col, visible: !col.visible } : col)
      );
    }
  };

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const entryType = activeTab === 'payouts' ? 'credit' : 'debit';
      const url = `${API_BASE_URL}/settlements?entry_type=${entryType}&search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
      const response = await fetch(url);
      const res = await response.json();
      if (res.success) {
        setData(res.data.settlements);
        setTotal(res.data.pagination.total);
        setTotalPages(res.data.pagination.pages);
      } else {
        setError(res.message || 'Failed to fetch settlements');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page on tab change
  }, [activeTab]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSettlements();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [activeTab, search, page, limit]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      entry_type: activeTab === 'payouts' ? 'credit' : 'debit',
      amount: '',
      currency_code: 'INR',
      reference_type: 'manual',
      reference_id: `MAN-${Date.now()}`,
      description: '',
      settlement_status: 'pending',
      settlement_reference: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setFormData({
      entry_type: item.entry_type,
      amount: item.amount,
      currency_code: item.currency_code || 'INR',
      reference_type: item.reference_type || 'manual',
      reference_id: item.reference_id || '',
      description: item.description || '',
      settlement_status: item.settlement_status,
      settlement_reference: item.settlement_reference || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this settlement entry?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/settlements/${id}`, {
        method: 'DELETE'
      });
      const res = await response.json();
      if (res.success) {
        fetchSettlements();
      } else {
        alert(res.message || 'Failed to delete');
      }
    } catch (err) {
      alert(err.message || 'Network error');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add'
        ? `${API_BASE_URL}/settlements`
        : `${API_BASE_URL}/settlements/${currentItem.id}`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const res = await response.json();
      if (res.success) {
        setShowModal(false);
        fetchSettlements();
      } else {
        alert(res.message || 'Failed to save settlement statement');
      }
    } catch (err) {
      alert(err.message || 'Network error occurred');
    }
  };

  const handleExport = (format) => {
    setShowExportDropdown(false);
    if (data.length === 0) {
      alert('No data to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'payouts') {
      csvContent += 'ID,Order Details,Marketplace Fees,Amount,Last Update,Status\n';
      data.forEach(item => {
        const fees = (parseFloat(item.amount) * 0.03).toFixed(2);
        const dateVal = item.updated_at;
        const dateLabel = dateVal ? new Date(dateVal).toLocaleString() : '';
        csvContent += `"${item.id}","${item.description || ''}","₹${fees}","₹${item.amount}","${dateLabel}","${item.settlement_status}"\n`;
      });
    } else {
      csvContent += 'ID,Details,Debit Amount,Last Update,Status\n';
      data.forEach(item => {
        const dateVal = item.updated_at;
        const dateLabel = dateVal ? new Date(dateVal).toLocaleString() : '';
        csvContent += `"${item.id}","${item.description || ''}","₹${item.amount}","${dateLabel}","${item.settlement_status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `settlements_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="settlements-page">
      <div className="main-card">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Earnings & Deductions</h1>
          </div>
          <div className="header-right">
            <div className="store-selector">
              <select>
                <option>YVG General Stores</option>
              </select>
              <ChevronDown size={14} className="select-arrow" />
            </div>
            <button className="btn-header-outline" onClick={() => navigate('/settlements/history')}>
              <History size={18} /> Settlement History
            </button>
            <button className="btn-header-outline" onClick={fetchSettlements}>
              <RotateCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="error-banner" style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>Error loading settlements:</strong> {error}</span>
              <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>&times;</button>
            </div>
          )}
          <div className="tabs-container">
            <div className="tabs-left">
              <button
                className={`tab-btn ${activeTab === 'payouts' ? 'active' : ''}`}
                onClick={() => setActiveTab('payouts')}
              >
                <CircleDollarSign size={18} /> Payouts
              </button>
              <button
                className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
                onClick={() => setActiveTab('returns')}
              >
                <Undo2 size={18} /> Returns & Deductions
              </button>
            </div>
          </div>

          <div className="table-controls">
            <div className="controls-left">
              <div className="search-group">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search description, reference ID..."
                  className="search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
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
                    {currentColumns.map(col => (
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
                    <div className="export-dropdown-item" onClick={() => handleExport('csv')}>
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
                <p>Loading settlements...</p>
              </div>
            ) : data.length > 0 ? (
              <>
                <table className="settlements-table">
                  <thead>
                    <tr>
                      {currentColumns.filter(c => c.visible).map(col => (
                        <th key={col.id}>{col.label.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(0, entriesPerPage).map(item => {
                      const isPayout = item.entry_type === 'credit';
                      return (
                        <tr key={item.id}>
                          {currentColumns.find(c => c.key === 'id')?.visible && (
                            <td>{item.id}</td>
                          )}
                          {currentColumns.find(c => c.key === 'description')?.visible && (
                            <td>
                              {isPayout ? (
                                <div className="order-details-cell font-sans">
                                  <span className="order-id-link">
                                    Order ID: {item.orderDetails?.orderId} | Order Item ID: {item.orderDetails?.orderItemId}
                                  </span>
                                  <span className="order-detail-item">Title: {item.orderDetails?.title}</span>
                                  <span className="order-detail-item">Variant: {item.orderDetails?.variant}</span>
                                  <span className="order-detail-item">Store: {item.orderDetails?.storeName}</span>
                                  <span className="order-detail-item">Amount: ₹{parseFloat(item.orderDetails?.amount).toFixed(2)}</span>
                                  <span className="order-detail-item">Order Date: {item.orderDetails?.orderDate}</span>
                                  <span className="order-detail-item">Order Current Status: {item.orderDetails?.orderStatus}</span>
                                </div>
                              ) : (
                                <div className="order-details-cell">
                                  <span className="desc-text">{item.description}</span>
                                  {item.reference_id && (
                                    <span className="ref-tag">Ref: {item.reference_id} ({item.reference_type})</span>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                          {isPayout && currentColumns.find(c => c.key === 'fees')?.visible && (
                            <td className="font-semibold">₹{parseFloat(item.marketplaceFee).toFixed(2)}</td>
                          )}
                          {currentColumns.find(c => c.key === 'amount')?.visible && (
                            <td className={isPayout ? 'text-blue-payout font-semibold' : 'text-red font-semibold'}>
                              ₹{parseFloat(isPayout ? item.payoutAmount : item.amount).toFixed(2)}
                            </td>
                          )}
                          {currentColumns.find(c => c.key === 'updated_at')?.visible && (
                            <td>
                              {item.updated_at ? new Date(item.updated_at).toLocaleString('en-IN') : '-'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="pagination-container">
                  <span className="pagination-info">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
                  </span>
                  <div className="pagination-buttons">
                    <button
                      className="btn-pagination"
                      disabled={page === 1}
                      onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        className={`btn-pagination ${page === i + 1 ? 'active' : ''}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="btn-pagination"
                      disabled={page === totalPages}
                      onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-data-container">
                <div className="no-data-content">
                  <div className="no-data-icon">
                    <Undo2 size={32} />
                  </div>
                  <p>No settlements data available.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CRUD Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Add Settlement Entry' : 'Edit Settlement Entry'}</h2>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Entry Type</label>
                    <select
                      value={formData.entry_type}
                      onChange={e => setFormData({ ...formData, entry_type: e.target.value })}
                      required
                    >
                      <option value="credit">Payout / Earning (Credit)</option>
                      <option value="debit">Return / Deduction (Debit)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reference Type</label>
                    <input
                      type="text"
                      placeholder="e.g. order_item_delivery, manual"
                      value={formData.reference_type}
                      onChange={e => setFormData({ ...formData, reference_type: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Reference ID</label>
                    <input
                      type="text"
                      placeholder="Reference identifier"
                      value={formData.reference_id}
                      onChange={e => setFormData({ ...formData, reference_id: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Settlement Status</label>
                    <select
                      value={formData.settlement_status}
                      onChange={e => setFormData({ ...formData, settlement_status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="settled">Settled</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Settlement Reference</label>
                    <input
                      type="text"
                      placeholder="e.g. Transaction Ref or Bank ID"
                      value={formData.settlement_reference}
                      onChange={e => setFormData({ ...formData, settlement_reference: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    placeholder="Enter details about this transaction..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Create Statement' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settlements;
