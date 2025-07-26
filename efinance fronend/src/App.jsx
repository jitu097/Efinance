import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="app-container">
      {/* Navigation bar with logo and authentication actions */}
      <nav className="navbar">
        <div className="logo">
          <i className="fas fa-wallet"></i> {/* Wallet icon from Font Awesome */}
          E-Finance
        </div>
        <div className="nav-buttons">
          {/* Show sign-in button only when user is not authenticated */}
          <SignedOut>
            <SignInButton mode="modal" className="sign-in-button" /> {/* Opens Clerk authentication modal */}
          </SignedOut>
          {/* Automatically redirect authenticated users to dashboard */}
          <SignedIn>
            <Navigate to="/dashboard/overview" replace={true} /> {/* React Router redirect */}
          </SignedIn>
        </div>
      </nav>

      {/* Main content area */}
      <main
        className="main-content"
      >
        {/* Content only visible to non-authenticated users */}
        <SignedOut>
          {/* Hero section with application overview */}
          <div className="hero-section">
             <img src="/pr.png" className="hero-logo" />

            <h1>Smart Financial Management</h1> {/* Main headline */}
            <p className="subtitle">Take control of your finances with our powerful tools and insights</p>
            {/* Feature cards grid - highlights key application capabilities */}
            <div className="features">
              {/* Feature 1: Transaction Management */}
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-exchange-alt"></i> {/* Exchange icon for transactions */}
                </div>
                <h3>Transaction Management</h3>
                <p>Track credits, debits with CSV import</p>
                <ul className="feature-list">
                  <li>Credit & Debit tracking</li>
                  <li>CSV bank import</li>
                  <li>Monthly reports</li>
                </ul>
              </div>
              {/* Feature 2: Expense Tracking */}
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-receipt"></i> {/* Receipt icon for expenses */}
                </div>
                <h3>Smart Expense Tracking</h3>
                <p>AI receipt scanning and categorization</p>
                <ul className="feature-list">
                  <li>AI receipt scanning</li>
                  <li>Category breakdown</li>
                  <li>Visual charts</li>
                </ul>
              </div>
              {/* Feature 3: Investment Portfolio */}
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i> {/* Line chart icon for investments */}
                </div>
                <h3>Investment Portfolio</h3>
                <p>Track investments with SIP calculator</p>
                <ul className="feature-list">
                  <li>Multi-asset tracking</li>
                  <li>SIP calculator</li>
                  <li>Growth charts</li>
                </ul>
              </div>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}