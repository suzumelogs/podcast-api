import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = this.createTransporter();
  }

  private createTransporter(): nodemailer.Transporter {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const secure = this.configService.get<boolean>('MAIL_SECURE');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASS');

    console.log(host, port, secure, user, pass);

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendResetPasswordEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('MAIL_FROM'),
      to: email,
      subject: 'Password Reset Request',
      text: `Your password reset code is ${resetToken}. It is valid for 10 minutes.`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
