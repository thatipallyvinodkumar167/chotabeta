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
import './ReturnRequests.css';
import { API_BASE_URL } from '../../config';

const ReturnRequests = () => {
  const [entriesPerPage, setEntriesPerPage] = React.useState(10);
  const [showColumnsDropdown, setShowColumnsDropdown] = React.useState(false);
  const [showExportDropdown, setShowExportDropdown] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState({
    orderDate: true,
    orderDetails: true,
    refundAmount: true,
    pickupStatus: true,
    returnStatus: true,
    actions: true
  });
  const [returnsData, setReturnsData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [limit, setLimit] = React.useState(10);
  const [page, setPage] = React.useState(1);

  const columnLabels = [
    { key: 'orderDate', label: 'Order Date' },
    { key: 'orderDetails', label: 'Order Details' },
    { key: 'refundAmount', label: 'Refund Amount' },
    { key: 'pickupStatus', label: 'Pickup Status' },
    { key: 'returnStatus', label: 'Return Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const toggleColumn = (key) => {
    setVisibleColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredData = returnsData.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      String(item.id).toLowerCase().includes(term) ||
      String(item.order_id).toLowerCase().includes(term) ||
      (item.billing_name && item.billing_name.toLowerCase().includes(term)) ||
      (item.product_title && item.product_title.toLowerCase().includes(term)) ||
      (item.reason && item.reason.toLowerCase().includes(term)) ||
      (item.pickup_status && item.pickup_status.toLowerCase().includes(term)) ||
      (item.return_status && item.return_status.toLowerCase().includes(term))
    );
  });

  const total = filteredData.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedData = filteredData.slice((page - 1) * limit, page * limit);

  const visibleCount = 1 + Object.values(visibleColumns).filter(Boolean).length;

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/returns/list`);
      const resData = await response.json();
      if (resData.success) {
        setReturnsData(resData.data);
      } else {
        setError(resData.message || 'Failed to fetch return requests');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateReturnStatus = async (id, status, comment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/returns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_status: status, seller_comment: comment || '' })
      });
      const data = await response.json();
      if (data.success) {
        alert('Return request updated successfully');
        fetchReturns();
      } else {
        alert(data.message || 'Failed to update request');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleExport = () => {
    setShowExportDropdown(false);
    if (returnsData.length === 0) {
      alert('No data to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Headers
    const headers = ['ID'];
    if (visibleColumns.orderDate) headers.push('Order Date');
    if (visibleColumns.orderDetails) headers.push('Order Details');
    if (visibleColumns.refundAmount) headers.push('Refund Amount');
    if (visibleColumns.pickupStatus) headers.push('Pickup Status');
    if (visibleColumns.returnStatus) headers.push('Return Status');
    csvContent += headers.map(h => `"${h}"`).join(',') + '\n';

    // Rows
    returnsData.forEach(item => {
      const row = [item.id];
      if (visibleColumns.orderDate) {
        row.push(new Date(item.order_date).toLocaleString());
      }
      if (visibleColumns.orderDetails) {
        const details = `Order ID: ${item.order_id} | Buyer: ${item.billing_name} | Product: ${item.product_title} ${item.variant_title ? `(${item.variant_title})` : ''} | Reason: ${item.reason} ${item.seller_comment ? ` | Comment: ${item.seller_comment}` : ''}`;
        row.push(details);
      }
      if (visibleColumns.refundAmount) {
        row.push(`₹${parseFloat(item.refund_amount).toFixed(2)}`);
      }
      if (visibleColumns.pickupStatus) {
        row.push(item.pickup_status);
      }
      if (visibleColumns.returnStatus) {
        row.push(item.return_status);
      }
      csvContent += row.map(r => `"${String(r).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `return_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="return-requests-page">
      <div className="return-requests-card">
        {/* Row 1: Title and Refresh */}
        <div className="card-top-row">
          <div className="title-section">
            <h1 className="page-title">Return Requests ({returnsData.length})</h1>
          </div>

          <div className="top-filters-row">
            <button className="btn-outline-blue" onClick={fetchReturns}>
              <RefreshCw size={16} /> Refresh
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
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div className="entries-selector">
            <select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(1); }}>
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
                  <div className="export-dropdown-item" onClick={handleExport}>
                    <span>CSV / Excel</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper">
          <table className="return-requests-table">
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
                {visibleColumns.orderDate && (
                  <th>
                    <div className="th-content">
                      ORDER DATE
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.orderDetails && (
                  <th>
                    <div className="th-content">
                      ORDER DETAILS
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.refundAmount && (
                  <th>
                    <div className="th-content">
                      REFUND AMOUNT
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.pickupStatus && (
                  <th>
                    <div className="th-content">
                      PICKUP STATUS
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.returnStatus && (
                  <th>
                    <div className="th-content">
                      RETURN STATUS
                      <div className="sort-icons">
                        <ChevronDown size={10} style={{ transform: 'rotate(180deg)', marginBottom: '-4px' }} />
                        <ChevronDown size={10} />
                      </div>
                    </div>
                  </th>
                )}
                {visibleColumns.actions && (
                  <th>
                    <div className="th-content">
                      ACTIONS
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={visibleCount} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={visibleCount}>
                    <div className="no-data-container">
                      <Database size={48} className="no-data-icon" />
                      <p>No results found matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    {visibleColumns.orderDate && (
                      <td>
                        <div className="date-cell">
                          <span className="absolute-date">{new Date(order.order_date).toLocaleString()}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.orderDetails && (
                      <td>
                        <div className="order-details-cell" style={{ textAlign: 'left' }}>
                          <p><strong>Order ID:</strong> {order.order_id}</p>
                          <p><strong>Buyer:</strong> {order.billing_name}</p>
                          <p><strong>Product:</strong> {order.product_title}</p>
                          {order.variant_title && <p><strong>Variant:</strong> {order.variant_title}</p>}
                          <p><strong>Reason:</strong> {order.reason}</p>
                          {order.seller_comment && <p><strong>Comment:</strong> {order.seller_comment}</p>}
                        </div>
                      </td>
                    )}
                    {visibleColumns.refundAmount && (
                      <td>
                        <div className="refund-amount">₹{parseFloat(order.refund_amount).toFixed(2)}</div>
                      </td>
                    )}
                    {visibleColumns.pickupStatus && (
                      <td>
                        <span className={`status-badge ${(order.pickup_status || 'pending').toLowerCase()}`}>{order.pickup_status}</span>
                      </td>
                    )}
                    {visibleColumns.returnStatus && (
                      <td>
                        <span className={`status-badge ${(order.return_status || 'requested').toLowerCase()}`}>{order.return_status}</span>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td>
                        <div className="actions-cell">
                          {order.return_status === 'requested' ? (
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                              <button 
                                className="btn-action-solid" 
                                style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => {
                                  const comment = prompt('Enter approval comment:');
                                  handleUpdateReturnStatus(order.id, 'seller_approved', comment);
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn-action-solid" 
                                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                                onClick={() => {
                                  const comment = prompt('Enter rejection comment:');
                                  handleUpdateReturnStatus(order.id, 'seller_rejected', comment);
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>No actions</span>
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

        {/* Footer Section */}
        {total > 0 && (
          <div className="table-footer">
            <div className="footer-left">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries
            </div>
            <div className="pagination">
              <button 
                className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
                disabled={page === 1}
                onClick={() => setPage(1)}
              >
                <ChevronsLeft size={16} />
              </button>
              <button 
                className={`pagination-btn ${page === 1 ? 'disabled' : ''}`}
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].slice(0, entriesPerPage).map((_, i) => (
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
                <ChevronRight size={16} />
              </button>
              <button 
                className={`pagination-btn ${page === totalPages ? 'disabled' : ''}`}
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnRequests;
