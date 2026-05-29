import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  TrendingUp, 
  ChevronDown, 
  DollarSign, 
  ShoppingCart, 
  Star, 
  Package,
  Lock,
  ArrowUpRight,
  Menu,
  RefreshCw,
  Search,
  Download,
  ArrowUpDown,
  Eye,
  MoreVertical,
  SquarePen
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import './Dashboard.css';
import { API_BASE_URL } from '../../config';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartExportDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="export-dropdown-container" ref={dropdownRef}>
      <Menu 
        size={18} 
        className="menu-icon" 
        onClick={() => setIsOpen(!isOpen)} 
      />
      
      {isOpen && (
        <div className="export-dropdown-menu">
          <div className="export-dropdown-item">Download SVG</div>
          <div className="export-dropdown-item">Download PNG</div>
          <div className="export-dropdown-item">Download CSV</div>
        </div>
      )}
    </div>
  );
};

const TimeRangeDropdown = ({ currentRange, onRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const options = [
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
    { label: 'Last 3 months', value: '3months' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="range-dropdown-container" ref={dropdownRef}>
      <div className="range-selector" onClick={() => setIsOpen(!isOpen)}>
        {options.find(opt => opt.value === currentRange)?.label} <ChevronDown size={14} />
      </div>
      
      {isOpen && (
        <div className="range-dropdown-menu">
          {options.map((option) => (
            <div 
              key={option.value}
              className={`range-dropdown-item ${currentRange === option.value ? 'active' : ''}`}
              onClick={() => {
                onRangeChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AnimatedCounter = ({ value, duration = 1000, prefix = "", suffix = "", decimals = 0 }) => {
  const [currentVal, setCurrentVal] = useState(0);
  const prevValRef = useRef(0);

  useEffect(() => {
    const start = prevValRef.current;
    const end = parseFloat(value) || 0;
    if (start === end) {
      setCurrentVal(end);
      return;
    }

    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing: easeOutQuad
      const easedProgress = progress * (2 - progress);
      const current = start + easedProgress * (end - start);
      
      setCurrentVal(current);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCurrentVal(end);
        prevValRef.current = end;
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  const formatted = currentVal.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span>{prefix}{formatted}{suffix}</span>;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30days');
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const scrollToFeedback = () => {
    const element = document.querySelector('.feedback-table-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const [stats, setStats] = useState({
    totalSales: '0.00',
    totalOrders: 0,
    totalProducts: 0,
    walletBalance: '0.00'
  });
  const [chartData, setChartData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`);
        const resData = await response.json();
        if (resData.success) {
          setStats(resData.data.stats);
          setChartData(resData.data.chartData);
          setOrders(resData.data.recentOrders || []);
        } else {
          setError(resData.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);



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

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = loggedInUser.name || 'Grocery Rajampet';

  // Helper to generate a continuous daily trend for the selected range (Shopify/Stripe-like)
  const getFilteredRevenueTrend = () => {
    if (!chartData || chartData.length === 0) return [];
    
    let daysToInclude = 30;
    if (timeRange === '7days') {
      daysToInclude = 7;
    } else if (timeRange === '3months') {
      daysToInclude = 90;
    }
    
    const result = [];
    const now = new Date();
    
    const dataMap = new Map();
    chartData.forEach(item => {
      dataMap.set(item.date, item);
    });
    
    for (let i = daysToInclude - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      
      const label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      
      if (dataMap.has(dateStr)) {
        const existing = dataMap.get(dateStr);
        result.push({
          date: dateStr,
          label: label,
          revenue: existing.sales,
          orders: existing.orders
        });
      } else {
        result.push({
          date: dateStr,
          label: label,
          revenue: 0,
          orders: 0
        });
      }
    }
    
    return result;
  };

  const revenueTrendData = getFilteredRevenueTrend();

  const distributionData = [
    { name: 'YVG General Stores', value: stats.totalOrders },
  ];

  const historyData = chartData.map(c => ({
    day: new Date(c.date).getDate().toString(),
    orders: c.orders
  }));

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayData = chartData.find(c => c.date === todayStr);
  const todayEarning = todayData ? parseFloat(todayData.sales).toFixed(2) : '0.00';

  return (
    <div className="dashboard-content-inner">
      {/* Top Row */}
      <div className="dashboard-top-grid">
        {/* Welcome Card */}
        <div className="welcome-card main-card">
          <div className="welcome-info">
            <div className="welcome-header-row">
              <h1 className="welcome-title">Welcome Back, {userName}</h1>
              <div className="live-status">
                <span className="live-dot"></span>
                <span className="live-text">LIVE</span>
              </div>
            </div>
            
            <div className="stat-group">
              <div className="stat-label">
                SALES <TimeRangeDropdown currentRange={timeRange} onRangeChange={setTimeRange} />
              </div>
              <div className="stat-value">0%</div>
            </div>

            <div className="conversion-rate">
              Conversion rate <span className="rate-value">0% <TrendingUp size={14} /></span>
            </div>

            <div className="delivery-stats">
              0 delivered out of total orders <AnimatedCounter value={stats.totalOrders} />
            </div>
            
            <div className="divider"></div>
          </div>
          
          <div className="welcome-illustration">
            <img src="/welcome-illustration.svg" alt="Illustration" />
          </div>
        </div>

        {/* Revenue Card */}
        <div className="revenue-card main-card">
          <div className="card-header">
            <span className="card-title">REVENUE</span>
            <TimeRangeDropdown currentRange={timeRange} onRangeChange={setTimeRange} />
          </div>
          <div className="card-value-large">
            <AnimatedCounter value={stats.totalSales} prefix="₹" decimals={2} />
          </div>
          <div className="card-footer">
            <span className="footer-info text-green">31 Days <Calendar size={14} /></span>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="wallet-card main-card">
          <div className="card-header">
            <span className="card-title">WALLET BALANCE</span>
          </div>
          <div className="card-value-large">
            <AnimatedCounter value={stats.walletBalance} prefix="₹" decimals={2} />
          </div>
          <div className="card-blocked">
            <span className="blocked-value">₹0.00 Blocked</span>
            <span className="blocked-line"></span>
          </div>
          <div className="wallet-chart">
            <svg width="100%" height="40" viewBox="0 0 100 40">
              <path 
                d="M0,30 Q10,25 20,28 T40,20 T60,25 T80,15 T100,10" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Second Row - Mini Cards */}
      <div className="mini-stats-grid">
        <div className="mini-card">
          <div className="mini-icon blue">
            <DollarSign size={20} />
          </div>
          <div className="mini-info">
            <div className="mini-value">
              <AnimatedCounter value={86} suffix=" Items Sold" />
            </div>
            <div className="mini-label">0 unsettled payments</div>
            <span className="navigate-link" onClick={() => navigate('/settlements')}>View Settlements &rarr;</span>
          </div>
        </div>

        <div className="mini-card">
          <div className="mini-icon green">
            <ShoppingCart size={20} />
          </div>
          <div className="mini-info">
            <div className="mini-value">
              <AnimatedCounter value={stats.totalOrders} suffix=" Orders" />
            </div>
            <div className="mini-label">0 Delivered</div>
            <span className="navigate-link" onClick={() => navigate('/orders')}>View Orders &rarr;</span>
          </div>
        </div>

        <div className="mini-card">
          <div className="mini-icon orange">
            <Star size={20} />
          </div>
          <div className="mini-info">
            <div className="mini-value">0 Rating</div>
            <div className="mini-label">0 reviews</div>
            <span className="navigate-link" onClick={scrollToFeedback}>View Reviews &rarr;</span>
          </div>
        </div>

        <div className="mini-card">
          <div className="mini-icon light-blue">
            <Package size={20} />
          </div>
          <div className="mini-info">
            <div className="mini-value">
              <AnimatedCounter value={stats.totalProducts} suffix=" Products" />
            </div>
            <div className="mini-label">140 new this week</div>
            <span className="navigate-link" onClick={() => navigate('/products')}>View Products &rarr;</span>
          </div>
        </div>
      </div>

      {/* Third Row - Charts */}
      <div className="charts-grid">
        <div className="chart-card main-card">
          <div className="card-header">
            <span className="card-title">Store Revenue</span>
            <div className="header-right">
              <TimeRangeDropdown currentRange={timeRange} onRangeChange={setTimeRange} />
              <ChartExportDropdown />
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueTrendData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="revenueTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis 
                  dataKey="label" 
                  stroke="#94a3b8" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card-bg)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    color: 'var(--text-primary)'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                  labelStyle={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '4px' }}
                  formatter={(value) => [`₹${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#revenueTrendGradient)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card main-card">
          <div className="card-header">
            <span className="card-title">Store-wise Order Distribution</span>
          </div>
          <div className="chart-content donut-center-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                   itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="donut-center-text">
              <div className="donut-label">Total Orders</div>
              <div className="donut-value">
                <AnimatedCounter value={stats.totalOrders} />
              </div>
            </div>
            <div className="chart-legend">
               <div className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: '#0088FE' }}></span>
                  <span className="legend-text">YVG General Stores</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fourth Row - Recent Orders Table */}
      <div className="orders-section main-card">
        <div className="section-header">
          <h2 className="section-title">Recent Orders</h2>
          <div className="header-actions">
            <button className="btn btn-primary">View All Orders</button>
            <button className="btn btn-outline">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        <div className="table-controls">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="controls-right">
            <div className="entries-selector">
              <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              <span>entries per page</span>
            </div>
            
            <button className="btn btn-outline btn-sm">
              Columns <ChevronDown size={14} />
            </button>
            
            <button className="btn btn-outline btn-sm">
              <Download size={14} /> Export <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th className="sortable">
                  <div className="th-content">ID <ArrowUpDown size={14} /></div>
                </th>
                <th>ORDER DATE</th>
                <th>PRODUCT DETAILS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, entriesPerPage).map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    <div className="date-cell">
                      <span className="time-ago">{getRelativeTime(order.created_at)}</span>
                      <span className="full-date">{new Date(order.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="product-details-cell">
                      <div className="detail-row">
                        <span className="detail-label">Product Name:</span> 
                        <span className="detail-value text-blue">{order.productName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Variant Name:</span> 
                        <span className="detail-value text-blue">{order.variant}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Store Name:</span> 
                        <span className="detail-value">{order.storeName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">SKU:</span> 
                        <span className="detail-value">{order.sku}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Quantity:</span> 
                        <span className="detail-value">{order.quantity}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Item Sub Total:</span> 
                        <span className="detail-value">₹{parseFloat(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${(order.status || 'pending').toLowerCase()}`}>{order.status}</span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn-info-outline">
                        <SquarePen size={16} /> More Information
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fifth Row - Daily History & Feedback */}
      <div className="history-section main-card">
        <div className="card-header">
           <span className="card-title">Daily Orders History</span>
        </div>
        
        <div className="history-content">
          <div className="history-stats">
            <div className="earning-label">Today's Earning : <AnimatedCounter value={todayEarning} prefix="₹" decimals={2} /></div>
            <div className="earning-comparison">
              <TrendingUp size={14} /> 0 % more than yesterday
            </div>
          </div>
          
          <div className="history-chart">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                   itemStyle={{ color: '#f8fafc' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorOrders)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="feedback-table-container">
           <table className="feedback-table">
             <thead>
               <tr>
                 <th>CUSTOMER</th>
                 <th>FEEDBACK</th>
                 <th>RATING</th>
                 <th>DATE</th>
               </tr>
             </thead>
             <tbody>
               <tr>
                 <td colSpan="4" className="no-data">No feedback available</td>
               </tr>
             </tbody>
           </table>
        </div>

        <div className="feedback-footer">
          <div className="rating-info">
            Total Reviews: 0 | Average Rating: 0
          </div>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={20} fill="#e2e8f0" stroke="#e2e8f0" />
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Footer */}
      <footer className="dashboard-footer">
        <p>Copyright © 2026 Chota Beta | More Sellers. More Choices. Better Deals.. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
