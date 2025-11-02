import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueLinkDto } from './dto';
import { IssueLinkType } from '@prisma/client';

@Injectable()
export class IssueLinksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a link between two issues
   */
  async create(createIssueLinkDto: CreateIssueLinkDto) {
    const { fromIssueId, toIssueId, linkType } = createIssueLinkDto;

    // Validate both issues exist
    const [fromIssue, toIssue] = await Promise.all([
      this.prisma.issue.findUnique({ where: { id: fromIssueId } }),
      this.prisma.issue.findUnique({ where: { id: toIssueId } }),
    ]);

    if (!fromIssue) {
      throw new NotFoundException(`Source issue with ID ${fromIssueId} not found`);
    }

    if (!toIssue) {
      throw new NotFoundException(`Target issue with ID ${toIssueId} not found`);
    }

    // Prevent linking issue to itself
    if (fromIssueId === toIssueId) {
      throw new BadRequestException('Cannot link an issue to itself');
    }

    // Check if link already exists
    const existingLink = await this.prisma.issueLink.findFirst({
      where: {
        fromIssueId,
        toIssueId,
        linkType,
      },
    });

    if (existingLink) {
      throw new BadRequestException('This link already exists');
    }

    // Create the link
    const link = await this.prisma.issueLink.create({
      data: {
        fromIssueId,
        toIssueId,
        linkType,
      },
      include: {
        fromIssue: {
          select: {
            id: true,
            key: true,
            title: true,
            status: true,
          },
        },
        toIssue: {
          select: {
            id: true,
            key: true,
            title: true,
            status: true,
          },
        },
      },
    });

    // Auto-create reverse link for bidirectional relationships
    if (this.shouldCreateReverseLink(linkType)) {
      const reverseLinkType = this.getReverseLinkType(linkType);
      await this.prisma.issueLink.create({
        data: {
          fromIssueId: toIssueId,
          toIssueId: fromIssueId,
          linkType: reverseLinkType,
        },
      });
    }

    return link;
  }

  /**
   * Get all links for an issue
   */
  async findAllForIssue(issueId: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${issueId} not found`);
    }

    const [outgoingLinks, incomingLinks] = await Promise.all([
      this.prisma.issueLink.findMany({
        where: { fromIssueId: issueId },
        include: {
          toIssue: {
            select: {
              id: true,
              key: true,
              title: true,
              status: true,
              priority: true,
              assignee: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.issueLink.findMany({
        where: { toIssueId: issueId },
        include: {
          fromIssue: {
            select: {
              id: true,
              key: true,
              title: true,
              status: true,
              priority: true,
              assignee: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      outgoing: outgoingLinks,
      incoming: incomingLinks,
    };
  }

  /**
   * Remove a link between issues
   */
  async remove(linkId: string) {
    const link = await this.prisma.issueLink.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      throw new NotFoundException(`Link with ID ${linkId} not found`);
    }

    // Remove reverse link if it exists
    if (this.shouldCreateReverseLink(link.linkType)) {
      const reverseLinkType = this.getReverseLinkType(link.linkType);
      await this.prisma.issueLink.deleteMany({
        where: {
          fromIssueId: link.toIssueId,
          toIssueId: link.fromIssueId,
          linkType: reverseLinkType,
        },
      });
    }

    await this.prisma.issueLink.delete({
      where: { id: linkId },
    });

    return { message: 'Link removed successfully' };
  }

  /**
   * Determine if a reverse link should be created
   */
  private shouldCreateReverseLink(linkType: IssueLinkType): boolean {
    return ['BLOCKS', 'DUPLICATES', 'RELATES_TO'].includes(linkType);
  }

  /**
   * Get the reverse link type
   */
  private getReverseLinkType(linkType: IssueLinkType): IssueLinkType {
    const reverseMap: Record<string, IssueLinkType> = {
      BLOCKS: 'BLOCKED_BY',
      BLOCKED_BY: 'BLOCKS',
      DUPLICATES: 'DUPLICATED_BY',
      DUPLICATED_BY: 'DUPLICATES',
      RELATES_TO: 'RELATES_TO',
      PARENT_OF: 'CHILD_OF',
      CHILD_OF: 'PARENT_OF',
    };

    return reverseMap[linkType] || linkType;
  }
}
