import axios from 'axios';

// Test the stats API directly
const testStatsAPI = async () => {
  try {
    // Driver ID from your database example
    const driverId = '68ffe9eed3cd220a5768819e';
    
    console.log(`🧪 Testing stats API for driver: ${driverId}\n`);
    
    const response = await axios.get(`http://localhost:5000/api/cash-collections/stats/${driverId}`, {
      headers: {
        'Authorization': 'Bearer test-token' // You may need a real token
      }
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data) {
      console.log('\n📈 Stats breakdown:');
      console.log('  Total Collections:', response.data.data.totalCollections);
      console.log('  Cumulative Variance:', response.data.data.cumulativeVariance);
      console.log('  Total Variance:', response.data.data.totalVariance);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testStatsAPI();
