import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Plans.css';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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

    const fetchActiveSubscription = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/meta/subscriptions/active`);
        const resData = await response.json();
        if (resData.success && resData.data) {
          setActiveSubscription(resData.data);
        }
      } catch (err) {
        console.error('Error fetching active subscription:', err);
      }
    };

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPlans(), fetchActiveSubscription()]);
      setLoading(false);
    };

    init();
  }, []);

  const specs = [
    {
      label: 'Store Limit',
      values: ['1', '2', '2', '5', 'Unlimited']
    },
    {
      label: 'Product Limit',
      values: ['500', '1000', '2000', 'Unlimited', 'Unlimited']
    },
    {
      label: 'Role Limit',
      values: ['2', '5', '5', '10', 'Unlimited']
    },
    {
      label: 'System User Limit',
      values: ['2', '5', '5', '10', 'Unlimited']
    }
  ];

  const handleChoosePlan = (planName) => {
    navigate('/plan-details', { state: { planName, activeSubscription } });
  };

  if (loading) {
    return (
      <div className="plans-page">
        <div className="plans-card" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="plans-page">
      <div className="plans-card">
        {/* Header Section */}
        <div className="plans-header">
          <h1 className="page-title">Pricing</h1>
          <div className="breadcrumb">
            <span className="home">Home</span>
            <span className="separator">/</span>
            <span className="current active">Pricing</span>
          </div>
        </div>

        {/* Pricing Table Section */}
        <div className="pricing-table-wrapper">
          <table className="pricing-table">
            <thead>
              <tr>
                {/* Empty corner header cell */}
                <th className="corner-th"></th>
                {plans.map((plan, index) => {
                  const isCurrent = activeSubscription && activeSubscription.plan_id === plan.id;
                  return (
                    <th key={index} className="plan-header-th">
                      <div className={`plan-header-card ${isCurrent ? 'current-plan-card' : ''}`}>
                        {isCurrent && <span className="current-plan-indicator">ACTIVE</span>}
                        <span className="plan-name">{plan.name.toUpperCase()}</span>
                        <span className="plan-price">₹{parseFloat(plan.price).toFixed(2)}</span>
                        <span className="plan-duration">Duration: {plan.duration_days} {plan.duration_type === 'days' ? 'Days' : plan.duration_type}</span>
                        <button
                          className={`btn-choose-plan ${isCurrent ? 'btn-current-plan' : ''}`}
                          onClick={() => handleChoosePlan(plan.name)}
                        >
                          {isCurrent ? 'Current Plan' : 'Choose Plan'}
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Category Span Row */}
              <tr>
                <td colSpan={plans.length + 1} className="section-header-td">
                  PLAN CONFIGURATIONS
                </td>
              </tr>

              {/* Specification Comparison Rows */}
              {specs.map((spec, sIndex) => (
                <tr key={sIndex} className="spec-row">
                  <td className="spec-label-td">{spec.label}</td>
                  {plans.map((plan, pIndex) => (
                    <td key={pIndex} className="spec-val-td">
                      {spec.values[pIndex] || '-'}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Bottom Actions Row */}
              <tr className="bottom-actions-row">
                <td className="spec-label-td"></td>
                {plans.map((plan, index) => {
                  const isCurrent = activeSubscription && activeSubscription.plan_id === plan.id;
                  return (
                    <td key={index} className="spec-val-td action-cell">
                      <button
                        className={`btn-choose-plan ${isCurrent ? 'btn-current-plan' : ''}`}
                        onClick={() => handleChoosePlan(plan.name)}
                      >
                        {isCurrent ? 'Current Plan' : 'Choose Plan'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Plans;

