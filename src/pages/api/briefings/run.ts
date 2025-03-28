import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { sendEmail } from '../../../lib/email/emailService';
import { generateBriefing } from '../../../lib/briefing';

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

    // Generate the briefing
    const briefing = await generateBriefing(session.user.email);

    // Send the briefing email
    const result = await sendEmail({
      to: session.user.email,
      subject: `Your BriefMe News Briefing - ${new Date().toLocaleDateString()}`,
      html: briefing.html
    });

    return res.status(200).json({ 
      success: true,
      message: 'Briefing sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Failed to run briefing:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to run briefing'
    });
  }
}
