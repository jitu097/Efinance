// E-Finance API Service - Connects to Backend Server
// Handles all API calls to the backend for transactions, expenses, and investments

// Backend API base URL - using Vite environment variable or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to make API requests with error handling
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// --------------------- TRANSACTION API METHODS ---------------------

// Fetch all transactions for a specific user
export const fetchTransactions = async (userId) => {
  return await apiRequest(`/transactions?userId=${userId}`);
};

// Fetch transactions filtered by month and year for a specific user
export const fetchTransactionsByMonth = async (userId, month, year) => {
  return await apiRequest(`/transactions/month?userId=${userId}&month=${month}&year=${year}`);
};

// Create a new transaction
export const createTransaction = async (transactionData) => {
  return await apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};

// Update an existing transaction
export const updateTransaction = async (transactionId, transactionData) => {
  return await apiRequest(`/transactions/${transactionId}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData),
  });
};

// Delete a transaction
export const deleteTransaction = async (transactionId) => {
  return await apiRequest(`/transactions/${transactionId}`, {
    method: 'DELETE',
  });
};

// --------------------- EXPENSE API METHODS ---------------------

// Fetch all expenses for a specific user
export const fetchExpenses = async (userId) => {
  return await apiRequest(`/expenses?userId=${userId}`);
};

// Fetch expenses filtered by month and year for a specific user
export const fetchExpensesByMonth = async (userId, month, year) => {
  return await apiRequest(`/expenses/month?userId=${userId}&month=${month}&year=${year}`);
};

// Create a new expense
export const createExpense = async (expenseData) => {
  return await apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
};

// Update an existing expense
export const updateExpense = async (expenseId, expenseData) => {
  return await apiRequest(`/expenses/${expenseId}`, {
    method: 'PUT',
    body: JSON.stringify(expenseData),
  });
};

// Delete an expense
export const deleteExpense = async (expenseId) => {
  return await apiRequest(`/expenses/${expenseId}`, {
    method: 'DELETE',
  });
};

// --------------------- INVESTMENT API METHODS ---------------------

// Fetch all investments for a specific user
export const fetchInvestments = async (userId) => {
  return await apiRequest(`/investments?userId=${userId}`);
};

// Fetch investments filtered by month and year for a specific user
export const fetchInvestmentsByMonth = async (userId, month, year) => {
  return await apiRequest(`/investments/month?userId=${userId}&month=${month}&year=${year}`);
};

// Create a new investment
export const createInvestment = async (investmentData) => {
  return await apiRequest('/investments', {
    method: 'POST',
    body: JSON.stringify(investmentData),
  });
};

// Update an existing investment
export const updateInvestment = async (investmentId, investmentData) => {
  return await apiRequest(`/investments/${investmentId}`, {
    method: 'PUT',
    body: JSON.stringify(investmentData),
  });
};

// Delete an investment
export const deleteInvestment = async (investmentId) => {
  return await apiRequest(`/investments/${investmentId}`, {
    method: 'DELETE',
  });
};

// --------------------- HEALTH CHECK ---------------------

// Check if backend server is running
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return await response.json();
  } catch (error) {
    console.error('Server health check failed:', error);
    throw error;
  }
};
