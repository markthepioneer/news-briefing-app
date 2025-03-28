import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import prisma from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the current user from the session
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.id) {
    return res.status(401).json({ error: 'You must be signed in to use this endpoint' });
  }

  const userId = session.user.id;

  // Handle GET request to fetch user preferences
  if (req.method === 'GET') {
    try {
      // Get user topics and keywords
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          topics: true,
          keywords: true,
          notificationPreferences: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return the user's preferences
      return res.status(200).json({
        topics: user.topics,
        keywords: user.keywords,
        notificationPreferences: user.notificationPreferences,
      });
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch user preferences',
      });
    }
  }

  // Handle PUT request to update user preferences
  if (req.method === 'PUT') {
    try {
      const { topics, keywords, notificationPreferences } = req.body;

      // Update user subscription settings if provided
      if (notificationPreferences) {
        await prisma.notificationPreferences.upsert({
          where: {
            userId,
          },
          update: {
            emailEnabled: notificationPreferences.emailEnabled ?? true,
            smsEnabled: notificationPreferences.smsEnabled ?? false,
            briefingFrequency: notificationPreferences.briefingFrequency ?? 'DAILY',
            briefingTime: notificationPreferences.briefingTime ?? '09:00',
            customTopics: notificationPreferences.customTopics ?? true,
            breakingNews: notificationPreferences.breakingNews ?? true,
          },
          create: {
            userId,
            emailEnabled: notificationPreferences.emailEnabled ?? true,
            smsEnabled: notificationPreferences.smsEnabled ?? false,
            briefingFrequency: notificationPreferences.briefingFrequency ?? 'DAILY',
            briefingTime: notificationPreferences.briefingTime ?? '09:00',
            customTopics: notificationPreferences.customTopics ?? true,
            breakingNews: notificationPreferences.breakingNews ?? true,
          },
        });
      }

      // Update topics if provided
      if (topics) {
        // First, delete all existing topics
        await prisma.topic.deleteMany({
          where: { userId },
        });

        // Then, create new topics
        await Promise.all(
          topics.map((topic: { name: string }) =>
            prisma.topic.create({
              data: {
                name: topic.name,
                userId,
              },
            })
          )
        );
      }

      // Update keywords if provided
      if (keywords) {
        // First, delete all existing keywords
        await prisma.keyword.deleteMany({
          where: { userId },
        });

        // Then, create new keywords
        await Promise.all(
          keywords.map((keyword: { name: string }) =>
            prisma.keyword.create({
              data: {
                word: keyword.name,
                userId,
              },
            })
          )
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to update user preferences',
      });
    }
  }

  // Return method not allowed for other request types
  return res.status(405).json({ error: 'Method not allowed' });
}
