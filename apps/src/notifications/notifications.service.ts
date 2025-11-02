import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

export interface CreateNotificationDto {
  type: string;
  title: string;
  message: string;
  userId: string;
  actorId?: string;
  actorName?: string;
  issueId?: string;
  issueKey?: string;
  projectId?: string;
  sprintId?: string;
  commentId?: string;
  metadata?: any;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a notification and send it via WebSocket
   */
  async create(data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type as any,
        title: data.title,
        message: data.message,
        userId: data.userId,
        actorId: data.actorId,
        actorName: data.actorName,
        issueId: data.issueId,
        issueKey: data.issueKey,
        projectId: data.projectId,
        sprintId: data.sprintId,
        commentId: data.commentId,
        metadata: data.metadata || {},
      },
    });

    // Send real-time notification via WebSocket
    this.notificationsGateway.sendToUser(data.userId, 'notification', notification);

    this.logger.debug(`Created notification ${notification.id} for user ${data.userId}`);

    return notification;
  }

  /**
   * Create notifications for multiple users
   */
  async createMany(notifications: CreateNotificationDto[]) {
    const created = await Promise.all(
      notifications.map((data) => this.create(data)),
    );
    return created;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    options?: {
      skip?: number;
      take?: number;
      unreadOnly?: boolean;
    },
  ) {
    const { skip = 0, take = 50, unreadOnly = false } = options || {};

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        skip,
        take,
        pages: Math.ceil(total / take),
      },
      unreadCount,
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Notify user about the update
    this.notificationsGateway.sendToUser(userId, 'notificationRead', { id });

    return updated;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // Notify user
    this.notificationsGateway.sendToUser(userId, 'allNotificationsRead', {
      count: result.count,
    });

    return { count: result.count };
  }

  /**
   * Delete a notification
   */
  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted' };
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // ==========================================
  // NOTIFICATION HELPERS
  // ==========================================

  /**
   * Notify issue assignment
   */
  async notifyIssueAssigned(params: {
    issueId: string;
    issueKey: string;
    issueTitle: string;
    assigneeId: string;
    actorId: string;
    actorName: string;
    projectId: string;
  }) {
    return this.create({
      type: 'ISSUE_ASSIGNED',
      title: 'Issue Assigned',
      message: `${params.actorName} assigned you to ${params.issueKey}: ${params.issueTitle}`,
      userId: params.assigneeId,
      actorId: params.actorId,
      actorName: params.actorName,
      issueId: params.issueId,
      issueKey: params.issueKey,
      projectId: params.projectId,
    });
  }

  /**
   * Notify issue comment
   */
  async notifyIssueComment(params: {
    issueId: string;
    issueKey: string;
    commentId: string;
    actorId: string;
    actorName: string;
    content: string;
    watcherIds: string[];
  }) {
    // Notify all watchers except the actor
    const userIds = params.watcherIds.filter((id) => id !== params.actorId);

    return this.createMany(
      userIds.map((userId) => ({
        type: 'ISSUE_COMMENTED',
        title: 'New Comment',
        message: `${params.actorName} commented on ${params.issueKey}`,
        userId,
        actorId: params.actorId,
        actorName: params.actorName,
        issueId: params.issueId,
        issueKey: params.issueKey,
        commentId: params.commentId,
        metadata: { commentPreview: params.content.substring(0, 100) },
      })),
    );
  }

  /**
   * Notify mentions in comment
   */
  async notifyMentions(params: {
    issueId: string;
    issueKey: string;
    commentId: string;
    actorId: string;
    actorName: string;
    mentionedUserIds: string[];
  }) {
    return this.createMany(
      params.mentionedUserIds
        .filter((id) => id !== params.actorId)
        .map((userId) => ({
          type: 'ISSUE_MENTIONED',
          title: 'You were mentioned',
          message: `${params.actorName} mentioned you in ${params.issueKey}`,
          userId,
          actorId: params.actorId,
          actorName: params.actorName,
          issueId: params.issueId,
          issueKey: params.issueKey,
          commentId: params.commentId,
        })),
    );
  }

  /**
   * Notify issue status change
   */
  async notifyStatusChange(params: {
    issueId: string;
    issueKey: string;
    oldStatus: string;
    newStatus: string;
    actorId: string;
    actorName: string;
    watcherIds: string[];
  }) {
    const userIds = params.watcherIds.filter((id) => id !== params.actorId);

    return this.createMany(
      userIds.map((userId) => ({
        type: 'ISSUE_STATUS_CHANGED',
        title: 'Status Changed',
        message: `${params.actorName} changed ${params.issueKey} status from ${params.oldStatus} to ${params.newStatus}`,
        userId,
        actorId: params.actorId,
        actorName: params.actorName,
        issueId: params.issueId,
        issueKey: params.issueKey,
        metadata: { oldStatus: params.oldStatus, newStatus: params.newStatus },
      })),
    );
  }

  /**
   * Notify watcher added
   */
  async notifyWatcherAdded(params: {
    issueId: string;
    issueKey: string;
    issueTitle: string;
    watcherId: string;
  }) {
    return this.create({
      type: 'WATCHER_ADDED',
      title: 'Watching Issue',
      message: `You are now watching ${params.issueKey}: ${params.issueTitle}`,
      userId: params.watcherId,
      issueId: params.issueId,
      issueKey: params.issueKey,
    });
  }

  /**
   * Notify sprint started
   */
  async notifySprintStarted(params: {
    sprintId: string;
    sprintName: string;
    projectId: string;
    teamMemberIds: string[];
  }) {
    return this.createMany(
      params.teamMemberIds.map((userId) => ({
        type: 'SPRINT_STARTED',
        title: 'Sprint Started',
        message: `Sprint "${params.sprintName}" has started`,
        userId,
        sprintId: params.sprintId,
        projectId: params.projectId,
      })),
    );
  }

  /**
   * Notify team added
   */
  async notifyTeamAdded(params: {
    teamId: string;
    teamName: string;
    userId: string;
  }) {
    return this.create({
      type: 'TEAM_ADDED',
      title: 'Added to Team',
      message: `You have been added to team "${params.teamName}"`,
      userId: params.userId,
      metadata: { teamId: params.teamId },
    });
  }
}
