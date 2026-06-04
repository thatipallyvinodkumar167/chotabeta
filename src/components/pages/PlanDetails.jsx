import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, X, Check, AlertCircle, CreditCard, Wallet, Lock } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './PlanDetails.css';

const PlanDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const planName = location.state?.planName || 'TRAIL ACCESS';
  const activeSubFromState = location.state?.activeSubscription;

  const [activeSubscription, setActiveSubscription] = useState(activeSubFromState || null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Payment gateway checkout states
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentGatewayName, setPaymentGatewayName] = useState('easebuzz');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [txnId, setTxnId] = useState('');
  const [razorpayTab, setRazorpayTab] = useState('card');
  const [easebuzzTab, setEasebuzzTab] = useState('card');

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

    const fetchPlans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/meta/subscription-plans`);
        const resData = await response.json();
        if (resData.success) {
          setPlans(resData.data);
        }
      } catch (err) {
        console.error('Error fetching plans:', err);
      }
    };

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchActiveSubscription(), fetchPlans()]);
      setLoading(false);
    };

    init();
  }, []);

  const chosenPlan = plans.find(p => p.name.toUpperCase() === planName.toUpperCase()) || {
    id: 1,
    name: planName,
    price: planName === 'TRAIL ACCESS' ? '0.00' : '499.00',
    duration_days: planName === 'TRAIL ACCESS' ? 60 : 30,
    description: `Start your seller journey with Chota Beta.`
  };

  const getLimitsForPlan = (plan) => {
    if (plan.limits) {
      return [
        { name: 'Store Limit', total: plan.limits.store_limit === null ? 1000000 : plan.limits.store_limit, isUnlimited: plan.limits.store_limit === null },
        { name: 'Product Limit', total: plan.limits.product_limit === null ? 1000000 : plan.limits.product_limit, isUnlimited: plan.limits.product_limit === null },
        { name: 'Role Limit', total: plan.limits.role_limit === null ? 1000000 : plan.limits.role_limit, isUnlimited: plan.limits.role_limit === null },
        { name: 'System User Limit', total: plan.limits.system_user_limit === null ? 1000000 : plan.limits.system_user_limit, isUnlimited: plan.limits.system_user_limit === null }
      ];
    }

    const pName = plan.name?.toUpperCase() || '';
    if (pName.includes('TRAIL')) {
      return [
        { name: 'Store Limit', total: 1 },
        { name: 'Product Limit', total: 100 },
        { name: 'Role Limit', total: 2 },
        { name: 'System User Limit', total: 2 }
      ];
    } else if (pName.includes('BASIC')) {
      return [
        { name: 'Store Limit', total: 1 },
        { name: 'Product Limit', total: 100 },
        { name: 'Role Limit', total: 2 },
        { name: 'System User Limit', total: 2 }
      ];
    } else if (pName.includes('STANDARD')) {
      return [
        { name: 'Store Limit', total: 2 },
        { name: 'Product Limit', total: 1000 },
        { name: 'Role Limit', total: 5 },
        { name: 'System User Limit', total: 5 }
      ];
    } else if (pName.includes('PREMIUM')) {
      return [
        { name: 'Store Limit', total: 5 },
        { name: 'Product Limit', total: 1000000, isUnlimited: true },
        { name: 'Role Limit', total: 10 },
        { name: 'System User Limit', total: 10 }
      ];
    } else { // Enterprise
      return [
        { name: 'Store Limit', total: 1000000, isUnlimited: true },
        { name: 'Product Limit', total: 1000000, isUnlimited: true },
        { name: 'Role Limit', total: 1000000, isUnlimited: true },
        { name: 'System User Limit', total: 1000000, isUnlimited: true }
      ];
    }
  };

  const limits = getLimitsForPlan(chosenPlan).map(limit => {
    let used = 0;
    if (activeSubscription && activeSubscription.usage) {
      if (limit.name === 'Store Limit') used = activeSubscription.usage.store_limit || 0;
      if (limit.name === 'Product Limit') used = activeSubscription.usage.product_limit || 0;
      if (limit.name === 'Role Limit') used = activeSubscription.usage.role_limit || 0;
      if (limit.name === 'System User Limit') used = activeSubscription.usage.system_user_limit || 0;
    } else {
      if (limit.name === 'Store Limit') used = 1;
      if (limit.name === 'Product Limit') used = 0;
      if (limit.name === 'Role Limit') used = 0;
      if (limit.name === 'System User Limit') used = 0;
    }
    
    const isMaxed = used >= limit.total && !limit.isUnlimited;
    return {
      ...limit,
      used,
      isMaxed
    };
  });

  const currentPlanPrice = activeSubscription ? parseFloat(activeSubscription.price_paid) : 0;
  const chosenPlanPrice = parseFloat(chosenPlan.price);
  
  const isCurrentPlan = activeSubscription && activeSubscription.plan_id === chosenPlan.id;
  const isUpgrade = activeSubscription && (chosenPlanPrice > currentPlanPrice);
  const isDowngrade = activeSubscription && !isCurrentPlan && (chosenPlanPrice <= currentPlanPrice);

  const handleBuyNow = () => {
    if (isCurrentPlan) {
      return;
    }
    
    if (isDowngrade) {
      setErrorMsg(`You already have an active subscription of standard or higher tier (${activeSubscription.plan_name}). Downgrading to a lower plan is not allowed directly.`);
      setShowErrorModal(true);
    } else {
      // Fresh purchase or upgrade
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = () => {
    setShowConfirmModal(false);
    setShowPaymentGateway(true);
    setPaymentStatus('idle');
  };

  const executePayment = async () => {
    setPaymentStatus('processing');
    
    setTimeout(async () => {
      const generatedTxnId = 'TXN-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      setTxnId(generatedTxnId);
      
      try {
        const response = await fetch(`${API_BASE_URL}/meta/subscriptions/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            plan_id: chosenPlan.id,
            payment_gateway: paymentGatewayName,
            transaction_id: generatedTxnId,
            amount: chosenPlan.price
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setPaymentStatus('success');
          setTimeout(() => {
            setShowPaymentGateway(false);
            navigate('/current-subscription');
          }, 2500);
        } else {
          setPaymentStatus('failed');
          setErrorMsg(data.message || 'Payment failed on backend activation.');
          setTimeout(() => {
            setPaymentStatus('idle');
            setShowPaymentGateway(false);
            setShowErrorModal(true);
          }, 2000);
        }
      } catch (err) {
        console.error('Subscription purchase failed:', err);
        setPaymentStatus('failed');
        setErrorMsg('Network error. Failed to complete subscription activation.');
        setTimeout(() => {
          setPaymentStatus('idle');
          setShowPaymentGateway(false);
          setShowErrorModal(true);
        }, 2000);
      }
    }, 2000);
  };

  if (loading) {
    return (
      <div className="plan-details-page">
        <div className="plan-details-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Loading plan details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-details-page">
      <div className="plan-details-header">
        <h1 className="page-title">Subscription Plan Details</h1>
      </div>

      <div className="plan-details-card">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="plan-summary-header">
            {isCurrentPlan && <span className="current-badge-large">CURRENT ACTIVE PLAN</span>}
            <h3 className="plan-title">{chosenPlan.name}</h3>
            <div className="plan-price-large">₹{parseFloat(chosenPlan.price).toFixed(2)}</div>
            <div className="plan-duration-text">Duration: {chosenPlan.duration_days} Days</div>
          </div>

          <div className="limits-section">
            {limits.map((limit, index) => {
              const totalVal = limit.isUnlimited ? 1000000 : limit.total;
              const percentage = Math.min((limit.used / totalVal) * 100, 100);
              return (
                <div key={index} className="limit-item">
                  <div className="limit-item-header">
                    <div className="limit-name">
                      <CheckCircle2 size={16} className="check-icon" />
                      <span>{limit.name}</span>
                    </div>
                    <div className="limit-values">
                      {limit.used} / {limit.isUnlimited ? 'Unlimited' : limit.total}
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
            <select 
              className="payment-select"
              value={paymentGatewayName}
              onChange={(e) => setPaymentGatewayName(e.target.value)}
              disabled={isCurrentPlan}
            >
              <option value="easebuzz">Easebuzz Payment</option>
              <option value="razorpay">Razorpay</option>
            </select>
            <button 
              className={`btn-buy-now ${isCurrentPlan ? 'btn-buy-now-current' : ''}`} 
              onClick={handleBuyNow}
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? 'Current Plan' : (isUpgrade ? 'Upgrade Plan' : 'Buy Now')}
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="right-panel">
          <div className="config-header">
            <h3>Plan Configurations</h3>
            <p>{chosenPlan.description}</p>
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
                {limits.map((limit, index) => (
                  <tr key={index}>
                    <td>{limit.name}</td>
                    <td className="value-cell">{limit.isUnlimited ? 'Unlimited' : limit.total}</td>
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

            <h3 className="modal-title">{isUpgrade ? 'Confirm Upgrade' : 'Confirm Purchase'}</h3>
            <p className="modal-text">
              {isUpgrade 
                ? `You are about to upgrade from your current plan to the ${chosenPlan.name} for ₹${parseFloat(chosenPlan.price).toFixed(2)}.`
                : `You are about to purchase the ${chosenPlan.name} for ₹${parseFloat(chosenPlan.price).toFixed(2)}.`
              }
            </p>

            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-confirm" onClick={handleConfirmPurchase}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
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

            <h3 className="modal-title">Action Blocked</h3>
            <p className="modal-text">
              {errorMsg}
            </p>

            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="modal-btn-confirm modal-btn-error" style={{ flex: 'none', padding: '10px 30px' }} onClick={() => setShowErrorModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Checkout Overlays */}
      {showPaymentGateway && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          {paymentStatus === 'processing' ? (
            <div className="gateway-modal-container processing">
              <div className="spinner-animation"></div>
              <h4 style={{ color: '#ffffff', marginTop: '16px' }}>Securing transaction...</h4>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>Please do not refresh the page or click back.</p>
            </div>
          ) : paymentStatus === 'success' ? (
            <div className="gateway-modal-container success">
              <div className="success-checkmark-circle">
                <Check size={36} color="#ffffff" strokeWidth={3} />
              </div>
              <h4 style={{ color: '#ffffff', marginTop: '16px' }}>Payment Successful!</h4>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>Transaction ID: {txnId}</p>
              <span className="success-redirect-note" style={{ color: '#10b981', display: 'block', marginTop: '12px', fontSize: '12px', fontWeight: '600' }}>
                Activating your {chosenPlan.name} plan...
              </span>
            </div>
          ) : (
            <div className={`gateway-modal-container checkout ${paymentGatewayName}`}>
              <div className="gateway-modal-header">
                {paymentGatewayName === 'razorpay' && (
                  <div className="razorpay-logo-area">
                    <span className="brand-primary">Razorpay</span>
                    <span className="brand-sec">Secure Checkout</span>
                  </div>
                )}
                {paymentGatewayName === 'easebuzz' && (
                  <div className="easebuzz-logo-area">
                    <span className="easebuzz-logo">easebuzz</span>
                  </div>
                )}
                <button className="gateway-close-btn" onClick={() => setShowPaymentGateway(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="gateway-modal-body">
                <div className="merchant-details">
                  <div className="merchant-info">
                    <h5>Chota Beta Seller Access</h5>
                    <span className="plan-label-mini">Plan: {chosenPlan.name}</span>
                  </div>
                  <div className="amount-info">
                    ₹{parseFloat(chosenPlan.price).toFixed(2)}
                  </div>
                </div>

                {/* Razorpay Form */}
                {paymentGatewayName === 'razorpay' && (
                  <div className="razorpay-checkout-form">
                    <div className="payment-tabs-gw">
                      <div className={`tab-gw ${razorpayTab === 'card' ? 'active' : ''}`} onClick={() => setRazorpayTab('card')}>Card</div>
                      <div className={`tab-gw ${razorpayTab === 'upi' ? 'active' : ''}`} onClick={() => setRazorpayTab('upi')}>UPI</div>
                      <div className={`tab-gw ${razorpayTab === 'netbanking' ? 'active' : ''}`} onClick={() => setRazorpayTab('netbanking')}>Netbanking</div>
                    </div>
                    
                    {razorpayTab === 'card' && (
                      <div className="tab-content-gw" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="form-group-gateway">
                          <label>Card Number</label>
                          <input type="text" placeholder="4111 1111 1111 1111" defaultValue="4111 1111 1111 1111" className="gateway-input" />
                        </div>
                        <div className="form-row-gateway">
                          <div className="form-group-gateway half">
                            <label>Expiry</label>
                            <input type="text" placeholder="12 / 29" defaultValue="12/29" className="gateway-input" />
                          </div>
                          <div className="form-group-gateway half">
                            <label>CVV</label>
                            <input type="text" placeholder="123" defaultValue="123" className="gateway-input" />
                          </div>
                        </div>
                        <div className="form-group-gateway">
                          <label>Card Holder Name</label>
                          <input type="text" placeholder="Chota Beta Seller" defaultValue="Chota Beta Seller" className="gateway-input" />
                        </div>
                      </div>
                    )}

                    {razorpayTab === 'upi' && (
                      <div className="tab-content-gw" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group-gateway">
                          <label>Enter UPI ID</label>
                          <input type="text" placeholder="username@upi" defaultValue="seller@okaxis" className="gateway-input" />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                          <div style={{ width: '100px', height: '100px', backgroundColor: '#ffffff', padding: '6px', borderRadius: '4px' }}>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=ChotaBetaSellerSubscription" alt="UPI QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Scan QR Code with any UPI app to pay</span>
                        </div>
                      </div>
                    )}

                    {razorpayTab === 'netbanking' && (
                      <div className="tab-content-gw" style={{ marginTop: '16px' }}>
                        <label style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px', display: 'block' }}>Select Popular Bank</label>
                        <div className="netbanking-grid-gw" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                          <div className="bank-option-gw active" style={{ padding: '10px', border: '1px solid #0c66e4', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#ffffff', backgroundColor: 'rgba(12, 102, 228, 0.1)' }}>SBI</div>
                          <div className="bank-option-gw" style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#94a3b8' }} onClick={(e) => { e.currentTarget.style.borderColor = '#0c66e4'; e.currentTarget.style.color = '#ffffff'; }}>HDFC Bank</div>
                          <div className="bank-option-gw" style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#94a3b8' }} onClick={(e) => { e.currentTarget.style.borderColor = '#0c66e4'; e.currentTarget.style.color = '#ffffff'; }}>ICICI Bank</div>
                          <div className="bank-option-gw" style={{ padding: '10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: '500', color: '#94a3b8' }} onClick={(e) => { e.currentTarget.style.borderColor = '#0c66e4'; e.currentTarget.style.color = '#ffffff'; }}>Axis Bank</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Easebuzz Form */}
                {paymentGatewayName === 'easebuzz' && (
                  <div className="easebuzz-checkout-form">
                    <div className="form-group-gateway" style={{ marginBottom: '12px' }}>
                      <label>Mobile Number</label>
                      <input type="text" defaultValue="+91 9876543210" readOnly className="gateway-input" />
                    </div>
                    <div className="form-group-gateway" style={{ marginBottom: '16px' }}>
                      <label>Email ID</label>
                      <input type="email" defaultValue="seller@chotabeta.com" readOnly className="gateway-input" />
                    </div>
                    <div className="easebuzz-methods" style={{ marginBottom: '16px' }}>
                      <div className={`method-option-gw ${easebuzzTab === 'card' ? 'active' : ''}`} onClick={() => setEasebuzzTab('card')}>
                        <CreditCard size={18} />
                        <span>Credit / Debit Card</span>
                      </div>
                      <div className={`method-option-gw ${easebuzzTab === 'wallet' ? 'active' : ''}`} onClick={() => setEasebuzzTab('wallet')}>
                        <Wallet size={18} />
                        <span>Wallets / UPI</span>
                      </div>
                    </div>
                    
                    {easebuzzTab === 'card' && (
                      <div className="easebuzz-card-fields">
                        <input type="text" placeholder="Card Number" defaultValue="4111 1111 1111 1111" className="gateway-input" />
                        <div className="form-row-gateway">
                          <input type="text" placeholder="MM/YY" defaultValue="12/29" className="gateway-input half" />
                          <input type="text" placeholder="CVV" defaultValue="123" className="gateway-input half" />
                        </div>
                      </div>
                    )}

                    {easebuzzTab === 'wallet' && (
                      <div className="easebuzz-wallets" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="wallet-item-eb" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #ff5a00', borderRadius: '6px', color: '#ff5a00', backgroundColor: '#fcf6f2', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          📱 PhonePe / BHIM UPI
                        </div>
                        <div className="wallet-item-eb" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', color: '#475569', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={(e) => { e.currentTarget.style.borderColor = '#ff5a00'; e.currentTarget.style.color = '#ff5a00'; e.currentTarget.style.backgroundColor = '#fcf6f2'; }}>
                          💳 Paytm Wallet
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button className="gateway-pay-btn" onClick={executePayment}>
                  <Lock size={14} style={{ marginRight: '8px' }} />
                  Pay ₹{parseFloat(chosenPlan.price).toFixed(2)}
                </button>

                <div className="gateway-security-footer">
                  🔒 SSL Encrypted Secure Connection
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default PlanDetails;
