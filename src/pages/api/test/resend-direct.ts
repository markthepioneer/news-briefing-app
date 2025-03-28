import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, subject, message } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email address is required' });
  }

  try {
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ error: 'RESEND_API_KEY is not configured' });
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: subject || 'BriefMe Test Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #9333EA;">BriefMe Test Email (Resend Service)</h1>
            <p>Hello there,</p>
            <p>${message || 'This is a test email from the BriefMe News Briefing App.'}</p>
            <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p>Sent from the web test tool at ${new Date().toLocaleString()}.</p>
            </div>
            <p>Best regards,<br>The BriefMe Team</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    return res.status(200).json({ 
      success: true,
      message: `Email sent successfully to ${email}`,
      data: result
    });
  } catch (error) {
    console.error('Failed to send email via Resend:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email via Resend'
    });
  }
}
