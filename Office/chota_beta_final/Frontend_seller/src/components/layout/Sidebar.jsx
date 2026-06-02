import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  ShoppingCart,
  Undo2,
  Grid2X2,
  Tag,
  ListTree,
  Package,
  CreditCard,
  Percent,
  Store,
  Bell,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Circle,
  LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // Auto-open menus if a sub-item is active
  useEffect(() => {
    if (location.pathname === '/wallet-balance' || 
        location.pathname === '/transaction-history' || 
        location.pathname === '/withdrawals' ||
        location.pathname === '/withdrawal-history') {
      setOpenSubmenu('wallet');
    } else if (location.pathname === '/products' || 
               location.pathname === '/add-product' || 
               location.pathname === '/bulk-upload' ||
               location.pathname === '/product-faqs') {
      setOpenSubmenu('products');
    } else if (location.pathname === '/plans') {
      setOpenSubmenu('subscriptions');
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src="/chota-beta-logo.jpg" alt="Chota Beta Logo" className="sidebar-logo-img" />
        <span>Seller Console</span>
      </div>

      <div
        className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        onClick={() => navigate('/dashboard')}
      >
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </div>

      <div className={`nav-item ${openSubmenu === 'wallet' ? 'open' : ''}`} onClick={() => toggleSubmenu('wallet')}>
        <div className="nav-item-main">
          <div className="nav-item-content">
            <Wallet size={18} />
            <span>Wallet</span>
          </div>
          {openSubmenu === 'wallet' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {openSubmenu === 'wallet' && (
        <div className="submenu">
          <div
            className={`submenu-item ${isActive('/wallet-balance') ? 'active' : ''}`}
            onClick={() => navigate('/wallet-balance')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Wallet Balance</span>
          </div>
          <div
            className={`submenu-item ${isActive('/withdrawals') ? 'active' : ''}`}
            onClick={() => navigate('/withdrawals')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Withdrawals</span>
          </div>
          <div
            className={`submenu-item ${isActive('/withdrawal-history') ? 'active' : ''}`}
            onClick={() => navigate('/withdrawal-history')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Withdrawal History</span>
          </div>
        </div>
      )}

      <div 
        className={`nav-item ${location.pathname === '/settlements' ? 'active' : ''}`}
        onClick={() => navigate('/settlements')}
      >
        <ArrowRightLeft size={18} />
        <span>Settlements</span>
      </div>
      <div 
        className={`nav-item ${location.pathname === '/orders' ? 'active' : ''}`}
        onClick={() => navigate('/orders')}
      >
        <ShoppingCart size={18} />
        <span>Orders</span>
      </div>
      <div className={`nav-item ${openSubmenu === 'returns' ? 'open' : ''}`} onClick={() => toggleSubmenu('returns')}>
        <div className="nav-item-main">
          <div className="nav-item-content">
            <Undo2 size={18} />
            <span>Return Orders</span>
          </div>
          {openSubmenu === 'returns' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {openSubmenu === 'returns' && (
        <div className="submenu">
          <div
            className={`submenu-item ${isActive('/return-requests') ? 'active' : ''}`}
            onClick={() => navigate('/return-requests')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Return Requests</span>
          </div>
        </div>
      )}
      <div 
        className={`nav-item ${location.pathname === '/categories' ? 'active' : ''}`}
        onClick={() => navigate('/categories')}
      >
        <Grid2X2 size={18} />
        <span>Categories</span>
      </div>
      <div 
        className={`nav-item ${location.pathname === '/brands' ? 'active' : ''}`}
        onClick={() => navigate('/brands')}
      >
        <Tag size={18} />
        <span>Brands</span>
      </div>
      <div 
        className={`nav-item ${location.pathname === '/attributes' ? 'active' : ''}`}
        onClick={() => navigate('/attributes')}
      >
        <ListTree size={18} />
        <span>Attributes</span>
      </div>
      <div className={`nav-item ${openSubmenu === 'products' ? 'open' : ''}`} onClick={() => toggleSubmenu('products')}>
        <div className="nav-item-main">
          <div className="nav-item-content">
            <Package size={18} />
            <span>Manage Products</span>
          </div>
          {openSubmenu === 'products' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {openSubmenu === 'products' && (
        <div className="submenu">
          <div 
            className={`submenu-item ${isActive('/products') ? 'active' : ''}`}
            onClick={() => navigate('/products')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Products</span>
          </div>
          <div 
            className={`submenu-item ${isActive('/add-product') ? 'active' : ''}`}
            onClick={() => navigate('/add-product')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Add Products</span>
          </div>
          <div 
            className={`submenu-item ${isActive('/bulk-upload') ? 'active' : ''}`}
            onClick={() => navigate('/bulk-upload')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Bulk Upload</span>
          </div>
          <div 
            className={`submenu-item ${isActive('/product-faqs') ? 'active' : ''}`}
            onClick={() => navigate('/product-faqs')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Product FAQs</span>
          </div>
        </div>
      )}
      <div className={`nav-item ${openSubmenu === 'subscriptions' ? 'open' : ''}`} onClick={() => toggleSubmenu('subscriptions')}>
        <div className="nav-item-main">
          <div className="nav-item-content">
            <CreditCard size={18} />
            <span>Subscriptions</span>
          </div>
          {openSubmenu === 'subscriptions' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {openSubmenu === 'subscriptions' && (
        <div className="submenu">
          <div 
            className={`submenu-item ${isActive('/plans') ? 'active' : ''}`}
            onClick={() => navigate('/plans')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Plans</span>
          </div>
          <div 
            className={`submenu-item ${isActive('/current-subscription') ? 'active' : ''}`}
            onClick={() => navigate('/current-subscription')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Current Subscription</span>
          </div>
          <div 
            className={`submenu-item ${isActive('/subscription-history') ? 'active' : ''}`}
            onClick={() => navigate('/subscription-history')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Subscription History</span>
          </div>
        </div>
      )}
      <div 
        className={`nav-item ${isActive('/tax-rates') ? 'active' : ''}`}
        onClick={() => navigate('/tax-rates')}
      >
        <Percent size={18} />
        <span>Tax Rates</span>
      </div>
      <div 
        className={`nav-item ${isActive('/stores') ? 'active' : ''}`}
        onClick={() => navigate('/stores')}
      >
        <Store size={18} />
        <span>Stores</span>
      </div>
      <div 
        className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
        onClick={() => navigate('/notifications')}
      >
        <Bell size={18} />
        <span>Seller Notifications</span>
      </div>
      <div className={`nav-item ${openSubmenu === 'roles' ? 'open' : ''}`} onClick={() => toggleSubmenu('roles')}>
        <div className="nav-item-main">
          <div className="nav-item-content">
            <ShieldCheck size={18} />
            <span>Roles & Permissions</span>
          </div>
          {openSubmenu === 'roles' ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      </div>

      {openSubmenu === 'roles' && (
        <div className="submenu">
          <div 
            className={`submenu-item ${isActive('/roles') ? 'active' : ''}`}
            onClick={() => navigate('/roles')}
          >
            <Circle size={8} fill="currentColor" />
            <span>Roles</span>
          </div>
          <div 
            className={`submenu-item ${isActive('/system-users') ? 'active' : ''}`}
            onClick={() => navigate('/system-users')}
          >
            <Circle size={8} fill="currentColor" />
            <span>System Users</span>
          </div>
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
