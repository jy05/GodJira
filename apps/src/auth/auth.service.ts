import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  /**
   * Register a new user with NIST-compliant password hashing
   */
  async register(registerDto: RegisterDto) {
    const { email, password, name, jobTitle, department } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt (10 rounds for bcryptjs compatibility)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        jobTitle,
        department,
        passwordHistory: [hashedPassword],
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        jobTitle: true,
        department: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Validate user credentials
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Check if account is locked
    if (user.lockedUntil && new Date() < user.lockedUntil) {
      throw new UnauthorizedException('Account is locked. Please try again later.');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.handleFailedLogin(user);
      return null;
    }

    // Reset failed login attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Remove password from return object
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Login user and return tokens
   */
  async login(user: User) {
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Handle failed login attempts with account lockout
   */
  private async handleFailedLogin(user: User) {
    const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;
    const lockDuration = this.configService.get<number>('LOCK_DURATION_MINUTES') || 15;

    const failedAttempts = user.failedLoginAttempts + 1;

    if (failedAttempts >= maxAttempts) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + lockDuration);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: failedAttempts,
          lockedUntil,
        },
      });

      throw new UnauthorizedException(
        `Account locked due to multiple failed login attempts. Try again in ${lockDuration} minutes.`,
      );
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: failedAttempts,
      },
    });
  }

  /**
   * Validate password against history (NIST compliance)
   */
  async validatePasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return false;
    }

    const historySize = this.configService.get<number>('PASSWORD_HISTORY_SIZE') || 5;
    const recentPasswords = user.passwordHistory.slice(-historySize);

    for (const oldHash of recentPasswords) {
      const isMatch = await bcrypt.compare(newPassword, oldHash);
      if (isMatch) {
        throw new BadRequestException('Password has been used recently. Please choose a different password.');
      }
    }

    return true;
  }

  /**
   * Request password reset - send email with reset token
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not (security)
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 30); // 30 minutes

    // Save token to database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In production, send email here
    // await this.emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  /**
   * Reset password using token from email
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Validate password against history
    await this.validatePasswordHistory(user.id, newPassword);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    const historySize = this.configService.get<number>('PASSWORD_HISTORY_SIZE') || 5;
    const updatedPasswordHistory = [...user.passwordHistory, hashedPassword].slice(-historySize);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordHistory: updatedPasswordHistory,
        resetToken: null,
        resetTokenExpiry: null,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Generate email verification token for new user
   */
  async generateEmailVerificationToken(userId: string): Promise<string> {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date();
    verificationExpiry.setHours(verificationExpiry.getHours() + 24); // 24 hours

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    return verificationToken;
  }

  /**
   * Verify email address using token
   */
  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const { token } = verifyEmailDto;

    const user = await this.prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: {
          gte: new Date(), // Token not expired
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { message: 'If an account with that email exists, a verification email has been sent.' };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = await this.generateEmailVerificationToken(user.id);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    return { message: 'Verification email has been sent.' };
  }
}
