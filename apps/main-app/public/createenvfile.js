// This script creates the env-config.js file in development
// It helps simulate the environment variables that would be created by the Docker entrypoint

(function() {
  // This is just for local development, used when running the app directly
  // In Docker, this file will be created by the entrypoint script

  // Get all VITE_ environment variables from process.env
  const envVars = {};
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_')) {
      envVars[key] = process.env[key];
    }
  });

  // Additional test environment variables
  envVars.VITE_API_DOMAIN = envVars.VITE_API_DOMAIN || 'http://10.10.100.90:8081';
  envVars.VITE_BASE_SIGNLINK_URL = envVars.VITE_BASE_SIGNLINK_URL || 'http://10.10.100.90:8081';
  envVars.VITE_FRONTEND_URL = envVars.VITE_FRONTEND_URL || window.location.origin;

  // Create env-config.js file content
  let fileContent = 'window._env_ = {\n';
  Object.keys(envVars).forEach(key => {
    fileContent += `  ${key}: "${envVars[key]}",\n`;
  });
  fileContent += '};';

  console.log('Created env-config.js with environment variables:', envVars);

  // Create a script element to add the env variables
  const script = document.createElement('script');
  script.textContent = fileContent;
  document.head.appendChild(script);
})(); 