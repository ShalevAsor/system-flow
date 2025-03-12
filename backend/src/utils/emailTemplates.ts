// backend/src/utils/emailTemplates.ts

/**
 * Email templates for various authentication-related emails
 */

/**
 * Generate a verification email template
 * @param userName The user's first name
 * @param verificationUrl The URL for verifying the email
 * @returns HTML string for the verification email
 */
export const getVerificationEmailTemplate = (
  userName: string,
  verificationUrl: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Confirm Your Email Address</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p>This verification link will expire in 24 hours.</p>
      <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Your Application. All rights reserved.</p>
    </div>
  `;
};

/**
 * Generate a password reset email template
 * @param userName The user's first name
 * @param resetUrl The URL for resetting the password
 * @returns HTML string for the password reset email
 */
export const getPasswordResetEmailTemplate = (
  userName: string,
  resetUrl: string
): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>This password reset link will expire in 1 hour.</p>
      <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Your Application. All rights reserved.</p>
    </div>
  `;
};

/**
 * Generate a welcome email template (sent after verification)
 * @param userName The user's first name
 * @returns HTML string for the welcome email
 */
export const getWelcomeEmailTemplate = (userName: string): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Welcome to Our Application!</h2>
      <p>Hello ${userName},</p>
      <p>Thank you for verifying your email address. Your account is now fully activated and ready to use.</p>
      <p>We're excited to have you on board! Here are a few things you can do to get started:</p>
      <ul style="line-height: 1.6;">
        <li>Complete your profile information</li>
        <li>Explore our features</li>
        <li>Check out our documentation</li>
      </ul>
      <p>If you have any questions or need assistance, feel free to contact our support team.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px;">© ${new Date().getFullYear()} Your Application. All rights reserved.</p>
    </div>
  `;
};
