import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { sendEmail } from '../../../lib/email/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user is authenticated
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user?.email) {
      return res.status(401).json({ error: 'You must be signed in to use this endpoint' });
    }

    // Send a test email
    const result = await sendEmail({
      to: session.user.email,
      subject: 'BriefMe Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3B82F6;">BriefMe Test Email</h1>
          <p>Hello ${session.user.name || 'there'},</p>
          <p>This is a test email from your BriefMe account. If you're receiving this email, your email delivery settings are working correctly.</p>
          <p>Your real news briefings will look much better than this test email and contain personalized news content based on your topics and keywords.</p>
          <div style="background-color: #F3F4F6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #1F2937; margin-top: 0;">Your settings</h2>
            <p><strong>Email:</strong> ${session.user.email}</p>
            <p><strong>Delivery time:</strong> 9:00 AM (default)</p>
          </div>
          <p>If you have any questions or need assistance, please reply to this email or contact our support team.</p>
          <p>Best regards,<br>The BriefMe Team</p>
        </div>
      `,
    });

    return res.status(200).json({ 
      success: true,
      message: 'Test email sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send test email'
    });
  }
}
