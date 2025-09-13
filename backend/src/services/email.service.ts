import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // In development, use console logging instead of actual email
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('📧 Email service in development mode - emails will be logged to console');
      return;
    }

    // Configure real email transport for production
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  private async sendEmail(options: EmailOptions) {
    // In development without SMTP, log to console
    if (!this.transporter) {
      console.log('📧 Email would be sent:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('Content:', options.text || options.html);
      console.log('---');
      return { messageId: 'dev-' + Date.now() };
    }

    // Send actual email
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@tucson.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    return await this.transporter.sendMail(mailOptions);
  }

  async sendInvitationEmail(
    email: string,
    firstName: string,
    activationToken: string,
    temporaryPassword?: string
  ) {
    const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate?token=${activationToken}`;
    
    const subject = 'Welcome to Tucson - Activate Your Account';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Tucson!</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'},</h2>
              
              <p>An administrator has created an account for you on the Tucson investment platform. To get started, you'll need to activate your account and set up your password.</p>
              
              ${temporaryPassword ? `
              <div class="info-box">
                <strong>Temporary Password:</strong> ${temporaryPassword}<br>
                <small>(You'll be asked to change this when you activate your account)</small>
              </div>
              ` : ''}
              
              <p>Please click the button below to activate your account:</p>
              
              <div style="text-align: center;">
                <a href="${activationUrl}" class="button">Activate My Account</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                ${activationUrl}
              </p>
              
              <p><strong>This activation link will expire in 72 hours.</strong></p>
              
              <div class="footer">
                <p>If you didn't expect this email, please ignore it.</p>
                <p>© 2025 Tucson Investment Platform</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
Welcome to Tucson!

Hello ${firstName || 'there'},

An administrator has created an account for you on the Tucson investment platform.

${temporaryPassword ? `Temporary Password: ${temporaryPassword}\n(You'll be asked to change this when you activate your account)\n` : ''}

To activate your account, please visit:
${activationUrl}

This activation link will expire in 72 hours.

If you didn't expect this email, please ignore it.

© 2025 Tucson Investment Platform
    `;

    await this.sendEmail({ to: email, subject, html, text });
    
    // Log the invitation in audit log
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'user.invited',
          details: { email, activationUrl },
        },
      });
    }
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your Tucson Password';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${firstName || 'there'},</h2>
              
              <p>We received a request to reset your password for your Tucson account.</p>
              
              <p>Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset My Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <p><strong>This link will expire in 1 hour.</strong></p>
              
              <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
              
              <div class="footer">
                <p>© 2025 Tucson Investment Platform</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
Password Reset Request

Hello ${firstName || 'there'},

We received a request to reset your password for your Tucson account.

To reset your password, please visit:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this password reset, please ignore this email and your password will remain unchanged.

© 2025 Tucson Investment Platform
    `;

    await this.sendEmail({ to: email, subject, html, text });
  }

  async sendActivationSuccessEmail(email: string, firstName: string) {
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/sign-in`;
    
    const subject = 'Account Activated Successfully';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Account Activated! 🎉</h1>
            </div>
            <div class="content">
              <h2>Congratulations ${firstName || 'there'}!</h2>
              
              <p>Your Tucson account has been successfully activated. You can now log in and start exploring investment opportunities.</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Log In Now</a>
              </div>
              
              <p><strong>What's next?</strong></p>
              <ul>
                <li>Complete your profile information</li>
                <li>Verify your accredited investor status</li>
                <li>Browse available investment opportunities</li>
                <li>Connect with other investors</li>
              </ul>
              
              <div class="footer">
                <p>Welcome to the Tucson community!</p>
                <p>© 2025 Tucson Investment Platform</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const text = `
Account Activated!

Congratulations ${firstName || 'there'}!

Your Tucson account has been successfully activated. You can now log in at:
${loginUrl}

What's next?
- Complete your profile information
- Verify your accredited investor status
- Browse available investment opportunities
- Connect with other investors

Welcome to the Tucson community!

© 2025 Tucson Investment Platform
    `;

    await this.sendEmail({ to: email, subject, html, text });
  }
}

export const emailService = new EmailService();