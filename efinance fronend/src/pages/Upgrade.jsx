import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import '../Styles/Upgrade.css';

const Upgrade = () => {
  const { user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mock user subscription status - in real app, this would come from your backend
  const [isProUser, setIsProUser] = useState(false);

  const plans = {
    monthly: {
      price: 100,
      period: 'month'
    },
    yearly: {
      price: 1000,
      period: 'year'
    }
  };

  const proFeatures = [
    {
      icon: '📸',
      title: 'Receipt Scanner',
      description: 'Scan receipts with your camera to automatically add expenses',
      available: isProUser
    },
    {
      icon: '📊',
      title: 'CSV Import/Export',
      description: 'Import transactions from CSV files and export your data',
      available: isProUser
    }
  ];

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    try {
      // Create Razorpay order
      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay key
        amount: plans[selectedPlan].price * 100, // Amount in paise
        currency: 'INR',
        name: 'E-Finance Pro',
        description: `E-Finance Pro - ${selectedPlan} subscription`,
        handler: function (response) {
          // Payment successful
          console.log('Payment successful:', response);
          setIsProUser(true);
          alert('🎉 Payment successful! You are now a Pro user. Enjoy your premium features!');
          setIsProcessing(false);
        },
        prefill: {
          name: user?.firstName + ' ' + user?.lastName || '',
          email: user?.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#70c2dbff'
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="page-container">
      <div className="upgrade-content">
        {isProUser && (
          <div className="pro-status-banner">
            <i className="fas fa-crown"></i>
            <span>You are a Pro user! Enjoy all premium features.</span>
          </div>
        )}

        <div className="upgrade-header">
          <h2>Upgrade to E-Finance Pro</h2>
          <p>Unlock powerful features to manage your finances better</p>
        </div>

        <div className="pricing-section">
          <div className="plan-selector">
            <div className="plan-toggle">
              <button 
                className={selectedPlan === 'monthly' ? 'active' : ''}
                onClick={() => setSelectedPlan('monthly')}
              >
                Monthly
              </button>
              <button 
                className={selectedPlan === 'yearly' ? 'active' : ''}
                onClick={() => setSelectedPlan('yearly')}
              >
                Yearly
              </button>
            </div>

            <div className="pricing-card">
              <div className="price-display">
                <span className="currency">₹</span>
                <span className="amount">{plans[selectedPlan].price}</span>
                <span className="period">/{plans[selectedPlan].period}</span>
              </div>
              
              {!isProUser ? (
                <button 
                  className="upgrade-button" 
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-crown"></i>
                      Upgrade to Pro
                    </>
                  )}
                </button>
              ) : (
                <button className="current-plan-button" disabled>
                  <i className="fas fa-check"></i>
                  Current Plan
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="features-section">
          <h3>Pro Features</h3>
          <div className="features-grid">
            {proFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${feature.available ? 'available' : 'locked'}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
                <div className="feature-status">
                  {feature.available ? (
                    <span className="status-available">
                      <i className="fas fa-check"></i>
                      Available
                    </span>
                  ) : (
                    <span className="status-locked">
                      <i className="fas fa-lock"></i>
                      Pro Only
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="payment-info">
          <div className="payment-card">
            <i className="fas fa-shield-alt"></i>
            <h4>Secure Payment with Razorpay</h4>
            <p>Your payment is secured with industry-standard encryption</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;