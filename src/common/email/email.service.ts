import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EMAIL_CONSTANTS } from '../contants';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: EMAIL_CONSTANTS.HOST,
      port: EMAIL_CONSTANTS.PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
  }

  async sendEmail(to: string, typeOfMessage: string, playerName: string, clubName: string) {
    let subject = '';
    let html = '';

    subject = typeOfMessage === 'added' ?
      EMAIL_CONSTANTS.SUBJECT_WELCOME_CLUB :
      EMAIL_CONSTANTS.SUBJECT_REMOVE_CLUB;
    html = typeOfMessage === 'added' ?
      EMAIL_CONSTANTS.MESSAGE_WELCOME_CLUB(playerName, clubName) :
      EMAIL_CONSTANTS.MESSAGE_REMOVE_CLUB(playerName, clubName);

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
      });

      return info;
    } catch (error) {
      throw new Error('Error sending email. Verify your email configuration in .env file.');
    }
  }
}