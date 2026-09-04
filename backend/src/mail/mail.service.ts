import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Notification } from '../common/domain/notification/notification';
import { NotificationException } from '../common/domain/notification/notification.exception';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private resetPasswordTemplateCache: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('SMTP Transporter configured successfully.');
    } else {
      this.logger.warn(
        'SMTP settings are missing. Emails will be logged to console instead of being sent.',
      );
    }
  }

  private async getResetPasswordTemplateAsync(): Promise<string> {
    if (this.resetPasswordTemplateCache) {
      return this.resetPasswordTemplateCache;
    }

    const templatePath = path.join(
      __dirname,
      '..',
      'assets',
      'templates',
      'reset-password.html',
    );
    try {
      this.resetPasswordTemplateCache = await fs.readFile(templatePath, 'utf8');
    } catch (err) {
      this.logger.error('Failed to load email template:', err);
      // Fallback
      this.resetPasswordTemplateCache = `<p><a href="{{link}}">Redefinir Senha</a></p>`;
    }

    return this.resetPasswordTemplateCache;
  }

  async sendPasswordResetEmailAsync(
    email: string,
    rawToken: string,
    origin?: string,
  ): Promise<void> {
    const notification = new Notification();

    if (!email || !email.trim()) {
      notification.addError({
        context: 'email',
        message: 'Email é obrigatório',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      notification.addError({
        context: 'email',
        message: 'Email inválido',
      });
    }

    if (!rawToken || !rawToken.trim()) {
      notification.addError({
        context: 'token',
        message: 'Token de redefinição é obrigatório',
      });
    }

    if (notification.hasErrors()) {
      throw new NotificationException(notification.getErrors());
    }

    const frontendUrl =
      origin ||
      this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const link = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

    const enableRealEmail =
      this.configService.get<string>('ENABLE_REAL_EMAIL', 'false') === 'true';

    if (this.transporter && enableRealEmail) {
      const from = this.configService.get<string>(
        'EMAIL_FROM',
        'noreply@base-auth.local',
      );
      const htmlTemplate = await this.getResetPasswordTemplateAsync();
      const html = htmlTemplate.replace(/\{\{link\}\}/g, link);

      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject: 'Base Auth - Redefinição de Senha',
          html,
        });
        this.logger.log(
          `✉️ Real password reset email sent to ${email} via SMTP.`,
        );
      } catch (err) {
        this.logger.error(`Failed to send email to ${email}`, err);
      }
    } else {
      const reason = !this.transporter
        ? 'SMTP Not Configured'
        : 'ENABLE_REAL_EMAIL is false';
      this.logger.log(
        `\n\n======================================================`,
      );
      this.logger.log(
        `[${reason}] MOCK EMAIL - Password Reset Request for ${email}`,
      );
      this.logger.log(`Token: ${rawToken}`);
      this.logger.log(`Link: ${link}`);
      this.logger.log(
        `======================================================\n\n`,
      );
    }
  }
}
