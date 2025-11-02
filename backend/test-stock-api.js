/**
 * Test Stock Summary API
 */

import fetch from 'node-fetch';

async function testStockSummary() {
  try {
    // First login to get token
    console.log('Logging in as admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login?type=admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone: '9999999999',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Login successful\n');

    // Test stock summary API
    console.log('Fetching stock summary...');
    const stockResponse = await fetch('http://localhost:5000/api/stock/available/summary', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const stockData = await stockResponse.json();

    if (!stockData.success) {
      console.error('Failed to fetch stock:', stockData.message);
      return;
    }

    console.log('\n📊 Stock Summary (First 5 items):\n');
    const items = stockData.data.slice(0, 5);
    
    items.forEach((item, index) => {
      console.log(`${index + 1}. Product: ${item.productName || 'EMPTY'}`);
      console.log(`   Size: ${item.productSize || 'EMPTY'}`);
      console.log(`   Category: ${item.productCategory || 'EMPTY'}`);
      console.log(`   Available: ${item.availableQuantity} units`);
      console.log(`   Batches: ${item.batches}`);
      console.log('');
    });

    console.log(`\nTotal items in stock: ${stockData.data.length}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

testStockSummary();
