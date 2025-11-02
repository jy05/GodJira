import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createObjectCsvStringifier } from 'csv-writer';
import * as ExcelJS from 'exceljs';
import { ExportFormat } from './dto';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Export issues to CSV or Excel
   */
  async exportIssues(
    format: ExportFormat,
    filters: {
      projectId?: string;
      sprintId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Buffer> {
    const issues = await this.prisma.issue.findMany({
      where: {
        ...(filters.projectId && { projectId: filters.projectId }),
        ...(filters.sprintId && { sprintId: filters.sprintId }),
        ...(filters.startDate &&
          filters.endDate && {
            createdAt: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate),
            },
          }),
      },
      include: {
        project: { select: { key: true, name: true } },
        sprint: { select: { name: true } },
        creator: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = issues.map((issue) => ({
      Key: issue.key,
      Title: issue.title,
      Description: issue.description || '',
      Type: issue.type,
      Status: issue.status,
      Priority: issue.priority,
      'Story Points': issue.storyPoints || 0,
      Project: issue.project.name,
      Sprint: issue.sprint?.name || 'Backlog',
      Creator: issue.creator.name,
      'Creator Email': issue.creator.email,
      Assignee: issue.assignee?.name || 'Unassigned',
      'Assignee Email': issue.assignee?.email || '',
      Labels: issue.labels.join(', '),
      'Created At': issue.createdAt.toISOString(),
      'Updated At': issue.updatedAt.toISOString(),
    }));

    if (format === ExportFormat.CSV) {
      return this.generateCSV(data);
    } else {
      return this.generateExcel('Issues', data);
    }
  }

  /**
   * Export sprint report to CSV or Excel
   */
  async exportSprintReport(
    sprintId: string,
    format: ExportFormat,
  ): Promise<Buffer> {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: { select: { key: true, name: true } },
        issues: {
          include: {
            assignee: { select: { name: true } },
          },
        },
      },
    });

    if (!sprint) {
      throw new Error('Sprint not found');
    }

    const data = sprint.issues.map((issue) => ({
      Key: issue.key,
      Title: issue.title,
      Type: issue.type,
      Status: issue.status,
      Priority: issue.priority,
      'Story Points': issue.storyPoints || 0,
      Assignee: issue.assignee?.name || 'Unassigned',
      'Created At': issue.createdAt.toISOString(),
      'Updated At': issue.updatedAt.toISOString(),
    }));

    const summary = {
      'Sprint Name': sprint.name,
      'Sprint Status': sprint.status,
      'Start Date': sprint.startDate?.toISOString() || 'Not started',
      'End Date': sprint.endDate?.toISOString() || 'Not ended',
      'Total Issues': sprint.issues.length,
      'Completed Issues': sprint.issues.filter((i) => i.status === 'DONE')
        .length,
      'Total Story Points': sprint.issues.reduce(
        (sum, i) => sum + (i.storyPoints || 0),
        0,
      ),
    };

    if (format === ExportFormat.CSV) {
      const summaryCSV = this.generateCSV([summary]);
      const issuesCSV = this.generateCSV(data);
      // Combine summary and issues (simple concatenation for CSV)
      return Buffer.concat([
        Buffer.from('SPRINT SUMMARY\n'),
        summaryCSV,
        Buffer.from('\n\nISSUES\n'),
        issuesCSV,
      ]);
    } else {
      return this.generateExcelWithMultipleSheets([
        { name: 'Summary', data: [summary] },
        { name: 'Issues', data },
      ]);
    }
  }

  /**
   * Export work logs to CSV or Excel
   */
  async exportWorkLogs(
    format: ExportFormat,
    filters: {
      projectId?: string;
      userId?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Buffer> {
    const workLogs = await this.prisma.workLog.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.startDate &&
          filters.endDate && {
            logDate: {
              gte: new Date(filters.startDate),
              lte: new Date(filters.endDate),
            },
          }),
        ...(filters.projectId && {
          issue: { projectId: filters.projectId },
        }),
      },
      include: {
        user: { select: { name: true, email: true } },
        issue: {
          select: { key: true, title: true, project: { select: { name: true } } },
        },
      },
      orderBy: { logDate: 'desc' },
    });

    const data = workLogs.map((log) => ({
      'Issue Key': log.issue.key,
      'Issue Title': log.issue.title,
      Project: log.issue.project.name,
      User: log.user.name,
      'User Email': log.user.email,
      Description: log.description,
      'Time Spent (hours)': (log.timeSpent / 60).toFixed(2),
      'Time Spent (minutes)': log.timeSpent,
      'Log Date': log.logDate.toISOString(),
    }));

    if (format === ExportFormat.CSV) {
      return this.generateCSV(data);
    } else {
      return this.generateExcel('Work Logs', data);
    }
  }

  /**
   * Export user activity to CSV or Excel
   */
  async exportUserActivity(
    userId: string,
    format: ExportFormat,
    filters: { startDate?: string; endDate?: string },
  ): Promise<Buffer> {
    const [createdIssues, assignedIssues, comments, workLogs] =
      await Promise.all([
        this.prisma.issue.findMany({
          where: {
            creatorId: userId,
            ...(filters.startDate &&
              filters.endDate && {
                createdAt: {
                  gte: new Date(filters.startDate),
                  lte: new Date(filters.endDate),
                },
              }),
          },
          select: {
            key: true,
            title: true,
            status: true,
            createdAt: true,
          },
        }),
        this.prisma.issue.findMany({
          where: {
            assigneeId: userId,
            ...(filters.startDate &&
              filters.endDate && {
                updatedAt: {
                  gte: new Date(filters.startDate),
                  lte: new Date(filters.endDate),
                },
              }),
          },
          select: {
            key: true,
            title: true,
            status: true,
            updatedAt: true,
          },
        }),
        this.prisma.comment.findMany({
          where: {
            authorId: userId,
            ...(filters.startDate &&
              filters.endDate && {
                createdAt: {
                  gte: new Date(filters.startDate),
                  lte: new Date(filters.endDate),
                },
              }),
          },
          include: {
            issue: { select: { key: true, title: true } },
          },
        }),
        this.prisma.workLog.findMany({
          where: {
            userId,
            ...(filters.startDate &&
              filters.endDate && {
                logDate: {
                  gte: new Date(filters.startDate),
                  lte: new Date(filters.endDate),
                },
              }),
          },
          include: {
            issue: { select: { key: true, title: true } },
          },
        }),
      ]);

    const createdData = createdIssues.map((issue) => ({
      Activity: 'Created Issue',
      'Issue Key': issue.key,
      'Issue Title': issue.title,
      Status: issue.status,
      Date: issue.createdAt.toISOString(),
    }));

    const assignedData = assignedIssues.map((issue) => ({
      Activity: 'Assigned Issue',
      'Issue Key': issue.key,
      'Issue Title': issue.title,
      Status: issue.status,
      Date: issue.updatedAt.toISOString(),
    }));

    const commentData = comments.map((comment) => ({
      Activity: 'Commented',
      'Issue Key': comment.issue?.key || 'N/A',
      'Issue Title': comment.issue?.title || 'N/A',
      Status: 'N/A',
      Date: comment.createdAt.toISOString(),
    }));

    const workLogData = workLogs.map((log) => ({
      Activity: 'Logged Work',
      'Issue Key': log.issue.key,
      'Issue Title': log.issue.title,
      Status: `${(log.timeSpent / 60).toFixed(1)}h`,
      Date: log.logDate.toISOString(),
    }));

    const allActivity = [
      ...createdData,
      ...assignedData,
      ...commentData,
      ...workLogData,
    ].sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());

    if (format === ExportFormat.CSV) {
      return this.generateCSV(allActivity);
    } else {
      return this.generateExcel('User Activity', allActivity);
    }
  }

  /**
   * Generate CSV from data
   */
  private generateCSV(data: any[]): Buffer {
    if (data.length === 0) {
      return Buffer.from('No data available');
    }

    const headers = Object.keys(data[0]).map((key) => ({
      id: key,
      title: key,
    }));

    const csvStringifier = createObjectCsvStringifier({
      header: headers,
    });

    const headerString = csvStringifier.getHeaderString();
    const recordsString = csvStringifier.stringifyRecords(data);

    return Buffer.from(headerString + recordsString);
  }

  /**
   * Generate Excel file from data
   */
  private async generateExcel(
    sheetName: string,
    data: any[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) {
      worksheet.addRow(['No data available']);
      return Buffer.from(await workbook.xlsx.writeBuffer());
    }

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    data.forEach((item) => {
      worksheet.addRow(Object.values(item));
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (!column) return;
      let maxLength = 0;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  /**
   * Generate Excel file with multiple sheets
   */
  private async generateExcelWithMultipleSheets(
    sheets: { name: string; data: any[] }[],
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    for (const sheet of sheets) {
      const worksheet = workbook.addWorksheet(sheet.name);

      if (sheet.data.length === 0) {
        worksheet.addRow(['No data available']);
        continue;
      }

      // Add headers
      const headers = Object.keys(sheet.data[0]);
      worksheet.addRow(headers);

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Add data rows
      sheet.data.forEach((item) => {
        worksheet.addRow(Object.values(item));
      });

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        if (!column) return;
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
