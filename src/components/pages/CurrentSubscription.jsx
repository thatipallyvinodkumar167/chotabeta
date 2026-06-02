import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import './CurrentSubscription.css';

const CurrentSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveSubscription = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/meta/subscriptions/active`);
        const resData = await response.json();
        if (resData.success && resData.data) {
          setSubscription(resData.data);
        }
      } catch (err) {
        console.error('Error fetching active subscription:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveSubscription();
  }, []);

  if (loading) {
    return (
      <div className="current-subscription-page">
        <div className="current-subscription-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="current-subscription-page">
      <div className="page-header">
        <h1 className="page-title">Current Subscription</h1>
        <div className="breadcrumb">
          <span className="home">Home</span>
          <span className="separator">/</span>
          <span className="home">Subscriptions</span>
          <span className="separator">/</span>
          <span className="current active">Current Subscription</span>
        </div>
      </div>

      <div className="current-subscription-card">
        {subscription ? (
          <div className="subscription-details">
            <div className="subscription-header-row">
              <h2 className="plan-name-display">{subscription.plan_name.toUpperCase()}</h2>
              <span className={`status-badge-active ${subscription.status.toLowerCase()}`}>
                {subscription.status.toUpperCase()}
              </span>
            </div>
            
            <p className="plan-description-display">{subscription.plan_description}</p>
            
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Price Paid</span>
                <span className="detail-value">₹{parseFloat(subscription.price_paid).toFixed(2)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{new Date(subscription.start_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">End Date</span>
                <span className="detail-value">{new Date(subscription.end_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Billing Cycle</span>
                <span className="detail-value">Monthly</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="alert-info">
            No active subscription found
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentSubscription;

