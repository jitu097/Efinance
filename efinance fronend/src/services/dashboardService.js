import { fetchTransactionsByMonth, fetchExpensesByMonth, fetchInvestmentsByMonth } from './api';

/**
 * Fetches and processes data required for all dashboard graphs
 * @param {string} userId - The ID of the current user
 * @param {string} month - Month in format '01'-'12'
 * @param {string} year - Year in format 'YYYY'
 * @returns {Object} Processed transaction data with summaries for different charts
 */
export const fetchDashboardData = async (userId, month, year) => {
  try {
    // Get transactions for the specified month and year
    const transactions = await fetchTransactionsByMonth(userId, month, year);
    
    // Process raw transaction data into chart-friendly format
    const processedData = processTransactionData(transactions);
    
    return processedData;
  } catch (error) {
    // Log and re-throw errors for handling by the component
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Transforms raw transaction data into structured data for dashboard charts
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Object containing formatted data for different dashboard visualizations
 */
export const processTransactionData = (transactions) => {
  // Only process transactions with valid date and amount
  const validTransactions = transactions.filter(txn => txn.date && txn.amount);
  
  // Calculate credit total (sum of all Credit transactions)
  const totalCredit = validTransactions
    .filter(txn => txn.type === 'Credit')
    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  
  // Calculate debit total (sum of all Debit transactions)
  const totalDebit = validTransactions
    .filter(txn => txn.type === 'Debit')
    .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
  
  // Calculate net balance (credit minus debit)
  const total = totalCredit - totalDebit;
  
  // Create a map to track running balance by date
  const dateMap = new Map();
  let runningTotal = 0;
  
  // Sort transactions chronologically by date
  const sortedTransactions = [...validTransactions].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
  
  // Calculate cumulative balance for each date
  sortedTransactions.forEach(txn => {
    const amount = parseFloat(txn.amount);
    // Add for credits, subtract for debits
    runningTotal += txn.type === 'Credit' ? amount : -amount;
    dateMap.set(txn.date, runningTotal);
  });
  
  // Convert date map to sorted arrays for chart display
  const sortedDates = [...dateMap.keys()].sort();
  const balances = sortedDates.map(date => dateMap.get(date));
  
  // Return structured data for different dashboard components
  return {
    // Credit/debit/balance summary for transaction bar chart
    transactionSummary: {
      totalCredit,
      totalDebit,
      total
    },
    // Group debits by category for expenses pie chart
    expensesBreakdown: validTransactions
      .filter(txn => txn.type === 'Debit')
      .reduce((acc, txn) => {
        // Use category if available, otherwise mark as 'Other'
        const category = txn.category || 'Other';
        if (!acc[category]) acc[category] = 0;
        acc[category] += parseFloat(txn.amount);
        return acc;
      }, {}),
    // Format date labels and values for investment growth line chart
    investmentGrowth: {
      labels: sortedDates.map(date => {
        const [year, month, day] = date.split('-');
        return `${day}/${month}`; // Format as DD/MM
      }),
      data: balances
    }
  };
};

/**
 * Fetches transaction data specifically for the dashboard transaction chart
 * @param {string} userId - The ID of the current user
 * @param {string} month - Month in format '01'-'12'
 * @param {string} year - Year in format 'YYYY'
 * @returns {Object} Transaction data and summary for bar chart
 */
export const fetchDashboardTransactions = async (userId, month, year) => {
  try {
    // Fetch raw transaction data for the specified period
    const transactions = await fetchTransactionsByMonth(userId, month, year);
    
    // Calculate totals for the transaction bar chart
    const totalCredit = transactions
      .filter(txn => txn.type === 'Credit')
      .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
      
    const totalDebit = transactions
      .filter(txn => txn.type === 'Debit')
      .reduce((sum, txn) => sum + parseFloat(txn.amount), 0);
      
    const total = totalCredit - totalDebit;
    
    // Return both raw transactions and calculated summary
    return { 
      transactions,
      transactionSummary: { totalCredit, totalDebit, total } 
    };
  } catch (error) {
    console.error('Error fetching dashboard transaction data:', error);
    throw error;
  }
};

/**
 * Fetches expense data for the dashboard pie chart
 * @param {string} userId - The ID of the current user
 * @param {string} month - Month in format '01'-'12'
 * @param {string} year - Year in format 'YYYY' 
 * @returns {Object} Expense data and category summary for pie chart
 */
export const fetchDashboardExpenses = async (userId, month, year) => {
  try {
    // Fetch expense data from localStorage API
    const expenses = await fetchExpensesByMonth(userId, month, year);
    
    // Process expenses into category-based format for pie chart
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += parseFloat(expense.amount);
    });
    
    // Convert category map to arrays for chart consumption
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    return {
      expenses,
      expenseSummary: { categories, amounts }
    };
  } catch (error) {
    console.error('Error fetching dashboard expense data:', error);
    
    // Instead of throwing error, return empty data structure for graceful UI handling
    return {
      expenses: [],
      expenseSummary: { categories: [], amounts: [] }
    };
  }
};

/**
 * Fetches investment data for the dashboard investment growth chart
 * @param {string} userId - The ID of the current user
 * @param {string} month - Month in format '01'-'12'
 * @param {string} year - Year in format 'YYYY'
 * @returns {Object} Investment data and growth summary for line chart
 */
export const fetchDashboardInvestments = async (userId, month, year) => {
  try {
    // Fetch investment data from localStorage API
    const investments = await fetchInvestmentsByMonth(userId, month, year);
    
    // Sort investments by date to calculate cumulative growth
    const sortedInvestments = [...investments].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    
    // Calculate cumulative values for growth chart
    let runningTotal = 0;
    const processedInvestments = sortedInvestments.map(inv => {
      runningTotal += parseFloat(inv.amount);
      return {
        ...inv,
        cumulativeValue: runningTotal
      };
    });
    
    // Prepare chart data
    const chartData = {
      labels: processedInvestments.map(inv => {
        const [, month, day] = inv.date.split('-');
        return `${day}/${month}`;
      }),
      cumulativeValues: processedInvestments.map(inv => inv.cumulativeValue),
      investments: processedInvestments // Include full investment data for tooltips
    };
    
    return {
      investments,
      investmentSummary: chartData
    };
  } catch (error) {
    console.error('Error fetching dashboard investment data:', error);
    
    // Return empty data structure for graceful UI handling
    return {
      investments: [],
      investmentSummary: { 
        labels: [], 
        cumulativeValues: [], 
        investments: [] 
      }
    };
  }
};
