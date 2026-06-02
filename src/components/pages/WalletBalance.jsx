import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './WalletBalance.css';

const WalletBalance = () => {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/wallet/balance`);
        const resData = await response.json();
        if (resData.success && resData.data) {
          setWallet(resData.data);
        }
      } catch (err) {
        console.error('Error fetching wallet balance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  if (loading) {
    return (
      <div className="wallet-balance-page">
        <div className="wallet-grid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <p>Loading wallet details...</p>
        </div>
      </div>
    );
  }

  const currencySymbol = '₹';
  const balanceVal = wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00';
  const blockedVal = wallet ? parseFloat(wallet.blocked_balance).toFixed(2) : '0.00';

  return (
    <div className="wallet-balance-page">
      <div className="page-header">
        <h1 className="page-title">Wallet Balance</h1>
        <button className="btn btn-outline btn-transaction-history" onClick={() => navigate('/transaction-history')}>
          <History size={16} /> Transaction History
        </button>
      </div>

      <div className="wallet-grid">
        <div className="balance-card main-card">
          <div className="card-content centered">
            <h2 className="balance-title">Current Balance</h2>
            <p className="balance-subtitle">Available for Withdrawal</p>
            <div className="balance-amount">{currencySymbol}{balanceVal}</div>
            <button className="btn btn-primary lg" onClick={() => navigate('/withdrawals')}>Request Withdrawal</button>
          </div>
        </div>

        <div className="info-card main-card">
          <div className="card-header-inner">
            <h2 className="info-title">Wallet Information</h2>
          </div>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Wallet ID</span>
              <span className="info-value">{wallet?.id || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Blocked Balance</span>
              <span className="info-value">{currencySymbol}{blockedVal}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Currency</span>
              <span className="info-value">{wallet?.currency_code || 'INR'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Last Updated</span>
              <span className="info-value">
                {wallet?.updated_at ? new Date(wallet.updated_at).toLocaleString() : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletBalance;

