import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const appUrl = this.configService.get<string>('FRONTEND_URL');
    
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Welcome to GodJira - Your Project Management Platform',
        template: './welcome',
        context: {
          name,
          appUrl,
          loginUrl: `${appUrl}/login`,
        },
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error to prevent registration failure
    }
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('FRONTEND_URL');
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Verify Your Email - GodJira',
        template: './verify-email',
        context: {
          name,
          verificationUrl,
          expiryHours: 24,
        },
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('FRONTEND_URL');
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset Your Password - GodJira',
        template: './reset-password',
        context: {
          name,
          resetUrl,
          expiryMinutes: 30,
        },
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send issue assignment notification
   */
  async sendIssueAssignmentEmail(
    email: string,
    assigneeName: string,
    issueKey: string,
    issueTitle: string,
    assignedBy: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('FRONTEND_URL');
    const issueUrl = `${appUrl}/issues/${issueKey}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `You've been assigned to ${issueKey}: ${issueTitle}`,
        template: './issue-assignment',
        context: {
          assigneeName,
          issueKey,
          issueTitle,
          assignedBy,
          issueUrl,
        },
      });
    } catch (error) {
      console.error('Failed to send issue assignment email:', error);
      // Don't throw error to prevent assignment failure
    }
  }

  /**
   * Send comment notification
   */
  async sendCommentNotificationEmail(
    email: string,
    recipientName: string,
    commenterName: string,
    issueKey: string,
    commentPreview: string,
  ): Promise<void> {
    const appUrl = this.configService.get<string>('FRONTEND_URL');
    const issueUrl = `${appUrl}/issues/${issueKey}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `New comment on ${issueKey}`,
        template: './comment-notification',
        context: {
          recipientName,
          commenterName,
          issueKey,
          commentPreview: commentPreview.substring(0, 200),
          issueUrl,
        },
      });
    } catch (error) {
      console.error('Failed to send comment notification email:', error);
      // Don't throw error
    }
  }
}
