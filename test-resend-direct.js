// A simple script to send an email using Resend API without external dependencies
// This uses Node.js built-in https module instead of axios

const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local file manually to get RESEND_API_KEY
function getResendApiKey() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    // Find the line with RESEND_API_KEY
    for (const line of envLines) {
      if (line.startsWith('RESEND_API_KEY=')) {
        // Extract the value, removing quotes if present
        let value = line.substring('RESEND_API_KEY='.length).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        return value;
      }
    }
    return null;
  } catch (error) {
    console.error('Error reading .env.local file:', error.message);
    return null;
  }
}

// Get email address to send to (default or from command line)
const emailTo = process.argv[2] || 'mhawn@ranchesatbeltcreek.com';
const apiKey = getResendApiKey();

if (!apiKey) {
  console.error('RESEND_API_KEY not found in .env.local file');
  process.exit(1);
}

console.log(`Sending test email to ${emailTo} using Resend API...`);
console.log(`API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`);

// Prepare the request data
const data = JSON.stringify({
  from: 'BriefMe <onboarding@resend.dev>',
  to: [emailTo],
  subject: 'BriefMe Test Email via Resend API (Direct)',
  html: `
    <h1>Test Email from BriefMe</h1>
    <p>This is a test email sent via Resend.com using direct Node.js https module.</p>
    <p>Time: ${new Date().toLocaleString()}</p>
    <p>If you received this email, it means the email service is working properly.</p>
    <p>Your news briefings will now be delivered to this email address.</p>
  `,
});

// Set up the request options
const options = {
  hostname: 'api.resend.com',
  port: 443,
  path: '/emails',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'Content-Length': data.length,
  },
};

// Send the request
const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('Email sent successfully!');
      console.log('Response:', responseData);
    } else {
      console.error('Failed to send email');
      console.error('Response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error sending request:', error.message);
});

// Write data to request body
req.write(data);
req.end();

console.log('Email request sent. Please check your inbox (including spam folder).');