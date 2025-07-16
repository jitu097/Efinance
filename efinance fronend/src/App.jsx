import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div
      className="app-container"
      style={{
        minHeight: "100vh", // Ensure the container takes up at least the full viewport height
      }}
    >
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
             <img src="/pr.png" style={{ height: '140px', marginRight: '6rem' }} />

            <h1>Smart Financial Management</h1> {/* Main headline */}
            <p className="subtitle">Take control of your finances with our powerful tools and insights</p>
            {/* Feature cards grid - highlights key application capabilities */}
            <div className="features">
              {/* Feature 1: Intelligent Tracking */}
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-chart-line"></i> {/* Line chart icon */}
                </div>
                <h3>Intelligent Tracking</h3>
                <p>Real-time monitoring of your expenses and income with smart categorization</p>
                <ul className="feature-list">
                  <li>Automated expense tracking</li>
                  <li>Smart categorization</li>
                  <li>Real-time insights</li>
                </ul>
              </div>
              {/* Feature 2: AI-Powered Insights */}
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-robot"></i> {/* Robot icon for AI */}
                </div>
                <h3>AI-Powered Insights</h3>
                <p>Get personalized financial recommendations and spending patterns analysis</p>
                <ul className="feature-list">
                  <li>Spending pattern analysis</li>
                  <li>Custom recommendations</li>
                  <li>Future predictions</li>
                </ul>
              </div>
              {/* Feature 3: Bank-Grade Security */}
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-shield-alt"></i> {/* Shield icon for security */}
                </div>
                <h3>Bank-Grade Security</h3>
                <p>Your financial data is protected with military-grade encryption</p>
                <ul className="feature-list">
                  <li>End-to-end encryption</li>
                  <li>Secure authentication</li>
                  <li>Regular security audits</li>
                </ul>
              </div>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
