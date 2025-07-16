import React, { useState, useEffect } from 'react';
import '../Styles/Investments.css';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
// Import user authentication from Clerk
import { useUser } from '@clerk/clerk-react';
// Import API functions for investment management
import { fetchInvestmentsByMonth, createInvestment, updateInvestment, deleteInvestment } from '../services/api';

// Register Chart.js components that are needed for the investment charts
Chart.register(BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// SIP Calculator Component - Separated component for the SIP (Systematic Investment Plan) calculator functionality
const SIPCalculator = ({ onClose }) => {
  // State for SIP calculator form inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [rateOfReturn, setRateOfReturn] = useState(12);
  const [timeInYears, setTimeInYears] = useState(10);
  
  // State for SIP calculation results
  const [results, setResults] = useState({
    totalInvestment: 0,
    interestEarned: 0,
    maturityValue: 0,
    yearlyBreakdown: []
  });

  // Function to perform SIP calculations based on user inputs
  const calculateSIP = () => {
    // Convert annual rate to monthly rate
    const monthlyRate = rateOfReturn / 12 / 100;
    const totalMonths = timeInYears * 12;
    
    // SIP maturity value formula: P * ((1 + r)^n - 1) / r * (1 + r)
    // Where P = monthly investment, r = monthly rate, n = total months
    const maturityValue = monthlyInvestment * 
      ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    // Calculate total invested amount and returns
    const totalInvestment = monthlyInvestment * totalMonths;
    const interestEarned = maturityValue - totalInvestment;

    // Calculate year-by-year breakdown for detailed view
    const yearlyBreakdown = [];
    for (let year = 1; year <= timeInYears; year++) {
      const months = year * 12;
      const yearValue = monthlyInvestment * 
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
        (1 + monthlyRate);
      
      yearlyBreakdown.push({
        year,
        investment: monthlyInvestment * months,
        value: yearValue,
        interest: yearValue - (monthlyInvestment * months)
      });
    }

    // Update the results state with all calculated values
    setResults({
      totalInvestment,
      interestEarned,
      maturityValue,
      yearlyBreakdown
    });
  };

  // Recalculate SIP results whenever any input changes
  useEffect(() => {
    calculateSIP();
  }, [monthlyInvestment, rateOfReturn, timeInYears]);

  // Prepare chart data for wealth growth visualization
  const chartData = {
    labels: results.yearlyBreakdown.map(item => `Year ${item.year}`),
    datasets: [
      {
        label: 'Total Investment',
        data: results.yearlyBreakdown.map(item => item.investment),
        backgroundColor: 'rgba(12, 74, 110, 0.2)',
        borderColor: '#0c4a6e',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Maturity Value',
        data: results.yearlyBreakdown.map(item => item.value),
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        borderColor: '#06b6d4',
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Chart options for customizing the appearance and behavior
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          // Format tooltip values with Indian Rupee symbol
          label: function(context) {
            return `${context.dataset.label}: ₹${context.raw.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      y: {
        // Format y-axis labels with Indian Rupee symbol
        ticks: {
          callback: (value) => {
            return `₹${value.toLocaleString('en-IN')}`;
          }
        },
        title: {
          display: true,
          text: 'Amount (₹)'
        }
      }
    }
  };

  return (
    <div className="sip-calculator">
      {/* SIP Calculator Header with back button */}
      <div className="sip-header">
        <h2>SIP Calculator</h2>
        <button className="close-sip-btn" onClick={onClose}>
          Back to Investments
        </button>
      </div>

      <div className="sip-content">
        {/* SIP Calculator Form and Result Summary */}
        <div className="sip-form-container">
          <div className="sip-form">
            {/* Monthly Investment Slider */}
            <div className="input-group">
              <label>Monthly Investment (₹)</label>
              <input 
                type="range" 
                min="500" 
                max="100000" 
                step="500" 
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              />
              <div className="range-value">
                <span>₹500</span>
                <input 
                  type="number" 
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  min="500"
                />
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Expected Annual Return Rate Slider */}
            <div className="input-group">
              <label>Expected Annual Return (%)</label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="0.5" 
                value={rateOfReturn}
                onChange={(e) => setRateOfReturn(Number(e.target.value))}
              />
              <div className="range-value">
                <span>1%</span>
                <input 
                  type="number" 
                  value={rateOfReturn}
                  onChange={(e) => setRateOfReturn(Number(e.target.value))}
                  min="1" 
                  max="30"
                  step="0.5"
                />
                <span>30%</span>
              </div>
            </div>

            {/* Investment Time Period Slider */}
            <div className="input-group">
              <label>Time Period (Years)</label>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1" 
                value={timeInYears}
                onChange={(e) => setTimeInYears(Number(e.target.value))}
              />
              <div className="range-value">
                <span>1 Year</span>
                <input 
                  type="number" 
                  value={timeInYears}
                  onChange={(e) => setTimeInYears(Number(e.target.value))}
                  min="1" 
                  max="30"
                />
                <span>30 Years</span>
              </div>
            </div>

            <button className="calculate-btn" onClick={calculateSIP}>Calculate</button>
          </div>

          {/* Result Summary Cards */}
          <div className="sip-results">
            <div className="result-card">
              <h3>Invested Amount</h3>
              <p>₹{results.totalInvestment.toLocaleString('en-IN')}</p>
            </div>
            <div className="result-card">
              <h3>Est. Returns</h3>
              <p>₹{results.interestEarned.toLocaleString('en-IN')}</p>
            </div>
            <div className="result-card total-value">
              <h3>Total Value</h3>
              <p>₹{results.maturityValue.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Wealth Growth Projection Chart */}
        <div className="sip-chart-container">
          <h2>Wealth Growth Projection</h2>
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Year-by-Year Breakdown Table */}
        <div className="sip-breakdown">
          <h2>Year-by-Year Breakdown</h2>
          <div className="breakdown-table-container">
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Invested Amount</th>
                  <th>Est. Returns</th>
                  <th>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {results.yearlyBreakdown.map((item) => (
                  <tr key={item.year}>
                    <td>{item.year}</td>
                    <td>₹{item.investment.toLocaleString('en-IN')}</td>
                    <td>₹{item.interest.toLocaleString('en-IN')}</td>
                    <td>₹{item.value.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Investment Component
const Investment = () => {
  // Get authenticated user information
  const { user } = useUser();
  // State for investment records
  const [investments, setInvestments] = useState([]);
  // Loading state for API operations
  const [loading, setLoading] = useState(false);
  // Error state for handling API failures
  const [error, setError] = useState('');
  
  // Edit state for managing which investment is being edited
  const [editingId, setEditingId] = useState(null);
  
  // State for investment form inputs
  const [form, setForm] = useState({
    name: '',
    amount: '',
    date: '',
    type: 'Stocks'
  });

  // Filter state for month/year selection
  const today = new Date();
  const [filter, setFilter] = useState({
    month: String(today.getMonth() + 1).padStart(2, '0'),
    year: String(today.getFullYear())
  });

  // State to toggle SIP calculator visibility
  const [showSIPCalculator, setShowSIPCalculator] = useState(false);

  // Handle filter dropdowns change
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Handle investment form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Effect hook to fetch investments when filter or user changes
  useEffect(() => {
    const fetchData = async () => {
      // Don't proceed if user is not authenticated
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch investments for the selected month and year
        const data = await fetchInvestmentsByMonth(
          user.id,
          filter.month,
          filter.year
        );
        setInvestments(data);
        setError('');
      } catch (err) {
        console.error('Error fetching investments:', err);
        
        let errorMessage = 'Failed to fetch investments. ';
        if (err.message) {
          if (err.message.includes('fetch')) {
            errorMessage += 'Network connection issue - please check if the backend server is running.';
          } else if (err.message.includes('400') || err.message.includes('401')) {
            errorMessage += 'Authentication error - please try signing out and back in.';
          } else if (err.message.includes('500')) {
            errorMessage += 'Server error - please try again later.';
          } else {
            errorMessage += err.message;
          }
        } else {
          errorMessage += 'Please check your network connection and try again.';
        }
        
        setInvestments([]);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, filter.month, filter.year]); // Re-fetch when these dependencies change

  // Handle form submission to add new investment
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form fields
    if (!form.name || !form.amount || !form.date || !form.type) return;
    
    try {
      // Create new investment through API
      const newInvestment = await createInvestment({
        ...form,
        userId: user.id
      });
      
      // Add the new investment to the state
      setInvestments(prev => [newInvestment, ...prev]);
      // Reset form fields after successful submission
      setForm({ name: '', amount: '', date: '', type: 'Stocks' });
    } catch (err) {
      console.error('Error adding investment:', err);
      setError('Failed to add investment');
    }
  };

  // Handler for deleting an investment
  const handleDelete = async (investmentId) => {
    try {
      // Call backend API to delete investment
      await deleteInvestment(investmentId);
      
      // Remove investment from state after successful deletion
      setInvestments(investments.filter(inv => inv.id !== investmentId));
    } catch (err) {
      console.error('Error deleting investment:', err);
      setError('Failed to delete investment');
    }
  };

  // Handler for starting edit mode
  const handleEdit = (investment) => {
    setEditingId(investment.id);
    setForm({
      name: investment.name,
      amount: investment.amount,
      date: investment.date,
      type: investment.type
    });
  };

  // Handler for saving edited investment
  const handleSaveEdit = async (investmentId) => {
    try {
      // Call backend API to update investment
      await updateInvestment(investmentId, form);
      
      // Reset edit state
      setEditingId(null);
      setForm({ name: '', amount: '', date: '', type: 'Stocks' });
      
      // Refetch data to ensure consistency
      const data = await fetchInvestmentsByMonth(
        user.id,
        filter.month,
        filter.year
      );
      setInvestments(data);
      
    } catch (err) {
      console.error('Error updating investment:', err);
      setError('Failed to update investment');
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', amount: '', date: '', type: 'Stocks' });
  };

  // Filter investments by selected month and year
  const filteredInvestments = investments.filter((inv) => {
    if (!inv.date) return false;
    const d = new Date(inv.date);
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return year === filter.year && month === filter.month;
  });

  // Define colors for different investment types
  const investmentTypeColors = {
    'Stocks': '#22c55e',
    'Bonds': '#ef4444',
    'Mutual Funds': '#2563eb',
    'Real Estate': '#f97316',
    'Other': '#a855f7'
  };

  // Calculate totals by investment type for the graph
  const investmentsByType = {};
  filteredInvestments.forEach(inv => {
    if (!investmentsByType[inv.type]) {
      investmentsByType[inv.type] = 0;
    }
    investmentsByType[inv.type] += parseFloat(inv.amount);
  });

  // Calculate total investment amount
  const totalInvestment = filteredInvestments.reduce(
    (sum, inv) => sum + parseFloat(inv.amount), 0
  );

  // Prepare data for the bar chart
  const graphData = {
    labels: [...Object.keys(investmentsByType), 'Total'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [...Object.values(investmentsByType), totalInvestment],
        backgroundColor: [
          ...Object.keys(investmentsByType).map(type => investmentTypeColors[type] || '#14b8a6'),
          '#000000' // Total bar in black
        ],
        borderRadius: 6,
      }
    ]
  };

  // Bar chart configuration options
  const graphOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '₹' + context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount (₹)' },
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      }
    }
  };

  // Generate year options for the dropdown (last 10 years)
  const yearOptions = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 10; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="investments-layout">
      {/* Conditional rendering - show either SIP Calculator or main investment page */}
      {showSIPCalculator ? (
        <SIPCalculator onClose={() => setShowSIPCalculator(false)} />
      ) : (
        <>
          {/* Left Column - Split into fixed form and scrollable table */}
          <div className="investments-left-column">
            {/* Investment Form Section */}
            <div className="page-container investment-form-container">
              <div className="page-header">
                <h2>Investments</h2>
                <div className="investment-actions">
                  {/* External link to Money Control financial portal */}
                  <a 
                    href="https://www.moneycontrol.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="money-control-btn"
                  >
                    Money Control
                  </a>
                  {/* Button to open SIP calculator */}
                  <button 
                    className="sip-calculator-btn" 
                    onClick={() => setShowSIPCalculator(true)}
                  >
                    SIP Calculator
                  </button>
                </div>
              </div>
              
              <div className="content">
                {/* Form to add new investments */}
                <form className="investment-form" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Investment Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Stocks">Stocks</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Mutual Funds">Mutual Funds</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Other">Other</option>
                  </select>
                  <button type="submit">Add Investment</button>
                </form>
              </div>
            </div>
            
            {/* Scrollable Investment Table */}
            <div className="page-container investments-table-container">
              <h3>Investment Records</h3>
              <div className="investments-list">
                {filteredInvestments.length === 0 ? (
                  <p className="no-investments">No investments yet.</p>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Amount (₹)</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                    </table>
                    <div className="table-body-container">
                      <table>
                        <tbody>
                          {/* Map through filtered investments to render table rows */}
                          {filteredInvestments.map((inv) => (
                            <tr key={inv.id}>
                              {/* Conditional rendering for edit mode */}
                              {editingId === inv.id ? (
                                // Edit mode - show input fields
                                <>
                                  <td>
                                    <input
                                      type="text"
                                      value={form.name}
                                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                                      style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      value={form.amount}
                                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                      style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                                    />
                                  </td>
                                  <td>
                                    <input
                                      type="date"
                                      value={form.date}
                                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                                      style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                                    />
                                  </td>
                                  <td>
                                    <select
                                      value={form.type}
                                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                                      style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                                    >
                                      <option value="Stocks">Stocks</option>
                                      <option value="Bonds">Bonds</option>
                                      <option value="Mutual Funds">Mutual Funds</option>
                                      <option value="Real Estate">Real Estate</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </td>
                                  <td>
                                    <button 
                                      onClick={() => handleSaveEdit(inv.id)}
                                      style={{
                                        color: 'green',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        marginRight: '4px',
                                        background: 'transparent'
                                      }}
                                    >
                                      ✓
                                    </button>
                                    <button 
                                      onClick={handleCancelEdit}
                                      style={{
                                        color: 'red',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        background: 'transparent'
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </>
                              ) : (
                                // View mode - show regular data
                                <>
                                  <td style={{ 
                                    fontWeight: '700',  /* Bold */
                                    color: '#000000'     /* Black */
                                  }}>
                                    {inv.name}
                                  </td>
                                  <td style={{ 
                                    fontWeight: '700',  /* Bold */
                                    color: '#22c55e'    /* Green */
                                  }}>
                                    ₹{parseFloat(inv.amount).toFixed(2)}
                                  </td>
                                  <td style={{ 
                                    fontWeight: '700',  /* Bold */
                                    color: '#000000'    /* Black */
                                  }}>
                                    {inv.date}
                                  </td>
                                  <td style={{ 
                                    color: investmentTypeColors[inv.type] || '#14b8a6', 
                                    fontWeight: '700'  /* Bold */
                                  }}>
                                    {inv.type}
                                  </td>
                                  <td>
                                    <button 
                                      onClick={() => handleEdit(inv)}
                                      style={{
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        marginRight: '4px',
                                        background: 'transparent'
                                      }}
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(inv.id)}
                                      className="delete-btn"
                                      style={{
                                        color: 'white',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        background: 'transparent'
                                      }}
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Filter and Graph */}
          <div className="investments-right-column">
            {/* Month/Year Filter Form */}
            <form className="investments-filter-form">
              <label>
                Month:
                <select
                  name="month"
                  value={filter.month}
                  onChange={handleFilterChange}
                >
                  {/* Generate options for all 12 months */}
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
                <select
                  name="year"
                  value={filter.year}
                  onChange={handleFilterChange}
                >
                  {/* Map through year options */}
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </label>
            </form>
            
            {/* Investment Summary Bar Graph */}
            <div className="investments-graph-container">
              <h3>Investment Summary (₹)</h3>
              <Bar data={graphData} options={graphOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Investment;
