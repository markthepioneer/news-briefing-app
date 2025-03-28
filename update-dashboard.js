const fs = require('fs');
const path = require('path');

// Path to the Dashboard component
const dashboardPath = path.join(__dirname, 'src', 'components', 'Dashboard.tsx');

// Read the Dashboard component file
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Check if AlternativeEmailButton is already imported
if (!dashboardContent.includes('import AlternativeEmailButton')) {
  console.log('Adding AlternativeEmailButton import');
  
  // Add the import statement
  const newImport = `import { Bell, Settings, FileText, Home, ChevronDown, Plus, X, Loader, AlertCircle, Check, CreditCard, Zap, Mail, Phone, Play, LogOut, Eye } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Logo } from './Logo';
import { useSession, signOut, signIn } from 'next-auth/react';
import AlternativeEmailButton from './AlternativeEmailButton';`;

  const modifiedContent = dashboardContent.replace(
    /import.*Logo.*react';/s,
    newImport
  );
  
  // Find the position where we want to add the AlternativeEmailButton
  // Look for the View Debug Emails button/link in the home tab
  const buttonRegex = /<a\s+href="\/debug-email".*?View Debug Emails\s*<\/a>/s;
  const buttonMatch = modifiedContent.match(buttonRegex);
  
  if (buttonMatch) {
    const buttonIndex = buttonMatch.index + buttonMatch[0].length;
    
    // Insert the AlternativeEmailButton after the View Debug Emails button
    const alternativeEmailButton = `

                        <AlternativeEmailButton addNotification={addNotification} />`;
    
    const finalContent = modifiedContent.slice(0, buttonIndex) + alternativeEmailButton + modifiedContent.slice(buttonIndex);
    
    // Write the updated content back to the file
    fs.writeFileSync(dashboardPath, finalContent, 'utf8');
    console.log('Dashboard component updated successfully!');
  } else {
    console.error('Could not find View Debug Emails button in the Dashboard component');
  }
} else {
  console.log('AlternativeEmailButton is already imported');
}
