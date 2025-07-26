import React from 'react';
import './LoadingPage.css';

const LoadingPage = () => {
  return (
    <div className="loading-page">
      <div className="loading-container">
        {/* Main Logo/Icon */}
        <div className="loading-logo">
          <div className="logo-icon">💰</div>
          <h1 className="app-name">EFinance</h1>
        </div>
        
        {/* Loading Animation */}
        <div className="loading-animation">
          <div className="spinner"></div>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="loading-text">
          <h2>Loading your financial dashboard...</h2>
          <p>Please wait while we prepare your data</p>
        </div>
        
        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
      
      {/* Background Animation */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>
    </div>
  );
};

export default LoadingPage;