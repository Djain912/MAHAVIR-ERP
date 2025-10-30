import fetch from 'node-fetch';

async function testProductAPI() {
  try {
    console.log('Testing Product API...\n');
    
    const response = await fetch('http://localhost:5000/api/products?limit=5');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    console.log('\nFirst 5 Products:');
    console.log('==================\n');
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((product, index) => {
        console.log(`${index + 1}. ${product.brandFullName || product.name}`);
        console.log(`   Purchase Rate: ₹${product.purchaseRate || product.pricePerUnit}`);
        console.log(`   Brand: ${product.brand || product.name}`);
        console.log(`   Type: ${product.type || 'N/A'}`);
        console.log(`   ML: ${product.ml || product.size}`);
        console.log('');
      });
    }
    
    console.log('✅ API Test Successful!');
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    console.log('\n⚠️  Make sure the backend is running on port 4000');
  }
}

testProductAPI();
