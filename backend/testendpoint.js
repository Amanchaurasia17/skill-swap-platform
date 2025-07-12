// Test the actual API endpoint with authentication
const axios = require('axios');

async function testAPIEndpoint() {
  try {
    // First, try to login and get a token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@skillswap.com',
      password: 'admin123' // assuming this is the password
    });

    console.log('Login successful:', loginResponse.data.message);
    const token = loginResponse.data.token;

    // Now test the swap requests API
    const swapResponse = await axios.get('http://localhost:5000/api/swaps/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('\n=== API Response ===');
    console.log('Status:', swapResponse.status);
    console.log('Response data:', JSON.stringify(swapResponse.data, null, 2));

    // Calculate stats like the dashboard does
    const swaps = swapResponse.data.swaps || [];
    const activeRequests = swaps.filter(req => req.status === 'accepted').length;
    const completedSwaps = swaps.filter(req => req.status === 'completed').length;
    const pendingRequests = swaps.filter(req => req.status === 'pending').length;

    console.log('\n=== Dashboard Stats ===');
    console.log('Active Requests (accepted):', activeRequests);
    console.log('Completed Swaps:', completedSwaps);
    console.log('Pending Requests:', pendingRequests);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPIEndpoint();
