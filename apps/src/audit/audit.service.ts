import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

export interface AuditLogData {
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  userName: string;
  changes: Record<string, any>;
  issueId?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create an audit log entry
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          userId: data.userId,
          userName: data.userName,
          changes: JSON.stringify(data.changes),
          issueId: data.issueId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
    } catch (error) {
      // Don't throw errors to prevent audit failures from breaking operations
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Log entity creation
   */
  async logCreate(
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    data: Record<string, any>,
    issueId?: string,
  ): Promise<void> {
    await this.log({
      action: 'CREATE',
      entityType,
      entityId,
      userId,
      userName,
      changes: { new: data },
      issueId,
    });
  }

  /**
   * Log entity update
   */
  async logUpdate(
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    oldData: Record<string, any>,
    newData: Record<string, any>,
    issueId?: string,
  ): Promise<void> {
    const changes: Record<string, any> = {};
    
    // Find what changed
    Object.keys(newData).forEach((key) => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    });

    if (Object.keys(changes).length > 0) {
      await this.log({
        action: 'UPDATE',
        entityType,
        entityId,
        userId,
        userName,
        changes,
        issueId,
      });
    }
  }

  /**
   * Log entity deletion
   */
  async logDelete(
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    data: Record<string, any>,
    issueId?: string,
  ): Promise<void> {
    await this.log({
      action: 'DELETE',
      entityType,
      entityId,
      userId,
      userName,
      changes: { deleted: data },
      issueId,
    });
  }

  /**
   * Log status change (special case for issues/sprints)
   */
  async logStatusChange(
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    oldStatus: string,
    newStatus: string,
    issueId?: string,
  ): Promise<void> {
    await this.log({
      action: 'STATUS_CHANGE',
      entityType,
      entityId,
      userId,
      userName,
      changes: { status: { old: oldStatus, new: newStatus } },
      issueId,
    });
  }

  /**
   * Log assignment change
   */
  async logAssignment(
    entityType: string,
    entityId: string,
    userId: string,
    userName: string,
    oldAssigneeId: string | null,
    newAssigneeId: string | null,
    oldAssigneeName?: string,
    newAssigneeName?: string,
    issueId?: string,
  ): Promise<void> {
    await this.log({
      action: 'ASSIGN',
      entityType,
      entityId,
      userId,
      userName,
      changes: {
        assignee: {
          old: oldAssigneeId ? { id: oldAssigneeId, name: oldAssigneeName } : null,
          new: newAssigneeId ? { id: newAssigneeId, name: newAssigneeName } : null,
        },
      },
      issueId,
    });
  }

  /**
   * Log comment creation
   */
  async logComment(
    issueId: string,
    commentId: string,
    userId: string,
    userName: string,
    content: string,
  ): Promise<void> {
    await this.log({
      action: 'COMMENT',
      entityType: 'Comment',
      entityId: commentId,
      userId,
      userName,
      changes: { content: content.substring(0, 100) + '...' },
      issueId,
    });
  }

  /**
   * Get audit logs for an entity
   */
  async getAuditLogs(params: {
    entityType?: string;
    entityId?: string;
    issueId?: string;
    userId?: string;
    skip?: number;
    take?: number;
  }) {
    const { entityType, entityId, issueId, userId, skip = 0, take = 50 } = params;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (issueId) where.issueId = issueId;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    // Parse changes back to JSON
    const parsedLogs = logs.map((log) => ({
      ...log,
      changes: JSON.parse(log.changes),
    }));

    return {
      data: parsedLogs,
      meta: { total, skip, take },
    };
  }

  /**
   * Get activity feed (recent audit logs across all entities)
   */
  async getActivityFeed(params: { skip?: number; take?: number; projectId?: string }) {
    const { skip = 0, take = 50, projectId } = params;

    // If projectId provided, we'd need to join through issues/sprints
    // For now, return all recent activities
    const logs = await this.prisma.auditLog.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        issue: {
          select: {
            key: true,
            title: true,
            projectId: true,
          },
        },
      },
    });

    const parsedLogs = logs.map((log) => ({
      ...log,
      changes: JSON.parse(log.changes),
    }));

    return {
      data: parsedLogs,
      meta: { skip, take },
    };
  }
}
