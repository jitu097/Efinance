import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import './Navbar.css';

// Logo component for the E-Finance app that appears in the navbar
const NavbarLogo = () => (
  <div className="navbar-logo-left">
    <NavLink to="/dashboard/overview" className="navbar-logo-link">
      <img src="/pr.png" className="navbar-logo-image" alt="E-Finance Logo" />
    </NavLink>
  </div>
);

// Navigation links configuration - defines all routes in the dashboard
const navLinks = [
  { to: '/dashboard/overview', icon: 'fas fa-chart-pie', label: 'Overview' },
  { to: '/dashboard/transactions', icon: 'fas fa-exchange-alt', label: 'Transactions' },
  { to: '/dashboard/expenses', icon: 'fas fa-receipt', label: 'Expenses' },
  { to: '/dashboard/investment', icon: 'fas fa-chart-line', label: 'Investment' },
  { to: '/dashboard/upgrade', icon: 'fas fa-crown', label: 'Upgrade' },
];

// Main Navbar component for the dashboard
const Navbar = () => {
  // State to control mobile drawer visibility
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Handle navigation from mobile drawer and close the drawer after navigation
  const handleNavClick = (to) => {
    setDrawerOpen(false); // Close the drawer
    navigate(to);         // Navigate to the selected route
  };

  return (
    <>
      {/* Main navigation bar - fixed at the top of the viewport */}
      <nav className="dashboard-nav">
        {/* App logo positioned at the left */}
         
        <NavbarLogo />
        
        <div className="navbar-center">
          {/* Hamburger menu button - only visible on mobile screens */}
          <button
            className="navbar-hamburger"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        
        {/* Desktop navigation links */}
        <div className="nav-links">
          {navLinks.map((link) => (
            <NavLink 
              key={link.to} 
              to={link.to} 
              end={link.to === '/dashboard/overview'} // "end" prop ensures exact path matching for overview
            >
              <i className={link.icon}></i> {link.label}
            </NavLink>
          ))}
        </div>
        
        {/* User profile button from Clerk */}
        <div className="user-section">
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>
      
      {/* Mobile navigation drawer - only renders when drawer is open */}
      {drawerOpen && (
        <div 
          className="navbar-drawer-backdrop" 
          onClick={() => setDrawerOpen(false)} // Close drawer when clicking the backdrop
        >
          {/* Drawer content - stopPropagation prevents closing when clicking inside */}
          <div className="navbar-drawer" onClick={e => e.stopPropagation()}>
            {/* Close button for the drawer */}
            <button
              className="drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close navigation"
            >
              &times;
            </button>
            
            {/* Mobile navigation links */}
            <nav className="drawer-links">
              {navLinks.map((link) => (
                <button
                  key={link.to}
                  className="drawer-link-btn"
                  onClick={() => handleNavClick(link.to)}
                >
                  <i className={link.icon}></i> {link.label}
                </button>
              ))}
            </nav>
            
            {/* User profile section at the bottom of drawer */}
            <div className="drawer-user">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;