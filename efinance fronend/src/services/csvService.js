/**
 * CSV Upload and Processing Service
 * Handles parsing CSV files for bank statements and transaction imports
 */

/**
 * Parse CSV data and convert to transaction format
 * @param {Array} csvData - Raw CSV data from react-papaparse
 * @returns {Array} - Array of parsed transactions
 */
export function parseCSVTransactions(csvData) {
  if (!csvData || csvData.length === 0) {
    throw new Error('No data found in CSV file');
  }

  const transactions = [];
  
  // Skip header row and process data rows
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    
    // Skip empty rows
    if (!row || row.length === 0 || !row[0]) continue;
    
    try {
      // Common CSV formats for bank statements:
      // Format 1: Date, Description, Amount, Type
      // Format 2: Date, Description, Debit, Credit
      // Format 3: Date, Description, Amount (negative for debit)
      
      let transaction = {};
      
      // Auto-detect CSV format based on headers
      const headers = csvData[0].map(h => h.toLowerCase().trim());
      
      if (headers.includes('date') && headers.includes('description')) {
        const dateIndex = headers.indexOf('date');
        const descIndex = headers.indexOf('description');
        
        // Format with separate debit/credit columns
        if (headers.includes('debit') && headers.includes('credit')) {
          const debitIndex = headers.indexOf('debit');
          const creditIndex = headers.indexOf('credit');
          
          const debitAmount = parseFloat(row[debitIndex]) || 0;
          const creditAmount = parseFloat(row[creditIndex]) || 0;
          
          transaction = {
            date: formatDate(row[dateIndex]),
            description: row[descIndex]?.trim() || 'Bank Transaction',
            amount: Math.abs(debitAmount > 0 ? debitAmount : creditAmount),
            type: debitAmount > 0 ? 'Debit' : 'Credit'
          };
        }
        // Format with single amount column and type
        else if (headers.includes('amount') && headers.includes('type')) {
          const amountIndex = headers.indexOf('amount');
          const typeIndex = headers.indexOf('type');
          
          transaction = {
            date: formatDate(row[dateIndex]),
            description: row[descIndex]?.trim() || 'Bank Transaction',
            amount: Math.abs(parseFloat(row[amountIndex]) || 0),
            type: row[typeIndex]?.trim() === 'Debit' ? 'Debit' : 'Credit'
          };
        }
        // Format with single amount column (negative = debit)
        else if (headers.includes('amount')) {
          const amountIndex = headers.indexOf('amount');
          const amount = parseFloat(row[amountIndex]) || 0;
          
          transaction = {
            date: formatDate(row[dateIndex]),
            description: row[descIndex]?.trim() || 'Bank Transaction',
            amount: Math.abs(amount),
            type: amount < 0 ? 'Debit' : 'Credit'
          };
        }
        // Fallback format - assume first 4 columns
        else {
          const amount = parseFloat(row[2]) || 0;
          transaction = {
            date: formatDate(row[0]),
            description: row[1]?.trim() || 'Bank Transaction',
            amount: Math.abs(amount),
            type: row[3]?.toLowerCase().includes('debit') || amount < 0 ? 'Debit' : 'Credit'
          };
        }
      }
      // Fallback for non-standard formats
      else {
        const amount = parseFloat(row[2]) || 0;
        transaction = {
          date: formatDate(row[0]),
          description: row[1]?.trim() || 'Imported Transaction',
          amount: Math.abs(amount),
          type: amount < 0 ? 'Debit' : 'Credit'
        };
      }
      
      // Validate transaction data
      if (transaction.date && transaction.amount > 0) {
        transactions.push({
          ...transaction,
          id: `import_${Date.now()}_${i}`, // Temporary ID
          source: 'csv_import'
        });
      }
    } catch (error) {
      console.warn(`Skipping row ${i}: ${error.message}`);
    }
  }
  
  if (transactions.length === 0) {
    throw new Error('No valid transactions found in CSV file');
  }
  
  return transactions;
}

/**
 * Format date string to YYYY-MM-DD format
 * @param {string} dateString - Date in various formats
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  try {
    // Handle various date formats
    let date;
    
    // DD/MM/YYYY or DD-MM-YYYY
    if (dateString.match(/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/)) {
      const parts = dateString.split(/[/-]/);
      // Assume DD/MM/YYYY format for European style
      date = new Date(parts[2], parts[1] - 1, parts[0]);
    }
    // YYYY-MM-DD
    else if (dateString.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      date = new Date(dateString);
    }
    // Other formats
    else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Date parsing error:', error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Validate CSV or PDF file before processing
 * @param {File} file - The uploaded file
 * @returns {boolean} - Whether file is valid
 */
export function validateCSVFile(file) {
  if (!file) {
    throw new Error('No file selected');
  }
  
  const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
  const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  
  if (!isCSV && !isPDF) {
    throw new Error('Please select a CSV or PDF file');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit for PDF files
    throw new Error('File size must be less than 10MB');
  }
  
  return true;
}

/**
 * Process uploaded CSV file and return transactions
 * @param {Object} results - Results from react-papaparse
 * @returns {Array} - Array of parsed transactions
 */
export function processCSVUpload(results) {
  if (results.errors && results.errors.length > 0) {
    console.warn('CSV parsing warnings:', results.errors);
  }
  
  if (!results.data || results.data.length === 0) {
    throw new Error('No data found in CSV file');
  }
  
  return parseCSVTransactions(results.data);
}
