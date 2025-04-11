// backend/src/services/EmailService.ts
import nodemailer, {
  Transporter,
  SendMailOptions,
  SentMessageInfo,
} from "nodemailer";
import logger from "../utils/logger";
import config from "../config/config";
import {
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
  getWelcomeEmailTemplate,
} from "../utils/emailTemplates";

/**
 * Interface for email options
 */
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email service for sending emails to users
 */
export class EmailService {
  private transporter!: Transporter;
  private fromEmail: string;

  /**
   * Creates an instance of the EmailService
   */
  constructor() {
    // Initialize the transporter based on the environment
    if (config.NODE_ENV === "development") {
      // For development, use Ethereal (fake SMTP service)
      this.setupDevelopmentTransporter();
    } else {
      // For production, use configured email provider
      this.setupProductionTransporter();
    }

    this.fromEmail = config.EMAIL_FROM || "noreply@yourapplication.com";
  }

  /**
   * Set up email transporter for development environment
   * Uses Ethereal email for testing without sending real emails
   */
  private async setupDevelopmentTransporter(): Promise<void> {
    try {
      // Create a test account on Ethereal
      const testAccount = await nodemailer.createTestAccount();

      // Create a transporter using Ethereal credentials
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      logger.info("Development email transporter set up with Ethereal");
      logger.info(
        `Ethereal email credentials: ${testAccount.user} / ${testAccount.pass}`
      );
    } catch (error) {
      logger.error("Failed to set up development email transporter:", error);
      throw new Error("Failed to set up email service for development");
    }
  }

  /**
   * Set up email transporter for production environment
   * Uses configured email provider (Resend, SendGrid, etc.)
   */
  private setupProductionTransporter(): void {
    // This implementation uses nodemailer with standard SMTP
    // Replace with appropriate provider-specific setup as needed
    this.transporter = nodemailer.createTransport({
      service: "SendGrid",
      host: config.EMAIL_HOST,
      port: parseInt(config.EMAIL_PORT || "587"),
      secure: config.EMAIL_SECURE === "true",
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASSWORD,
      },
    });

    logger.info("Production email transporter set up");
  }
  // private setupProductionTransporter(): void {
  //   try {
  //     // SendGrid configuration
  //     this.transporter = nodemailer.createTransport({
  //       host: config.EMAIL_HOST || "smtp.sendgrid.net",
  //       port: parseInt(config.EMAIL_PORT || "587"),
  //       secure: config.EMAIL_SECURE === "true",
  //       auth: {
  //         user: config.EMAIL_USER || "apikey", // Always 'apikey' for SendGrid
  //         pass: config.EMAIL_PASSWORD, // Your SendGrid API key
  //       },
  //     });

  //     // Verify connection configuration
  //     this.transporter.verify((error) => {
  //       if (error) {
  //         logger.error("Email transporter verification failed:", error);
  //       } else {
  //         logger.info("Email transporter ready to send messages");
  //       }
  //     });

  //     logger.info("Production email transporter set up");
  //   } catch (error) {
  //     logger.error("Failed to set up production email transporter:", error);
  //     // Don't throw here - allow app to continue even with email failures
  //   }
  // }
  /**
   * Send an email verification link to a user
   * @param to Recipient email address
   * @param name Recipient's name
   * @param verificationToken Token for email verification
   * @returns Promise resolving to the nodemailer info object
   */
  async sendVerificationEmail(
    to: string,
    name: string,
    verificationToken: string
  ): Promise<SentMessageInfo> {
    const verificationUrl = `${config.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const html = getVerificationEmailTemplate(name, verificationUrl);

    return this.sendEmail({
      to,
      subject: "Verify Your Email Address",
      html,
    });
  }

  /**
   * Send a password reset link to a user
   * @param to Recipient email address
   * @param name Recipient's name
   * @param resetToken Token for password reset
   * @returns Promise resolving to the nodemailer info object
   */
  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetToken: string
  ): Promise<SentMessageInfo> {
    const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;
    const html = getPasswordResetEmailTemplate(name, resetUrl);

    return this.sendEmail({
      to,
      subject: "Reset Your Password",
      html,
    });
  }

  /**
   * Send a welcome email after successful verification
   * @param to Recipient email address
   * @param name Recipient's name
   * @returns Promise resolving to the nodemailer info object
   */
  async sendWelcomeEmail(to: string, name: string): Promise<SentMessageInfo> {
    const html = getWelcomeEmailTemplate(name);

    return this.sendEmail({
      to,
      subject: "Welcome to Our Application!",
      html,
    });
  }

  /**
   * Generic method to send an email
   * @param options Email options (to, subject, html)
   * @returns Promise resolving to the nodemailer info object
   */
  private async sendEmail(options: EmailOptions): Promise<SentMessageInfo> {
    try {
      const { to, subject, html, text } = options;

      const mailOptions: SendMailOptions = {
        from: this.fromEmail,
        to,
        subject,
        html,
        text: text || "",
      };

      const info = await this.transporter.sendMail(mailOptions);

      if (config.NODE_ENV === "development") {
        // Log Ethereal URL for development
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          logger.info(`Email preview URL: ${previewUrl}`);
        }
      }

      logger.info(`Email sent to ${to}: ${subject}`);
      return info;
    } catch (error) {
      logger.error("Failed to send email:", error);
      throw new Error("Failed to send email");
    }
  }
}

// Export a singleton instance of the EmailService
export const emailService = new EmailService();
