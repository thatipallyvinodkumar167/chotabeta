import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCw,
  ChevronDown,
  Download,
  Search,
  Check,
  ExternalLink,
  Info
} from 'lucide-react';
import './Orders.css';
import { API_BASE_URL } from '../../config';

const STATUS_OPTIONS = [
  { label: 'Status', type: 'header' },
  { label: 'Pending', type: 'pending' },
  { label: 'Awaiting Store Response', type: 'awaiting_store_response' },
  { label: 'Accepted', type: 'accepted' },
  { label: 'Rejected', type: 'rejected' },
  { label: 'Preparing', type: 'preparing' },
  { label: 'Collected', type: 'collected' },
  { label: 'Delivered', type: 'delivered' },
  { label: 'Returned', type: 'returned' },
  { label: 'Refunded', type: 'refunded' },
  { label: 'Cancelled', type: 'cancelled' },
  { label: 'Failed', type: 'failed' },
];

const Orders = () => {
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const navigate = useNavigate();
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const dropdownRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    orderDate: true,
    orderDetails: true,
    productDetails: true,
    status: true,
    actions: true
  });

  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { id: 'id', label: 'ID', index: 1 },
    { id: 'orderDate', label: 'Order Date', index: 2 },
    { id: 'orderDetails', label: 'Order Details', index: 3 },
    { id: 'productDetails', label: 'Product Details', index: 4 },
    { id: 'status', label: 'Status', index: 5 },
    { id: 'actions', label: 'Actions', index: 6 }
  ];

  const filteredOrders = ordersData.filter(order => {
    // 1. Status Filter
    if (statusFilter !== 'all') {
      if (order.statusType !== statusFilter) {
        return false;
      }
    }

    // 2. Date Range Filter
    if (dateRangeFilter !== 'all') {
      const orderDate = new Date(order.orderTime);
      const now = new Date();
      const diffMs = now - orderDate;

      let limitMs = 0;
      if (dateRangeFilter === '30m') limitMs = 30 * 60 * 1000;
      else if (dateRangeFilter === '1h') limitMs = 60 * 60 * 1000;
      else if (dateRangeFilter === '5h') limitMs = 5 * 60 * 60 * 1000;
      else if (dateRangeFilter === '1d') limitMs = 24 * 60 * 60 * 1000;
      else if (dateRangeFilter === '7d') limitMs = 7 * 24 * 60 * 60 * 1000;
      else if (dateRangeFilter === '30d') limitMs = 30 * 24 * 60 * 60 * 1000;
      else if (dateRangeFilter === '365d') limitMs = 365 * 24 * 60 * 60 * 1000;

      if (diffMs > limitMs || diffMs < 0) {
        return false;
      }
    }

    // 3. Search Filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const idStr = String(order.id).toLowerCase();
      const orderIdStr = String(order.orderId).toLowerCase();
      const buyerNameStr = String(order.buyerName).toLowerCase();
      const productNameStr = String(order.productName).toLowerCase();
      const skuStr = String(order.sku || '').toLowerCase();
      
      if (!idStr.includes(term) && 
          !orderIdStr.includes(term) && 
          !buyerNameStr.includes(term) && 
          !productNameStr.includes(term) &&
          !skuStr.includes(term)) {
        return false;
      }
    }

    return true;
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/`);
      const resData = await response.json();
      if (resData.success) {
        setOrdersData(resData.data);
      } else {
        setError(resData.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenStatusDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusSelect = async (orderId, option) => {
    if (option.type === 'header') return;
    try {
      const itemObj = ordersData.find(o => o.id === orderId);
      if (!itemObj) return;

      const response = await fetch(`${API_BASE_URL}/orders/${itemObj.orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: option.type })
      });
      const data = await response.json();
      if (data.success) {
        setOrdersData(prev =>
          prev.map(o =>
            o.id === orderId
              ? { ...o, status: option.label.toUpperCase(), statusType: option.type, orderStatus: option.label }
              : o
          )
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
    setOpenStatusDropdown(null);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const itemObj = ordersData.find(o => o.id === orderId);
      if (!itemObj) return;

      const response = await fetch(`${API_BASE_URL}/orders/${itemObj.orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        const opt = STATUS_OPTIONS.find(o => o.type === newStatus);
        const statusLabel = opt ? opt.label : newStatus.toUpperCase();

        setOrdersData(prev =>
          prev.map(o =>
            o.id === orderId
              ? { ...o, status: statusLabel.toUpperCase(), statusType: newStatus, orderStatus: statusLabel }
              : o
          )
        );
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleOpenDetails = async (order) => {
    try {
      setShowDetailsModal(true);
      setLoadingDetails(true);
      const response = await fetch(`${API_BASE_URL}/orders/${order.orderId}`);
      const resData = await response.json();
      if (resData.success) {
        setSelectedOrderDetails(resData.data);
      } else {
        setSelectedOrderDetails({
          id: order.orderId,
          billing_name: order.buyerName,
          payment_method: order.paymentMethod,
          is_rush_order: order.isRushDelivery === 'Yes' ? 1 : 0,
          status: order.status,
          created_at: order.orderTime,
          items: [{
            title: order.productName,
            variant_title: order.variantName,
            sku: order.sku,
            quantity: order.quantity,
            subtotal: order.subTotal,
            image: order.imageUrl
          }]
        });
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setSelectedOrderDetails({
        id: order.orderId,
        billing_name: order.buyerName,
        payment_method: order.paymentMethod,
        is_rush_order: order.isRushDelivery === 'Yes' ? 1 : 0,
        status: order.status,
        created_at: order.orderTime,
        items: [{
          title: order.productName,
          variant_title: order.variantName,
          sku: order.sku,
          quantity: order.quantity,
          subtotal: order.subTotal,
          image: order.imageUrl
        }]
      });
    } finally {
      setLoadingDetails(false);
    }
  };


  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.round(diffMs / 60000);
    const diffHrs = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="orders-page">
      <div className="main-card">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              Order Items ({filteredOrders.length !== ordersData.length ? `${filteredOrders.length} of ` : ''}{ordersData.length} Order Items)
            </h1>
          </div>
          <div className="header-right">
            <div className="filter-group">
              <select className="header-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Status</option>
                <option value="pending">Pending</option>
                <option value="awaiting_store_response">Awaiting Store Response</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="preparing">Preparing</option>
                <option value="collected">Collected</option>
                <option value="delivered">Delivered</option>
                <option value="returned">Returned</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
              <select className="header-select" value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)}>
                <option value="all">Date Range</option>
                <option value="30m">last 30 minutes</option>
                <option value="1h">last 1 hour</option>
                <option value="5h">last 5 hours</option>
                <option value="1d">last 1 day</option>
                <option value="7d">last 7 days</option>
                <option value="30d">last 30 days</option>
                <option value="365d">last 365 days</option>
              </select>
            </div>
            <button className="btn-header-outline" onClick={fetchOrders}>
              <RotateCw size={18} /> Refresh
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="table-controls">
            <div className="controls-left">
              <div className="search-group">
                <label>Search:</label>
                <input
                  type="text"
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ID, Buyer, Product, SKU..."
                />
              </div>
              <div className="entries-selector">
                <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
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
                      <div
                        key={col.id}
                        className="dropdown-item"
                        onClick={() => setVisibleColumns(prev => ({
                          ...prev,
                          [col.id]: !prev[col.id]
                        }))}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>{col.index}: {col.label}</span>
                        {visibleColumns[col.id] && <Check size={14} className="check-icon" />}
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
                      {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg> */}
                      <span>Excel</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  {visibleColumns.id && <th>ID</th>}
                  {visibleColumns.orderDate && <th>ORDER DATE</th>}
                  {visibleColumns.orderDetails && <th>ORDER DETAILS</th>}
                  {visibleColumns.productDetails && <th>PRODUCT DETAILS</th>}
                  {visibleColumns.status && <th>STATUS</th>}
                  {visibleColumns.actions && <th>ACTIONS</th>}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.slice(0, entriesPerPage).map((order) => (
                  <tr key={order.id}>
                    {visibleColumns.id && <td>{order.id}</td>}
                    {visibleColumns.orderDate && (
                      <td>
                        <div className="date-cell">
                          <span className="relative-date">{getRelativeTime(order.orderTime)}</span>
                          <span className="absolute-date">{new Date(order.orderTime).toLocaleString()}</span>
                        </div>
                      </td>
                    )}
                    {visibleColumns.orderDetails && (
                      <td>
                        <div className="order-details-cell">
                          <div className="product-thumb">
                            <img src={order.imageUrl} alt="Product" />
                          </div>
                          <div className="details-text">
                            <a href="#" className="order-link">Order ID: {order.orderId}</a>
                            <p>Buyer Name: {order.buyerName}</p>
                            <p>Payment Method: {order.paymentMethod}</p>
                            <p>Is Rush Delivery: {order.isRushDelivery}</p>
                            <p>Order Status: {order.orderStatus}</p>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleColumns.productDetails && (
                      <td>
                        <div className="product-details-cell">
                          <a href="#" className="product-link">{order.productName}</a>
                          <p>Variant Name: {order.variantName}</p>
                          <p>Store Name: {order.storeName}</p>
                          <p>SKU: {order.sku}</p>
                          <p>Quantity: {order.quantity}</p>
                          <p>Item Sub Total: {order.subTotal}</p>
                        </div>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td>
                        <div
                          className="status-dropdown-wrap"
                          ref={openStatusDropdown === order.id ? dropdownRef : null}
                        >
                          <button
                            className={`status-badge ${order.statusType}`}
                            onClick={() =>
                              setOpenStatusDropdown(
                                openStatusDropdown === order.id ? null : order.id
                              )
                            }
                          >
                            {order.status}
                            <ChevronDown size={12} className="status-chevron" />
                          </button>
                          {openStatusDropdown === order.id && (
                            <div className="status-dropdown-menu">
                              {STATUS_OPTIONS.map((opt) => (
                                <div
                                  key={opt.type}
                                  className={[
                                    'status-dropdown-item',
                                    opt.type === 'header' ? 'status-dropdown-header' : '',
                                    order.statusType === opt.type ? 'active' : '',
                                  ].join(' ').trim()}
                                  onClick={() => handleStatusSelect(order.id, opt)}
                                >
                                  {opt.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {visibleColumns.actions && (
                      <td>
                        <div className="actions-cell">
                          <button className="btn-action-outline" onClick={() => handleOpenDetails(order)}>
                            <ExternalLink size={14} /> More Information
                          </button>
                          {(order.statusType === 'pending' || order.statusType === 'awaiting_store_response') && (
                            <div className="action-buttons-row">
                              <button className="btn-action-green" onClick={() => handleUpdateStatus(order.id, 'accepted')}>
                                Accept
                              </button>
                              <button className="btn-action-red" onClick={() => handleUpdateStatus(order.id, 'rejected')}>
                                Reject
                              </button>
                            </div>
                          )}
                          {order.statusType === 'accepted' && (
                            <button className="btn-action-blue" onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                              Mark as Preparing
                            </button>
                          )}
                          {order.statusType === 'preparing' && (
                            <button className="btn-action-orange" onClick={() => handleUpdateStatus(order.id, 'collected')}>
                              Mark as Collected
                            </button>
                          )}
                          {order.statusType === 'collected' && (
                            <button className="btn-action-green" onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                              Mark as Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details: #{selectedOrderDetails?.id || selectedOrderDetails?.uuid || ''}</h3>
              <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {loadingDetails || !selectedOrderDetails ? (
                <div className="modal-loader">Loading details...</div>
              ) : (
                <div className="order-modal-grid">
                  {/* Left Column: Customer & Delivery Info */}
                  <div className="modal-section-card">
                    <h4>Customer & Shipping Info</h4>
                    <p><strong>Name:</strong> {selectedOrderDetails.billing_name || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrderDetails.billing_phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrderDetails.email || 'N/A'}</p>
                    <p><strong>Address:</strong> {[
                      selectedOrderDetails.billing_address_1,
                      selectedOrderDetails.billing_address_2,
                      selectedOrderDetails.billing_landmark,
                      selectedOrderDetails.billing_city,
                      selectedOrderDetails.billing_state,
                      selectedOrderDetails.billing_zip
                    ].filter(Boolean).join(', ') || 'N/A'}</p>
                  </div>

                  {/* Right Column: Order Metadata */}
                  <div className="modal-section-card">
                    <h4>Order Information</h4>
                    <p><strong>Status:</strong> <span className={`status-badge ${selectedOrderDetails.status?.toLowerCase()}`}>{selectedOrderDetails.status}</span></p>
                    <p><strong>Date:</strong> {selectedOrderDetails.created_at ? new Date(selectedOrderDetails.created_at).toLocaleString() : 'N/A'}</p>
                    <p><strong>Payment Method:</strong> {selectedOrderDetails.payment_method?.toUpperCase() || 'N/A'}</p>
                    <p><strong>Rush Delivery:</strong> {selectedOrderDetails.is_rush_order ? 'Yes' : 'No'}</p>
                  </div>

                  {/* Financial Summary */}
                  <div className="modal-section-card full-width">
                    <h4>Price Calculations & Payments</h4>
                    <div className="price-calc-grid">
                      <div className="price-calc-row">
                        <span>Subtotal:</span>
                        <span>₹{parseFloat(selectedOrderDetails.subtotal || 0).toFixed(2)}</span>
                      </div>
                      <div className="price-calc-row">
                        <span>Delivery Charges:</span>
                        <span>₹{parseFloat(selectedOrderDetails.delivery_charge || 0).toFixed(2)}</span>
                      </div>
                      {parseFloat(selectedOrderDetails.promo_discount || 0) > 0 && (
                        <div className="price-calc-row discount">
                          <span>Discount:</span>
                          <span>-₹{parseFloat(selectedOrderDetails.promo_discount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="price-calc-row total">
                        <span>Total Payable:</span>
                        <span>₹{parseFloat(selectedOrderDetails.seller_total_payable || selectedOrderDetails.total_payable || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="modal-section-card full-width">
                    <h4>Order Items</h4>
                    <div className="modal-items-list">
                      {selectedOrderDetails.items?.map((item, idx) => (
                        <div key={idx} className="modal-item-row">
                          <img 
                            src={item.image || 'https://m.media-amazon.com/images/I/61m025r2kGL._SL1000_.jpg'} 
                            alt={item.title || item.productName || ''} 
                            className="modal-item-thumb" 
                          />
                          <div className="modal-item-info">
                            <h5>{item.title || item.productName}</h5>
                            <p>Variant: {item.variant_title || 'Default'}</p>
                            <p>SKU: {item.sku || 'N/A'} | Qty: {item.quantity}</p>
                          </div>
                          <div className="modal-item-price">
                            {typeof item.subtotal === 'string' && item.subtotal.startsWith('₹') ? item.subtotal : `₹${parseFloat(item.subtotal || 0).toFixed(2)}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-action-solid" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
