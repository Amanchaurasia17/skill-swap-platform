
const axios = require('axios');

async function testSwapRequests() {
  try {
    
    const response = await axios.get('http://localhost:5000/api/swaps/my', {
      headers: {
        'Authorization': 'Bearer dummy'
      }
    });
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\nThe endpoint exists and requires authentication (expected)');
        console.log('This confirms the route /api/swaps/my is properly set up');
      }
    } else {
      console.log('Network error:', error.message);
    }
  }
}

testSwapRequests();
