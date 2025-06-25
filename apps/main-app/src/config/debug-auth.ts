import authService from '../services/authService';

console.log('🔐 DEBUG: Authentication Status');
console.log('================================');

// Check token existence
const token = authService.getToken();
console.log('📝 Token exists:', !!token);
console.log('📝 Token value:', token ? `${token.substring(0, 20)}...` : 'null');

// Check authentication status
const isAuth = authService.isAuthenticated();
console.log('✅ Is Authenticated:', isAuth);

// Check authorization header
const authHeader = authService.getAuthorizationHeader();
console.log('📋 Auth Header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'null');

// Check user data
const user = authService.getCurrentUser();
console.log('👤 User Data:', user);

// Check localStorage for debug
console.log('💾 LocalStorage Debug:');
console.log('   - dbdocs_token:', localStorage.getItem('dbdocs_token') ? 'EXISTS' : 'MISSING');
console.log('   - tokenType:', localStorage.getItem('tokenType'));
console.log('   - tokenExpiry:', localStorage.getItem('tokenExpiry'));

// Test API call with current auth
const testAPICall = async () => {
  console.log('🚀 Testing API Call with current auth...');
  try {
    const response = await fetch('https://api-dbdocs.mmoall.com/api/v1/project-access/permission-level/0e60e2f6-3812-438a-9532-2547a94ac591', {
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response URL:', response.url);
    
    if (response.status === 302) {
      console.log('❌ 302 Redirect - Authentication Required');
      console.log('🔗 Redirected to:', response.url);
    }
    
    const text = await response.text();
    console.log('📝 Response preview:', text.substring(0, 200));
    
  } catch (error) {
    console.error('❌ API Call Error:', error);
  }
};

// Run test after a delay to ensure everything is loaded
setTimeout(testAPICall, 1000);

export { testAPICall }; 