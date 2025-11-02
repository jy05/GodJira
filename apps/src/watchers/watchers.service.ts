import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Add a watcher to an issue
   */
  async watchIssue(userId: string, issueId: string) {
    // Verify issue exists
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Check if already watching
    const existing = await this.prisma.watcher.findUnique({
      where: {
        userId_issueId: {
          userId,
          issueId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Already watching this issue');
    }

    const watcher = await this.prisma.watcher.create({
      data: {
        userId,
        issueId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        issue: {
          select: {
            id: true,
            key: true,
            title: true,
          },
        },
      },
    });

    return watcher;
  }

  /**
   * Remove a watcher from an issue
   */
  async unwatchIssue(userId: string, issueId: string) {
    const watcher = await this.prisma.watcher.findUnique({
      where: {
        userId_issueId: {
          userId,
          issueId,
        },
      },
    });

    if (!watcher) {
      throw new NotFoundException('Not watching this issue');
    }

    await this.prisma.watcher.delete({
      where: {
        id: watcher.id,
      },
    });

    return { message: 'Successfully unwatched issue' };
  }

  /**
   * Get all watchers for an issue
   */
  async getIssueWatchers(issueId: string) {
    const watchers = await this.prisma.watcher.findMany({
      where: { issueId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            jobTitle: true,
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return watchers;
  }

  /**
   * Get all issues watched by a user
   */
  async getUserWatchedIssues(userId: string) {
    const watchers = await this.prisma.watcher.findMany({
      where: { userId },
      include: {
        issue: {
          include: {
            project: {
              select: {
                id: true,
                key: true,
                name: true,
              },
            },
            sprint: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return watchers.map((w) => w.issue);
  }

  /**
   * Check if user is watching an issue
   */
  async isWatching(userId: string, issueId: string): Promise<boolean> {
    const watcher = await this.prisma.watcher.findUnique({
      where: {
        userId_issueId: {
          userId,
          issueId,
        },
      },
    });

    return !!watcher;
  }

  /**
   * Get watcher count for an issue
   */
  async getWatcherCount(issueId: string): Promise<number> {
    return this.prisma.watcher.count({
      where: { issueId },
    });
  }
}
