import React, { useState, useEffect } from 'react';
import '../Styles/Transaction.css';
// Import Chart.js components for data visualization
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
// Import user authentication from Clerk
import { useUser } from '@clerk/clerk-react';
// Import API functions for transaction management
import { fetchTransactionsByMonth, createTransaction, updateTransaction, deleteTransaction } from '../services/api';
// Import CSV upload functionality
import UploadButton from '../components/UploadButton';
import { processCSVUpload, validateCSVFile } from '../services/csvService';

// Register necessary Chart.js components for bar chart functionality
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Transactions = () => {
  // Get authenticated user information
  const { user } = useUser();
  // State for transaction data
  const [transactions, setTransactions] = useState([]);
  // Loading state for API operations
  const [loading, setLoading] = useState(false);
  // Error state for handling API failures
  const [error, setError] = useState('');
  // Edit state for managing which transaction is being edited
  const [editingId, setEditingId] = useState(null);
  
  // CSV upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  // Form state for new transaction inputs
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: '',
    type: 'Credit' // Default transaction type is Credit
  });

  // Initialize date filter with current month and year
  const today = new Date();
  const [filter, setFilter] = useState({
    month: String(today.getMonth() + 1).padStart(2, '0'), // Format: 01, 02, etc.
    year: String(today.getFullYear())
  });

  // Handler for month/year filter changes
  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  // Handler for form input field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Effect hook to fetch transactions when filter or user changes
  useEffect(() => {
    const fetchData = async () => {
      // Don't proceed if user is not authenticated
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch transactions for the selected month and year
        const data = await fetchTransactionsByMonth(
          user.id,
          filter.month,
          filter.year
        );
        setTransactions(data);
        setError('');
      } catch (err) {
        console.error('Error fetching transactions:', err);
        
        let errorMessage = 'Failed to fetch transactions. ';
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
        
        setTransactions([]); // Clear transactions to prevent UI breakage
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, filter.month, filter.year]); // Re-fetch when these dependencies change

  // Handler for form submission to create new transaction
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate form fields before submission
    if (!form.description || !form.amount || !form.date || !form.type) return;
    
    try {
      // Create new transaction through API
      const newTransaction = await createTransaction({
        ...form,
        userId: user.id
      });
      
      // Add the new transaction to the state
      setTransactions(prev => [newTransaction, ...prev]);
      // Reset form fields after successful submission
      setForm({ description: '', amount: '', date: '', type: 'Credit' });
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction');
    }
  };

  // Handler for deleting a transaction
  const handleDelete = async (transactionId) => {
    try {
      // Call backend API to delete transaction
      await deleteTransaction(transactionId);
      
      // Remove transaction from state after successful deletion
      setTransactions(prev => prev.filter(txn => txn._id !== transactionId));
      
      // Display success message
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction: ' + (err.message || 'Unknown error'));
    }
  };

  // Handler for starting edit mode
  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      type: transaction.type
    });
  };

  // Handler for saving edited transaction
  const handleSaveEdit = async (transactionId) => {
    try {
      // Call backend API to update transaction
      await updateTransaction(transactionId, form);
      
      // Reset edit state
      setEditingId(null);
      setForm({ description: '', amount: '', date: '', type: 'Credit' });
      
      // Refetch data to ensure consistency
      const data = await fetchTransactionsByMonth(
        user.id,
        filter.month,
        filter.year
      );
      setTransactions(data);
      
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError('Failed to update transaction');
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ description: '', amount: '', date: '', type: 'Credit' });
  };

  // Handle CSV file upload
  const handleCSVUpload = async (results) => {
    try {
      setIsUploading(true);
      setUploadError('');
      setUploadSuccess('');

      // Process CSV data
      const importedTransactions = processCSVUpload(results);
      
      // Add imported transactions to state
      const transactionsWithUserId = importedTransactions.map(txn => ({
        ...txn,
        userId: user.id
        // MongoDB will generate _id when saved
      }));

      // Batch create transactions (you might want to add this to your API)
      for (const transaction of transactionsWithUserId) {
        try {
          await createTransaction(transaction);
        } catch (err) {
          console.warn('Failed to save transaction:', transaction.description);
        }
      }

      // Add to current state
      setTransactions(prev => [...transactionsWithUserId, ...prev]);
      
      setUploadSuccess(`Successfully imported ${importedTransactions.length} transactions!`);
      
      // Refresh data to ensure consistency
      setTimeout(async () => {
        try {
          const data = await fetchTransactionsByMonth(
            user.id,
            filter.month,
            filter.year
          );
          setTransactions(data);
        } catch (err) {
          console.error('Error refreshing data:', err);
        }
      }, 1000);

    } catch (error) {
      console.error('CSV upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Clear upload messages after 5 seconds
  useEffect(() => {
    if (uploadError || uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadError('');
        setUploadSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError, uploadSuccess]);

  // Filter transactions based on selected month and year
  const filteredTransactions = transactions.filter((txn) => {
    if (!txn.date) return false;
    const d = new Date(txn.date);
    const year = d.getFullYear().toString();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return year === filter.year && month === filter.month;
  });

  // Calculate total credits (income)
  const totalCredit = filteredTransactions
    .filter(txn => txn.type === 'Credit')
    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  
  // Calculate total debits (expenses)  
  const totalDebit = filteredTransactions
    .filter(txn => txn.type === 'Debit')
    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  
  // Calculate net balance  
  const total = totalCredit - totalDebit;

  // Prepare data for the Bar chart visualization
  const graphData = {
    labels: ['Credit', 'Debit', 'Total'],
    datasets: [
      {
        label: 'Amount (₹)',
        data: [totalCredit, totalDebit, total],
        backgroundColor: ['#22c55e', '#ef4444', '#2563eb'], // Green for credit, red for debit, blue for balance
        borderRadius: 6, // Rounded bar corners for modern look
      }
    ]
  };

  // Configuration options for the Bar chart
  const graphOptions = {
    responsive: true,
    plugins: {
      legend: { display: false }, // Hide legend for cleaner look
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: {
          // Format tooltip values with Rupee symbol
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
          // Format y-axis values with Rupee symbol
          callback: function(value) {
            return '₹' + value;
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
      {/* Display error message if any */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Left Column - Contains transaction form and transaction list */}
      <div className="transaction-left-column">
        {/* Transaction Form Card */}
        <div className="page-container transaction-form-container">
          <div className="page-header">
            <h2>Transactions</h2>
          </div>
          <div className="content">
            {/* CSV Upload Section */}
            <div className="csv-upload-section">
              <h4 className="csv-upload-title">
                📊 Import Bank Statement (CSV/PDF)
              </h4>
              <p className="csv-upload-description">
                Upload your bank statement CSV or PDF file. Supports columns: Date, Description, Amount, Type
              </p>
              
              <UploadButton 
                onUpload={handleCSVUpload}
                isUploading={isUploading}
              />
              
              {uploadSuccess && (
                <div className="upload-success-message">
                  ✅ {uploadSuccess}
                </div>
              )}
              
              {uploadError && (
                <div className="upload-error-message">
                  ❌ {uploadError}
                </div>
              )}
            </div>
            
            {/* Form for adding new transactions */}
            <form className="transaction-form" onSubmit={handleSubmit}>
              {/* Description field */}
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                required
              />
              {/* Amount field with decimal support */}
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                min="0"
                step="0.01" // Allow decimals for precise amounts
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
              {/* Transaction type selector */}
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </select>
              {/* Submit button */}
              <button type="submit">Add Transaction</button>
            </form>
          </div>
        </div>
        
        {/* Transaction Records Card with scrollable table */}
        <div className="page-container transactions-table-container">
          <h3>Transaction Records</h3>
          <div className="transactions-list">
            {/* Conditional rendering based on loading/data state */}
            {loading ? (
              <p className="loading-message">Loading transactions...</p>
            ) : filteredTransactions.length === 0 ? (
              <p className="no-transactions">No transactions yet.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount (₹)</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Map through filtered transactions to generate table rows */}
                    {filteredTransactions.map((txn) => (
                      <tr key={txn._id}>
                        {/* Conditional rendering for edit mode */}
                        {editingId === txn._id ? (
                          // Edit mode - show input fields
                          <>
                            <td>
                              <input
                                type="text"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                className="table-edit-input"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                value={form.amount}
                                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                className="table-edit-input"
                              />
                            </td>
                            <td>
                              <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                className="table-edit-input"
                              />
                            </td>
                              <td>
                                <select
                                  value={form.type}
                                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                                  className="table-edit-select"
                                >
                                  <option value="Credit">Credit</option>
                                  <option value="Debit">Debit</option>
                                </select>
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleSaveEdit(txn._id)}
                                  className="table-save-btn"
                                >
                                  ✓
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  className="table-cancel-btn"
                                >
                                  ✕
                                </button>
                              </td>
                            </>
                          ) : (
                            // View mode - show regular data
                            <>
                              <td>{txn.description}</td>
                              {/* Apply different styles for credit and debit amounts */}
                              <td className={txn.type === 'Credit' ? 'credit-amount' : 'debit-amount'}>
                                {txn.type === 'Credit'
                                  ? <span>+{parseFloat(txn.amount).toFixed(2)}</span>
                                  : <span>-{parseFloat(txn.amount).toFixed(2)}</span>
                                }
                              </td>
                              <td>{new Date(txn.date).toLocaleDateString('en-GB', { 
                                day: 'numeric',
                                month: 'long', 
                                year: 'numeric' 
                              })}</td>
                              {/* Apply different styles for transaction types */}
                              <td className={txn.type === 'Credit' ? 'credit-type' : 'debit-type'}>
                                {txn.type}
                              </td>
                              <td>
                                <button 
                                  onClick={() => handleEdit(txn)}
                                  className="table-edit-btn"
                                >
                                  ✎
                                </button>
                                <button 
                                  onClick={() => handleDelete(txn._id)}
                                  className="delete-btn table-delete-btn"
                                >
                                  ❌
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Column - Contains filter controls and summary chart */}
      <div className="transaction-right-column">
        {/* Month and Year Filter Form */}
        <form className="filter-form">
          <label>
            Month:
            <select name="month" value={filter.month} onChange={handleFilterChange}>
              {/* Generate dropdown options for all 12 months */}
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
              {/* Generate dropdown options for the last 10 years */}
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
        </form>
        
        {/* Transaction Summary Bar Chart */}
        <div className="transactions-graph-container">
          <h3>Transaction Summary (₹)</h3>
          <Bar data={graphData} options={graphOptions} />
        </div>
      </div>
    </div>
  );
};

export default Transactions;