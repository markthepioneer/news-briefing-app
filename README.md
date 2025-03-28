# BriefMe - News Briefing Application

BriefMe is a personalized news briefing service that delivers customized news summaries based on your topics of interest and keywords.

## Getting Started

1. Make sure you have Node.js (v14+) and npm installed
2. Install dependencies: `npm install`
3. Set up your environment variables (copy `.env.local.example` to `.env.local` and fill in the values)
4. Set up the database: `npx prisma db push`
5. Start the development server: `npm run dev`

Or use the restart script to do steps 2-5 automatically:
```
chmod +x restart.sh
./restart.sh
```

## Features

- Personalized news briefings based on your interests
- Email delivery of formatted news briefings
- Topic and keyword tracking
- Custom notification preferences
- Rating system for improving recommendations

## Environment Variables

Make sure to set the following environment variables in your `.env.local` file:

- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_SECRET`: A secret key for NextAuth.js
- `NEXTAUTH_URL`: The base URL of your application (e.g., http://localhost:3000)
- `NEWS_API_KEY`: Your NewsAPI.org API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key (for payments)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `MAILGUN_API_KEY`: Your Mailgun API key (for sending emails)
- `MAILGUN_DOMAIN`: Your Mailgun domain

## Common Issues

### Account Creation Issues

If you're having trouble creating an account, make sure:
- The database is properly set up (`npx prisma db push`)
- You've filled in all required fields
- Your email address isn't already registered

### Briefing Generation Issues

If you're getting an error when running a briefing:
1. Make sure you've added topics and keywords in the Preferences section
2. Check that your NewsAPI key is valid
3. Save your preferences after making changes

### Email Delivery Issues

If you're not receiving emails:
1. Check your spam folder
2. Verify your email configuration in `.env.local`
3. Use the "Send Test Email" button on the dashboard to test email delivery
4. Try the "Alternative Email" button which uses Resend.com service
5. In development mode, emails are saved to the `debug-emails` folder
6. Run `npm run test-email` to directly test the email functionality

#### Setting up Resend Email Service (Recommended)

Since regular SMTP/Mailgun delivery isn't working, the application now includes integration with [Resend](https://resend.com), a reliable email API service:

1. Sign up for a free account at [Resend.com](https://resend.com)
2. Verify your domain or use their default sender domain (onboarding@resend.dev)
3. Get your API key from the dashboard
4. Add the API key to your `.env.local` file:
   ```
   RESEND_API_KEY="re_your_api_key_here"
   ```
5. Use one of these methods to test Resend integration:
   - Run `npm run send-email` from the command line (no dependencies required)
   - Visit http://localhost:3000/test-email.html in your browser
   - Use the "Alternative Email" button on the dashboard

#### Gmail App Password Setup

If you're using Gmail with 2-factor authentication, you'll need to create an App Password:
1. Go to your Google Account (https://myaccount.google.com/)
2. Select Security
3. Under "Signing in to Google", select App Passwords
   (If you don't see this option, it might be because 2FA is not set up)
4. At the bottom, select "Select app" and choose "Mail"
5. Select "Select device" and choose "Other"
6. Enter "BriefMe" or any custom name
7. Click Generate
8. Copy the 16-character password that appears
9. Use this password as your `EMAIL_PASSWORD` in the `.env.local` file

#### Email Configuration Options

The application supports multiple email delivery methods:

1. **Mailgun**
   ```
   MAILGUN_API_KEY="your-mailgun-api-key"
   MAILGUN_DOMAIN="your-mailgun-domain.com"
   ```

2. **SendGrid**
   ```
   SENDGRID_API_KEY="your-sendgrid-api-key"
   ```

3. **SMTP (e.g., Gmail)**
   ```
   EMAIL_HOST="smtp.gmail.com"
   EMAIL_PORT="587"
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-app-password"
   ```
   
   For Gmail, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833)

## Troubleshooting

If you encounter any issues:
1. Check the console for error messages
2. Restart the application using the restart.sh script
3. Verify your environment variables are correctly set