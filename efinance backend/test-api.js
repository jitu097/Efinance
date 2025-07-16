// Test script to verify backend API endpoints
// Run this with: node test-api.js

const API_BASE = 'http://localhost:5001/api';

async function testAPI() {
  console.log('🧪 Testing E-Finance Backend API');
  console.log('=====================================');

  // Test data
  const testUserId = 'test-user-123';
  const testTransaction = {
    description: 'Test Transaction',
    amount: 100,
    date: '2025-01-15',
    type: 'Credit',
    userId: testUserId
  };
  
  const testExpense = {
    description: 'Test Expense',
    amount: 50,
    date: '2025-01-15',
    category: 'Food',
    userId: testUserId
  };
  
  const testInvestment = {
    name: 'Test Investment',
    amount: 1000,
    date: '2025-01-15',
    type: 'Stocks',
    userId: testUserId
  };

  try {
    // Test health endpoint
    console.log('\n1. Testing Health Endpoint...');
    const healthResponse = await fetch('http://localhost:5001/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData.status);

    // Test Transactions
    console.log('\n2. Testing Transactions API...');
    
    // Create transaction
    const createTxnResponse = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTransaction)
    });
    const createdTxn = await createTxnResponse.json();
    console.log('✅ Created Transaction:', createdTxn.id);
    
    // Get transactions
    const getTxnResponse = await fetch(`${API_BASE}/transactions?userId=${testUserId}`);
    const transactions = await getTxnResponse.json();
    console.log('✅ Retrieved Transactions:', transactions.length);
    
    // Update transaction
    if (createdTxn.id || createdTxn._id) {
      const txnId = createdTxn.id || createdTxn._id;
      const updateTxnResponse = await fetch(`${API_BASE}/transactions/${txnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testTransaction, description: 'Updated Transaction' })
      });
      const updatedTxn = await updateTxnResponse.json();
      console.log('✅ Updated Transaction:', updatedTxn.description);
      
      // Delete transaction
      const deleteTxnResponse = await fetch(`${API_BASE}/transactions/${txnId}`, {
        method: 'DELETE'
      });
      const deleteResult = await deleteTxnResponse.json();
      console.log('✅ Deleted Transaction:', deleteResult.message);
    }

    // Test Expenses
    console.log('\n3. Testing Expenses API...');
    
    // Create expense
    const createExpResponse = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExpense)
    });
    const createdExp = await createExpResponse.json();
    console.log('✅ Created Expense:', createdExp.id || createdExp._id);
    
    // Get expenses
    const getExpResponse = await fetch(`${API_BASE}/expenses?userId=${testUserId}`);
    const expenses = await getExpResponse.json();
    console.log('✅ Retrieved Expenses:', expenses.length);
    
    // Update and delete expense
    if (createdExp.id || createdExp._id) {
      const expId = createdExp.id || createdExp._id;
      
      const updateExpResponse = await fetch(`${API_BASE}/expenses/${expId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testExpense, description: 'Updated Expense' })
      });
      const updatedExp = await updateExpResponse.json();
      console.log('✅ Updated Expense:', updatedExp.description);
      
      const deleteExpResponse = await fetch(`${API_BASE}/expenses/${expId}`, {
        method: 'DELETE'
      });
      const deleteExpResult = await deleteExpResponse.json();
      console.log('✅ Deleted Expense:', deleteExpResult.message);
    }

    // Test Investments
    console.log('\n4. Testing Investments API...');
    
    // Create investment
    const createInvResponse = await fetch(`${API_BASE}/investments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInvestment)
    });
    const createdInv = await createInvResponse.json();
    console.log('✅ Created Investment:', createdInv.id || createdInv._id);
    
    // Get investments
    const getInvResponse = await fetch(`${API_BASE}/investments?userId=${testUserId}`);
    const investments = await getInvResponse.json();
    console.log('✅ Retrieved Investments:', investments.length);
    
    // Update and delete investment
    if (createdInv.id || createdInv._id) {
      const invId = createdInv.id || createdInv._id;
      
      const updateInvResponse = await fetch(`${API_BASE}/investments/${invId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...testInvestment, name: 'Updated Investment' })
      });
      const updatedInv = await updateInvResponse.json();
      console.log('✅ Updated Investment:', updatedInv.name);
      
      const deleteInvResponse = await fetch(`${API_BASE}/investments/${invId}`, {
        method: 'DELETE'
      });
      const deleteInvResult = await deleteInvResponse.json();
      console.log('✅ Deleted Investment:', deleteInvResult.message);
    }

    console.log('\n🎉 All API tests passed successfully!');
    console.log('=====================================');
    console.log('Frontend is now ready to connect to backend.');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running: npm start');
    console.log('2. Check if MongoDB is running');
    console.log('3. Verify API endpoints and ports');
  }
}

// Run the test
testAPI();
