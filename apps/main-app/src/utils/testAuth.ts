// TEMPORARY: Manual token test utility
// Remove this file after fixing authentication

export const testWithManualToken = () => {
  // Temporarily set a test token (replace with real token from network tab)
  localStorage.setItem('dbdocs_token', 'YOUR_REAL_TOKEN_HERE');
  localStorage.setItem('tokenType', 'Bearer');
  localStorage.setItem('tokenExpiry', (Date.now() + 86400000).toString());
  localStorage.setItem('user', JSON.stringify({
    id: 'test-user',
    email: 'test@example.com',
    name: 'Test User',
    provider: 'google'
  }));
  
  console.log('✅ Manually set test token');
  console.log('🔄 Reload page to test API calls');
};

export const clearTestAuth = () => {
  localStorage.removeItem('dbdocs_token');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('tokenExpiry');
  localStorage.removeItem('user');
  console.log('🧹 Cleared all auth data');
};

// Make functions available globally for testing in console
(window as any).testAuth = testWithManualToken;
(window as any).clearAuth = clearTestAuth; 