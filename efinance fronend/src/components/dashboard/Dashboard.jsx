import React, { useState, useEffect } from 'react';
// Clerk hooks for authentication and user info
import { useAuth, useUser, RedirectToSignIn } from '@clerk/clerk-react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
// Chart.js and chart components for graphs
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
// Dashboard data fetching services
import { fetchDashboardTransactions, fetchDashboardExpenses, fetchDashboardInvestments } from '../../services/dashboardService';
import Navbar from './Navbar';
import './dashboard.css';

// Register Chart.js components globally
Chart.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend, LineElement, PointElement);

// LiveClock component displays current time and date in the dashboard
const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-timestamp">
      {time.toLocaleTimeString()} 
    </div>
  );
};

// Main Overview component for dashboard
const Overview = ({ name }) => {
  const { user } = useUser();
  // State for transactions, expenses, investments and loading/error
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState({ expenses: [], expenseSummary: { categories: [], amounts: [] } });
  const [investments, setInvestments] = useState({ investments: [], investmentSummary: { labels: [], cumulativeValues: [], investments: [] } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter state for month and year selection
  const today = new Date();
  const [filter, setFilter] = useState({
    month: String(today.getMonth() + 1).padStart(2, '0'),
    year: String(today.getFullYear())
  });

  // Handle filter form changes
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };
  
  // Generate last 10 years for year dropdown
  const yearOptions = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 10; y--) {
    yearOptions.push(y);
  }
  // Colors for expense categories in pie chart
  const expenseCategoryColors = [
    '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899',
    '#06b6d4', '#10b981', '#64748b', '#6366f1'
  ];

  // Fetch dashboard data (transactions, expenses, and investments) when user or filter changes
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch all dashboard data in parallel, but handle errors for each individually
        const [transData, expData, invData] = await Promise.allSettled([
          fetchDashboardTransactions(user.id, filter.month, filter.year),
          fetchDashboardExpenses(user.id, filter.month, filter.year),
          fetchDashboardInvestments(user.id, filter.month, filter.year)
        ]);
        let errorMsg = '';
        if (transData.status === 'fulfilled') {
          setTransactions(transData.value);
        } else {
          setTransactions({ transactionSummary: { totalCredit: 0, totalDebit: 0, total: 0 } });
          errorMsg += 'Failed to load transactions. ';
          console.error('Dashboard transactions error:', transData.reason);
        }
        if (expData.status === 'fulfilled') {
          setExpenses(expData.value);
        } else {
          setExpenses({ expenseSummary: { categories: [], amounts: [] } });
          errorMsg += 'Failed to load expenses. ';
          console.error('Dashboard expenses error:', expData.reason);
        }
        if (invData.status === 'fulfilled') {
          setInvestments(invData.value);
        } else {
          setInvestments({ investmentSummary: { labels: [], cumulativeValues: [], investments: [] } });
          errorMsg += 'Failed to load investments. ';
          console.error('Dashboard investments error:', invData.reason);
        }
        setError(errorMsg);
      } catch (err) {
        // This should only catch unexpected Promise.allSettled errors
        console.error('Unexpected error loading dashboard data:', err);
        setError('Unexpected error loading dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user, filter.month, filter.year]);

  // Transaction Bar Chart - uses actual transaction data
  const TransactionBarChart = () => {
    // Destructure totals from transaction summary, fallback to 0 if missing
    let totalCredit = 0, totalDebit = 0, total = 0;
    if (transactions && transactions.transactionSummary) {
      totalCredit = Number(transactions.transactionSummary.totalCredit) || 0;
      totalDebit = Number(transactions.transactionSummary.totalDebit) || 0;
      total = Number(transactions.transactionSummary.total) || (totalCredit - totalDebit);
    }
    // Prepare data for Bar chart
    const barData = {
      labels: ['Credit', 'Debit', 'Balance'],
      datasets: [
        {
          label: 'Amount (₹)',
          data: [totalCredit, totalDebit, total],
          backgroundColor: ['#22c55e', '#ef4444', '#2563eb'],
          borderRadius: 6,
        }
      ]
    };
    // Chart options for Bar chart
    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { 
          callbacks: {
            label: function(context) {
              return `₹${context.raw?.toLocaleString('en-IN') ?? 0}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      }
    };
    return (
      <div className="chart-container">
        <Bar data={barData} options={barOptions} />
      </div>
    );
  };

  // Expenses Pie Chart - uses real expense data from API
  const ExpensesPieChart = () => {
    // Use real expense data from state instead of sample data
    let categories = [];
    let amounts = [];
    if (expenses.expenseSummary && Array.isArray(expenses.expenseSummary.categories) && Array.isArray(expenses.expenseSummary.amounts)) {
      categories = expenses.expenseSummary.categories;
      amounts = expenses.expenseSummary.amounts;
    }
    // If no expense data, show empty chart message
    if (categories.length === 0 || amounts.length === 0) {
      return (
        <div className="chart-container">
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No expense data available for the selected period
          </div>
        </div>
      );
    }
    // Prepare data for Pie chart
    const pieData = {
      labels: categories,
      datasets: [{
        data: amounts,
        backgroundColor: expenseCategoryColors,
        borderColor: '#ffffff',
        borderWidth: 1,
      }]
    };
    // Chart options for Pie chart
    const pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 12, font: { size: 11 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.raw;
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = Math.round((value / total) * 100);
              return `₹${value.toLocaleString('en-IN')} (${percentage}%)`;
            }
          }
        }
      }
    };
    return (
      <div className="chart-container">
        <Pie data={pieData} options={pieOptions} />
      </div>
    );
  };

  // Investments Line Chart - uses real investment data from API
  const InvestmentsLineChart = () => {
    // Get investment data from state, fallback to empty arrays if missing
    let labels = [], cumulativeValues = [], investmentData = [];
    if (investments && investments.investmentSummary) {
      labels = Array.isArray(investments.investmentSummary.labels) ? investments.investmentSummary.labels : [];
      cumulativeValues = Array.isArray(investments.investmentSummary.cumulativeValues) ? investments.investmentSummary.cumulativeValues : [];
      investmentData = Array.isArray(investments.investmentSummary.investments) ? investments.investmentSummary.investments : [];
    }
    // If no investment data, show empty chart message
    if (labels.length === 0 || cumulativeValues.length === 0) {
      return (
        <div className="chart-container">
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No investment data available for the selected period
          </div>
        </div>
      );
    }
    // Prepare data for Line chart
    const lineData = {
      labels,
      datasets: [{
        label: 'Growth',
        data: cumulativeValues,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      }]
    };
    // Chart options for Line chart with enhanced tooltip
    const lineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              // Get the investment data for this point
              const investment = investmentData[context.dataIndex];
              if (investment && investment.amount !== undefined) {
                return [
                  `Amount: ₹${Number(investment.amount).toLocaleString('en-IN')}`,
                  `Type: ${investment.type || 'Investment'}`,
                  `Total: ₹${context.raw?.toLocaleString('en-IN') ?? 0}`
                ];
              }
              return `₹${context.raw?.toLocaleString('en-IN') ?? 0}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return '₹' + value;
            }
          }
        }
      }
    };
    return (
      <div className="chart-container">
        <Line data={lineData} options={lineOptions} />
      </div>
    );
  };

  // Calculate total balance from transactions for Account Overview
  const totalCredit = transactions?.transactionSummary?.totalCredit || 0;
  const totalDebit = transactions?.transactionSummary?.totalDebit || 0;
  const totalBalance = totalCredit - totalDebit;

  return (
    <>
      {/* Main dashboard container */}
      <div className="dashboard">
        <h2>Welcome, {name} 👋</h2>
        <div className="dashboard-grid">
          {/* Account Overview Card */}
          <div className="dashboard-card">
            <h3>Account Overview  💰 </h3>
            <div className="card-content">
              <i className="fas fa-wallet"></i>
              <p>Total Balance</p>
              {/* Show actual total balance from transaction data */}
              <h4 style={{ color: '#10b981' }}>
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
          </div>
          {/* Expenses Card */}
          <div className="dashboard-card">
            <h3>Expenses 📉</h3>
            <div className="card-content">
              <i className="fas fa-receipt"></i>
              <p>Track your spending</p>
              <div className="card-action">
                <a href="/dashboard/expenses" className="view-all-button">
                  View All Expenses
                </a>
              </div>
            </div>
          </div>
          {/* Investments Card */}
          <div className="dashboard-card">
            <h3>Investments 📈</h3>
            <div className="card-content">
              <i className="fas fa-chart-line"></i>
              <p>Manage your portfolio</p>
              <div className="card-action">
                <a href="/dashboard/investments" className="view-all-button">
                  View All Investments
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts section with filter form */}
      <div className="dashboard-charts-wrapper">
        {/* Month/Year filter form for graphs */}
        <div className="filter-container">
          <form className="filter-form">
            <label>
              Month:
              <select name="month" value={filter.month} onChange={handleFilterChange}>
                {Array.from({ length: 12 }, (_, i) => {
                  const m = String(i + 1).padStart(2, '0');
                  return (
                    <option key={m} value={m}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  );
                })}
              </select>
            </label>
            <label>
              Year:
              <select name="year" value={filter.year} onChange={handleFilterChange}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          </form>
        </div>
        
        {/* Show loading, error, or the charts */}
        {loading ? (
          <div className="charts-loading">
            <p>Loading dashboard data...</p>
          </div>
        ) : error ? (
          <div className="charts-error">
            <p>{error}</p>
          </div>
        ) : (
          <div className="dashboard-charts-section">
            {/* Transaction Summary Bar Chart */}
            <div className="chart-box transaction-chart-box">
              <h3>Transaction Summary 💰</h3>
              <TransactionBarChart />
            </div>
            {/* Expenses Breakdown Pie Chart */}
            <div className="chart-box expenses-chart-box">
              <h3>Expenses Breakdown 📉</h3>
              <ExpensesPieChart />
            </div>
            {/* Investment Growth Line Chart */}
            <div className="chart-box investments-chart-box">
              <h3>Investment Growth 📈</h3>
              <InvestmentsLineChart />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Main Dashboard component with routing and authentication
const Dashboard = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Redirect to home if not signed in
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
    setIsPageLoaded(true);
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded || !isPageLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  // Determine if we are on the overview page
  const isOverview =
    location.pathname === '/dashboard' ||
    location.pathname === '/dashboard/overview';
  let name = '';
  if (user) {
    if (user.firstName) {
      name = user.firstName + (user.lastName ? ` ${user.lastName}` : '');
    } else if (user.primaryEmailAddress) {
      name = user.primaryEmailAddress.emailAddress.split('@')[0];
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Navbar at the top */}
      <Navbar />
      {/* Live clock below navbar */}
      <LiveClock />
      <div className="dashboard-main">
        {/* Render Overview or nested routes */}
        {isOverview ? <Overview name={name} /> : <Outlet />}
      </div>
    </div>
  );
};

export default Dashboard;