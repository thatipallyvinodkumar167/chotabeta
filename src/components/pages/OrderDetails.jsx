import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, Check } from 'lucide-react';
import './OrderDetails.css';
import { API_BASE_URL } from '../../config';

const STATUS_OPTIONS = [
  { label: 'Accept', type: 'accepted' },
  { label: 'Reject', type: 'rejected' },
  { label: 'Preparing', type: 'preparing' },
  { label: 'Collected', type: 'collected' },
  { label: 'Delivered', type: 'delivered' },
];

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  
  // Selection states
  const [selectedItems, setSelectedItems] = useState([]);
  const [targetStatus, setTargetStatus] = useState('accepted');

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/orders/${id}`);
      const resData = await response.json();
      if (resData.success) {
        setOrder(resData.data);
        // Clear selections
        setSelectedItems([]);
      } else {
        setError(resData.message || 'Failed to fetch order details');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while loading order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleSelectAll = (e) => {
    if (e.target.checked && order?.items) {
      setSelectedItems(order.items.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleUpdateStatus = async () => {
    if (selectedItems.length === 0) {
      alert('Please select one or more items from the table above to update their status.');
      return;
    }
    
    try {
      setUpdating(true);
      const response = await fetch(`${API_BASE_URL}/orders/${id}/items/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemIds: selectedItems,
          status: targetStatus
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Selected items status updated successfully');
        fetchOrderDetails();
      } else {
        alert(data.message || 'Failed to update item status');
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="order-details-loading">
        <RotateCw size={36} className="spinner" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-error">
        <p>Error: {error || 'Order not found'}</p>
        <button className="btn-back" onClick={() => navigate('/orders')}>
          <ArrowLeft size={16} /> Back to Orders
        </button>
      </div>
    );
  }

  const allSelected = order.items && order.items.length > 0 && selectedItems.length === order.items.length;
  const addressString = [
    order.billing_address_1,
    order.billing_address_2,
    order.billing_landmark,
    order.billing_city,
    order.billing_state,
    order.billing_zip,
    'India'
  ].filter(Boolean).join(', ');

  const totalQuantity = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0;
  const totalPrice = order.items ? order.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0) : 0;

  return (
    <div className="order-details-page">
      <div className="page-header-container">
        <div className="header-left">
          <button className="btn-back-link" onClick={() => navigate('/orders')}>
            <ArrowLeft size={18} /> Back to Orders
          </button>
          <h1 className="page-title">Order Details: #{order.id}</h1>
        </div>
        <div className="header-right">
          <button className="btn-refresh" onClick={fetchOrderDetails}>
            <RotateCw size={18} /> Refresh
          </button>
        </div>
      </div>

      <div className="order-info-split">
        {/* Order Summary Block */}
        <div className="info-card main-card">
          <h3 className="card-title">Order Summary</h3>
          <div className="info-grid">
            <div className="info-row">
              <span className="info-label">Customer Name:</span>
              <span className="info-value">{order.billing_name || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Customer Phone:</span>
              <span className="info-value">{order.billing_phone || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Customer Email:</span>
              <span className="info-value">{order.email || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Payment Method:</span>
              <span className="info-value highlight">{order.payment_method?.toUpperCase() || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{new Date(order.created_at).toLocaleString('en-IN')}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Overall Status:</span>
              <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address Block */}
        <div className="info-card main-card">
          <h3 className="card-title">Shipping Address</h3>
          <div className="address-box">
            {order.billing_address_1 && <p className="address-line">{order.billing_address_1}</p>}
            {order.billing_address_2 && <p className="address-line font-medium text-slate-300">{order.billing_address_2}</p>}
            {order.billing_landmark && <p className="address-line">Landmark: {order.billing_landmark}</p>}
            <p className="address-line">{order.billing_city || ''} {order.billing_state ? `, ${order.billing_state}` : ''} {order.billing_zip ? `- ${order.billing_zip}` : ''}</p>
            <p className="address-line country">India</p>
            {order.billing_phone && <p className="address-phone">Phone: {order.billing_phone}</p>}
          </div>
        </div>
      </div>

      {/* Order Items Card */}
      <div className="order-items-section main-card">
        <h3 className="section-title">Order Items</h3>
        <div className="table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input 
                    type="checkbox" 
                    checked={allSelected} 
                    onChange={handleSelectAll} 
                  />
                </th>
                <th>PRODUCT</th>
                <th>VARIANT</th>
                <th>PRICE</th>
                <th>STATUS</th>
                <th>QUANTITY</th>
                <th>SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="checkbox-column">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.includes(item.id)} 
                      onChange={() => handleSelectItem(item.id)} 
                    />
                  </td>
                  <td>
                    <div className="product-cell">
                      <img 
                        className="product-img" 
                        src={item.image || 'https://m.media-amazon.com/images/I/61m025r2kGL._SL1000_.jpg'} 
                        alt={item.title} 
                      />
                      <span className="product-title-text">{item.title}</span>
                    </div>
                  </td>
                  <td>{item.variant_title || 'Default'}</td>
                  <td>₹{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td>
                    <span className={`status-badge ${(item.status || 'pending').toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>₹{parseFloat(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer-summary">
          <div className="summary-row">
            <span className="summary-label">Total Qty:</span>
            <span className="summary-value">{totalQuantity}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Total Amount:</span>
            <span className="summary-value text-green">₹{totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Update Status Panel */}
      <div className="status-update-section main-card">
        <h3 className="section-title">Update Status</h3>
        <div className="update-panel-body">
          <p className="help-text">Select one or more items from the table above to update their status.</p>
          <div className="update-controls-row">
            <div className="select-wrapper">
              <label className="input-label">Status</label>
              <select 
                value={targetStatus} 
                onChange={(e) => setTargetStatus(e.target.value)}
                className="status-dropdown"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.type} value={opt.type}>{opt.label}</option>
                ))}
              </select>
            </div>
            <button 
              className={`btn-update-status ${updating ? 'loading' : ''}`}
              onClick={handleUpdateStatus}
              disabled={updating || selectedItems.length === 0}
            >
              {updating ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
