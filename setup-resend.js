// This script sets up the Resend email service
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Setting up Resend email service...');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// 1. Update the Dashboard component to include the AlternativeEmailButton
try {
  console.log('Updating Dashboard component...');
  
  if (fileExists(path.join(__dirname, 'update-dashboard.js'))) {
    execSync('node update-dashboard.js', { stdio: 'inherit' });
  } else {
    console.error('update-dashboard.js not found!');
  }
} catch (error) {
  console.error('Error updating Dashboard component:', error);
}

// 2. Run npm install to add required dependencies
try {
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
} catch (error) {
  console.error('Error installing dependencies:', error);
}

// 3. Prompt the user to get a Resend API key
console.log('\n\nIMPORTANT: You need to get a Resend API key to send emails');
console.log('1. Sign up for a free account at https://resend.com');
console.log('2. Get your API key from the dashboard');
console.log('3. Add the API key to your .env.local file:');
console.log('   RESEND_API_KEY="re_your_api_key_here"');
console.log('\nAfter setting up your API key, restart the application with:');
console.log('./restart.sh\n');

console.log('Setup complete! Make sure to add your Resend API key to .env.local');