import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import WalletBalance from './components/pages/WalletBalance';
import TransactionHistory from './components/pages/TransactionHistory';
import Withdrawals from './components/pages/Withdrawals';
import WithdrawalHistory from './components/pages/WithdrawalHistory';
import Settlements from './components/pages/Settlements';
import SettlementHistory from './components/pages/SettlementHistory';
import Orders from './components/pages/Orders';
import ReturnRequests from './components/pages/ReturnRequests';
import Categories from './components/pages/Categories';
import Brands from './components/pages/Brands';
import Attributes from './components/pages/Attributes';
import Products from './components/pages/Products';
import AddProduct from './components/pages/AddProduct';
import BulkUpload from './components/pages/BulkUpload';
import ProductFAQs from './components/pages/ProductFAQs';
import Plans from './components/pages/Plans';
import PlanDetails from './components/pages/PlanDetails';
import CurrentSubscription from './components/pages/CurrentSubscription';
import SubscriptionHistory from './components/pages/SubscriptionHistory';
import TaxRates from './components/pages/TaxRates';
import Stores from './components/pages/Stores';
import AddStore from './components/pages/AddStore';
import StoreConfig from './components/pages/StoreConfig';
import Notifications from './components/pages/Notifications';
import Roles from './components/pages/Roles';
import AddPermissions from './components/pages/AddPermissions';
import SystemUsers from './components/pages/SystemUsers';
import Profile from './components/pages/Profile';
import EditProfile from './components/pages/EditProfile';
import MainLayout from './components/layout/MainLayout';
import './App.css';

function App() {
  const [theme, setTheme] = React.useState('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <div className={`App ${theme}-theme`}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/wallet-balance"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <WalletBalance />
              </MainLayout>
            }
          />
          <Route
            path="/transaction-history"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <TransactionHistory />
              </MainLayout>
            }
          />
          <Route
            path="/withdrawals"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Withdrawals />
              </MainLayout>
            }
          />
          <Route
            path="/withdrawal-history"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <WithdrawalHistory />
              </MainLayout>
            }
          />
          <Route
            path="/settlements"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Settlements />
              </MainLayout>
            }
          />
          <Route
            path="/settlements/history"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <SettlementHistory />
              </MainLayout>
            }
          />
          <Route
            path="/orders"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Orders />
              </MainLayout>
            }
          />
          <Route
            path="/return-requests"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <ReturnRequests />
              </MainLayout>
            }
          />
          <Route
            path="/categories"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Categories />
              </MainLayout>
            }
          />
          <Route
            path="/brands"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Brands />
              </MainLayout>
            }
          />
          <Route
            path="/attributes"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Attributes />
              </MainLayout>
            }
          />
          <Route
            path="/products"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Products />
              </MainLayout>
            }
          />
          <Route
            path="/add-product"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <AddProduct />
              </MainLayout>
            }
          />
          <Route
            path="/bulk-upload"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <BulkUpload />
              </MainLayout>
            }
          />
          <Route
            path="/product-faqs"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <ProductFAQs />
              </MainLayout>
            }
          />
          <Route
            path="/plans"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Plans />
              </MainLayout>
            }
          />
          <Route
            path="/plan-details"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <PlanDetails />
              </MainLayout>
            }
          />
          <Route
            path="/current-subscription"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <CurrentSubscription />
              </MainLayout>
            }
          />
          <Route
            path="/subscription-history"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <SubscriptionHistory />
              </MainLayout>
            }
          />
          <Route
            path="/tax-rates"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <TaxRates />
              </MainLayout>
            }
          />
          <Route
            path="/stores"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Stores />
              </MainLayout>
            }
          />
          <Route
            path="/add-store"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <AddStore />
              </MainLayout>
            }
          />
          <Route
            path="/edit-store/:id"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <AddStore />
              </MainLayout>
            }
          />
          <Route
            path="/store-config/:id"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <StoreConfig />
              </MainLayout>
            }
          />
          <Route
            path="/notifications"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Notifications />
              </MainLayout>
            }
          />
          <Route
            path="/roles"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Roles />
              </MainLayout>
            }
          />
          <Route
            path="/add-permissions/:id"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <AddPermissions />
              </MainLayout>
            }
          />
          <Route
            path="/system-users"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <SystemUsers />
              </MainLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <Profile />
              </MainLayout>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <MainLayout onThemeToggle={toggleTheme} theme={theme}>
                <EditProfile />
              </MainLayout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

