import React, { useState, useEffect } from 'react';
import '../Styles/Expenses.css'; // Import specific expenses styles
import { Pie } from 'react-chartjs-2'; // Changed from Bar to Pie
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'; // Changed imports for pie chart
// Import user authentication from Clerk
import { useUser } from '@clerk/clerk-react';
// Import API functions for expense management
import { fetchExpensesByMonth, createExpense, updateExpense, deleteExpense } from '../services/api';
// Import receipt scanning functionality
import { scanReceipt, validateReceiptFile } from '../services/receiptService';

// Register required Chart.js components for pie charts
Chart.register(ArcElement, Tooltip, Legend); 

const Expenses = () => {
  // Get authenticated user information
  const { user } = useUser();
  // State for expenses array to store all expense records
  const [expenses, setExpenses] = useState([]);
  // Loading state for API operations
  const [loading, setLoading] = useState(false);
  // Error state for handling API failures
  const [error, setError] = useState('');
  
  // Edit state for managing which expense is being edited
  const [editingId, setEditingId] = useState(null);
  
  // Receipt scanning states
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanSuccess, setScanSuccess] = useState('');
  
  // State for form input fields with category defaulting to Utilities
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    category: 'Utilities' // Default category changed to Utilities
  });

  // Get current month and year for default filter values
  const today = new Date();
  const [filter, setFilter] = useState({
    month: String(today.getMonth() + 1).padStart(2, '0'),
    year: String(today.getFullYear())
  });

  // Update filter when month or year selection changes
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Effect hook to fetch expenses when filter or user changes
  useEffect(() => {
    const fetchData = async () => {
      // Don't proceed if user is not authenticated
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch expenses for the selected month and year
        const data = await fetchExpensesByMonth(
          user.id,
          filter.month,
          filter.year
        );
        setExpenses(data);
        setError('');
      } catch (err) {
        console.error('Error fetching expenses:', err);
        
        let errorMessage = 'Failed to fetch expenses. ';
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
        
        setExpenses([]);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, filter.month, filter.year]); // Re-fetch when these dependencies change

  // Handle form submission to add new expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form fields before adding expense
    if (!form.description || !form.amount || !form.date || !form.category) return;
    
    try {
      // Create new expense through API
      const newExpense = await createExpense({
        ...form,
        userId: user.id
      });
      
      // Add the new expense to the state
      setExpenses(prev => [newExpense, ...prev]);
      // Reset form fields after successful submission
      setForm({ description: '', amount: '', date: '', category: 'Utilities' });
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('Failed to add expense');
    }
  };

  // Handle delete expense
  const handleDelete = async (expenseId) => {
    try {
      // Call backend API to delete expense
      await deleteExpense(expenseId);
      
      // Remove expense from state after successful deletion
      setExpenses(expenses.filter(exp => exp.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    }
  };

  // Handler for starting edit mode
  const handleEdit = (expense) => {
    setEditingId(expense.id);
    setForm({
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      category: expense.category
    });
  };

  // Handler for saving edited expense
  const handleSaveEdit = async (expenseId) => {
    try {
      // Call backend API to update expense
      await updateExpense(expenseId, form);
      
      // Reset edit state
      setEditingId(null);
      setForm({ description: '', amount: '', date: '', category: 'Utilities' });
      
      // Refetch data to ensure consistency
      const data = await fetchExpensesByMonth(
        user.id,
        filter.month,
        filter.year
      );
      setExpenses(data);
      
    } catch (err) {
      console.error('Error updating expense:', err);
      setError('Failed to update expense');
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ description: '', amount: '', date: '', category: 'Utilities' });
  };

  // Handle receipt file selection and scanning
  const handleReceiptScan = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Validate file
      validateReceiptFile(file);
      
      setIsScanning(true);
      setScanError('');
      setScanSuccess('');

      // Scan the receipt
      const scannedData = await scanReceipt(file);
      
      // Update form with scanned data
      setForm({
        description: scannedData.description,
        amount: scannedData.amount.toString(),
        date: scannedData.date,
        category: scannedData.category
      });

      setScanSuccess(`Receipt scanned successfully! Found: ${scannedData.description} - ₹${scannedData.amount}`);
      
    } catch (error) {
      console.error('Receipt scanning error:', error);
      setScanError(error.message);
    } finally {
      setIsScanning(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  // Clear scan messages after 5 seconds
  useEffect(() => {
    if (scanError || scanSuccess) {
      const timer = setTimeout(() => {
        setScanError('');
        setScanSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [scanError, scanSuccess]);

  // Filter expenses by selected month and year
  const filteredExpenses = expenses.filter((exp) => {
    if (!exp.date) return false;
    const d = new Date(exp.date);
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return year === filter.year && month === filter.month;
  });

  // Calculate total expenses from filtered data
  const expensesByCategory = {};
  filteredExpenses.forEach(exp => {
    if (!expensesByCategory[exp.category]) {
      expensesByCategory[exp.category] = 0;
    }
    expensesByCategory[exp.category] += parseFloat(exp.amount);
  });

  // Calculate total expense amount across all categories
  const totalExpense = filteredExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount), 0
  );

  // Color mapping for different expense categories
  const categoryColors = {
    'Food': '#ef4444',
    'Transport': '#f97316',
    'Housing': '#eab308',
    'Utilities': '#84cc16',
    'Entertainment': '#14b8a6',
    'Healthcare': '#0ea5e9',
    'Other': '#6366f1'
  };
  
  // Prepare data for pie chart based on expense categories
  const categories = Object.keys(expensesByCategory);
  const amounts = Object.values(expensesByCategory);
  
  const graphData = {
    labels: categories.length ? categories : ['No Data'],
    datasets: [
      {
        data: amounts.length ? amounts : [0],
        backgroundColor: categories.map(category => categoryColors[category] || '#a855f7'),
        borderWidth: 1,
        hoverOffset: 4
      }
    ]
  };

  // Configuration options for pie chart
  const graphOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'right',
        labels: {
          font: {
            size: 12
          },
          padding: 20
        }
      },
      tooltip: { 
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `₹${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Generate options for year dropdown (last 10 years)
  const yearOptions = [];
  for (let y = today.getFullYear(); y >= today.getFullYear() - 10; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="transaction-layout">
      {/* Left Column - Split into fixed form and scrollable table */}
      <div className="transaction-left-column">
        {/* Fixed Expense Form */}
        <div className="page-container transaction-form-container">
          <div className="page-header">
            <h2>Expenses</h2>
          </div>
          <div className="content">
            {/* Receipt Scanner Section */}
            <div className="receipt-scanner-section" style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              background: 'rgba(37, 99, 235, 0.05)',
              border: '2px dashed #2563eb',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#2563eb', marginBottom: '0.5rem', fontSize: '1rem' }}>
                📱 Scan Receipt with AI
              </h4>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptScan}
                disabled={isScanning}
                style={{
                  marginBottom: '0.5rem',
                  padding: '0.5rem',
                  border: '1px solid #2563eb',
                  borderRadius: '0.25rem',
                  width: '100%'
                }}
              />
              {isScanning && (
                <div style={{ color: '#2563eb', fontSize: '0.9rem' }}>
                  🔄 Scanning receipt with AI...
                </div>
              )}
              {scanSuccess && (
                <div style={{ 
                  color: '#10b981', 
                  fontSize: '0.9rem', 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '0.25rem'
                }}>
                  ✅ {scanSuccess}
                </div>
              )}
              {scanError && (
                <div style={{ 
                  color: '#ef4444', 
                  fontSize: '0.9rem', 
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '0.25rem'
                }}>
                  ❌ {scanError}
                </div>
              )}
            </div>
            
            <form className="transaction-form" onSubmit={handleSubmit}>
              {/* Description input */}
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
              />
              {/* Amount input */}
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
              {/* Date picker */}
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
              {/* Category dropdown with custom styling */}
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                style={{
                  fontWeight: '700',
                  backgroundColor: 'transparent', /* Transparent background */
                  color: 'black',
                  border: '2px solid #7c3aed',
                  padding: '0.9rem 1.2rem',
                  boxShadow: '0 4px 10px rgba(124, 58, 237, 0.3)',
                  letterSpacing: '0.03em'
                }}
              >
                {/* Category options with individual colors */}
                <option value="Food" style={{backgroundColor: '#ef4444', color: 'white', padding: '10px'}}>Food</option>
                <option value="Transport" style={{backgroundColor: '#f97316', color: 'white', padding: '10px'}}>Transport</option>
                <option value="Housing" style={{backgroundColor: '#eab308', color: 'white', padding: '10px'}}>Housing</option>
                <option value="Utilities" style={{backgroundColor: '#84cc16', color: 'white', padding: '10px'}}>Utilities</option>
                <option value="Entertainment" style={{backgroundColor: '#14b8a6', color: 'white', padding: '10px'}}>Entertainment</option>
                <option value="Healthcare" style={{backgroundColor: '#0ea5e9', color: 'white', padding: '10px'}}>Healthcare</option>
                <option value="Other" style={{backgroundColor: '#6366f1', color: 'white', padding: '10px'}}>Other</option>
              </select>
              {/* Submit button */}
              <button type="submit">Add Expense</button>
            </form>
          </div>
        </div>
        
        {/* Scrollable Expense Table */}
        <div className="page-container transactions-table-container">
          <h3>Expense Records</h3>
          <div className="transactions-list">
            {filteredExpenses.length === 0 ? (
              <p className="no-transactions">No expenses yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount (₹)</th>
                      <th>Date</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                </table>
                <div className="table-body-container">
                  <table>
                    <tbody>
                      {/* Map through filtered expenses to create table rows */}
                      {filteredExpenses.map((exp) => (
                        <tr key={exp.id}>
                          {/* Conditional rendering for edit mode */}
                          {editingId === exp.id ? (
                            // Edit mode - show input fields
                            <>
                              <td>
                                <input
                                  type="text"
                                  value={form.description}
                                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                                  value={form.category}
                                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                                  style={{ width: '100%', padding: '4px', border: '1px solid #ccc' }}
                                >
                                  <option value="Food">Food</option>
                                  <option value="Transport">Transport</option>
                                  <option value="Housing">Housing</option>
                                  <option value="Utilities">Utilities</option>
                                  <option value="Entertainment">Entertainment</option>
                                  <option value="Healthcare">Healthcare</option>
                                  <option value="Other">Other</option>
                                </select>
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleSaveEdit(exp.id)}
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
                              <td>{exp.description}</td>
                              <td className="debit-amount">
                                <span>₹{parseFloat(exp.amount).toFixed(2)}</span>
                              </td>
                              <td>{exp.date}</td>
                              <td style={{ 
                                color: categoryColors[exp.category] || '#a855f7', 
                                fontWeight: '600'
                              }}>
                                {exp.category}
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleEdit(exp)}
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
                                  onClick={() => handleDelete(exp.id)}
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
      <div className="transaction-right-column">
        {/* Month and Year Filter Form */}
        <form className="filter-form">
          <label>
            Month:
            <select name="month" value={filter.month} onChange={handleFilterChange}>
              {/* Generate options for all months */}
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
              {/* Map through year options */}
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </form>
        
        {/* Pie Chart for Expense Breakdown */}
        <div className="transactions-graph-container">
          <h3>Expense Breakdown (₹{totalExpense.toFixed(2)})</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Pie data={graphData} options={graphOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
