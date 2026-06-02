import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import './MainLayout.css';

const MainLayout = ({ children, onThemeToggle, theme }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="content-wrapper">
        <TopNavbar onThemeToggle={onThemeToggle} theme={theme} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
