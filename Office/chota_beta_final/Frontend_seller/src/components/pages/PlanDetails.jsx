import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, X, Check, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './PlanDetails.css';

const PlanDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const planName = location.state?.planName || 'TRAIL ACCESS';

  const [activeSubscription, setActiveSubscription] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const fetchActiveSubscription = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/meta/subscriptions/active`);
        const data = await res.json();
        if (data.success) {
          setActiveSubscription(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch active subscription", err);
      }
    };
    fetchActiveSubscription();
  }, []);

  // We could fetch actual plan data based on planName, but using static data for now matching the mockup.
  const planData = {
    name: planName,
    price: planName === 'TRAIL ACCESS' ? '₹99.00' : 
           planName === 'BASIC ACCESS' ? '₹499.00' :
           planName === 'STANDARD ACCESS' ? '₹1,499.00' :
           planName === 'PREMIUM ACCESS' ? '₹3,999.00' : '₹7,999.00',
    duration: 'Duration: 30 Days',
    limits: [
      { name: 'Store Limit', used: 1, total: 1, isMaxed: true },
      { name: 'Product Limit', used: 426, total: 1000, isMaxed: false },
      { name: 'Role Limit', used: 2, total: 5, isMaxed: false },
      { name: 'System User Limit', used: 1, total: 5, isMaxed: false }
    ],
    description: `Start your seller journey with Chota Beta. Get limited seller access for 1 month with the Trial Plan at ₹99.`
  };

  const handleBuyNow = () => {
    if (activeSubscription) {
      setShowErrorModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    alert(`Processing payment for ${planData.name}...`);
  };

  return (
    <div className="plan-details-page">
      <div className="plan-details-header">
        <h1 className="page-title">Subscription Plan Details</h1>
      </div>

      <div className="plan-details-card">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="plan-summary-header">
            <h3 className="plan-title">{planData.name}</h3>
            <div className="plan-price-large">{planData.price}</div>
            <div className="plan-duration-text">{planData.duration}</div>
          </div>

          <div className="limits-section">
            {planData.limits.map((limit, index) => {
              const percentage = Math.min((limit.used / limit.total) * 100, 100);
              return (
                <div key={index} className="limit-item">
                  <div className="limit-item-header">
                    <div className="limit-name">
                      <CheckCircle2 size={16} className="check-icon" />
                      <span>{limit.name}</span>
                    </div>
                    <div className="limit-values">
                      {limit.used} / {limit.total}
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar-fill ${limit.isMaxed ? 'maxed' : 'normal'}`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="payment-section">
            <label className="payment-label">Payment Method</label>
            <select className="payment-select">
              <option value="easebuzz">Easebuzz Payment</option>
              <option value="razorpay">Razorpay</option>
              <option value="stripe">Stripe</option>
            </select>
            <button className="btn-buy-now" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="config-header">
            <h3>Plan Configurations</h3>
            <p>{planData.description}</p>
          </div>

          <div className="config-table-wrapper">
            <table className="config-table">
              <thead>
                <tr>
                  <th>CONFIGURATION</th>
                  <th>VALUE</th>
                </tr>
              </thead>
              <tbody>
                {planData.limits.map((limit, index) => (
                  <tr key={index}>
                    <td>{limit.name}</td>
                    <td className="value-cell">{limit.total === 1000 && limit.name !== 'Product Limit' ? 'Unlimited' : limit.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirm Purchase Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <button className="modal-close-btn" onClick={() => setShowConfirmModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-icon-container">
              <div className="modal-icon success">
                <Check size={28} strokeWidth={3} />
              </div>
            </div>

            <h3 className="modal-title">Confirm Purchase</h3>
            <p className="modal-text">
              You are about to purchase the following subscription plan
            </p>

            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleConfirmPurchase}>
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error/Active Subscription Modal */}
      {showErrorModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header error">
              <button className="modal-close-btn" onClick={() => setShowErrorModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-icon-container">
              <div className="modal-icon error">
                <AlertCircle size={28} strokeWidth={3} />
              </div>
            </div>

            <h3 className="modal-title">Subscription Active</h3>
            <p className="modal-text">
              You already have an active or pending subscription in the current timeframe.
            </p>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="modal-btn-confirm modal-btn-error" style={{ flex: 'none', padding: '10px 30px' }} onClick={() => setShowErrorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlanDetails;
