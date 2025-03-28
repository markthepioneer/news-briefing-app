import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || '',
        notificationPreferences: {
          create: {
            emailEnabled: true,
            smsEnabled: false,
            briefingFrequency: 'DAILY',
            briefingTime: '09:00',
          }
        },
        usageQuota: {
          create: {
            newsArticlesRead: 0,
            topicsAllowed: 3,
            keywordsAllowed: 5,
            resetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          }
        },
        subscription: {
          create: {
            status: 'ACTIVE',
            plan: 'FREE',
            currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            cancelAtPeriodEnd: false,
          }
        }
      },
    });
    
    // Create default topics
    const defaultTopics = ['Technology', 'Business', 'Science'];
    
    await Promise.all(defaultTopics.map(async (topic) => {
      return prisma.topic.create({
        data: {
          name: topic,
          userId: user.id,
        },
      });
    }));

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user',
    });
  }
}
