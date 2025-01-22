import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import { EMAIL_CONSTANTS } from '../contants';

jest.mock('nodemailer');

const to = 'test@gmail.com';
let typeOfMessage = 'added';
const playerName = 'John Doe';
const clubName = 'FC Barcelona';

describe('EmailService', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn();
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('should call sendMail with correct parameters for added type', async () => {

    sendMailMock.mockResolvedValueOnce({ messageId: '12345' });

    const result = await service.sendEmail(to, typeOfMessage, playerName, clubName);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to,
      subject: EMAIL_CONSTANTS.SUBJECT_WELCOME_CLUB,
      html: EMAIL_CONSTANTS.MESSAGE_WELCOME_CLUB(playerName, clubName),
    });
    expect(result).toEqual({ messageId: '12345' });
  });


  test('should throw an error if sendMail fails', async () => {

    sendMailMock.mockRejectedValueOnce(new Error('Error sending email'));

    await expect(service.sendEmail(to, typeOfMessage, playerName, clubName))
      .rejects
      .toThrow('Error sending email');
  });

  test('should call sendMail with correct parameters for deleted type', async () => {
    typeOfMessage = 'deleted';

    sendMailMock.mockResolvedValueOnce({ messageId: '67890' });

    const result = await service.sendEmail(to, typeOfMessage, playerName, clubName);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: process.env.EMAIL_USER,
      to,
      subject: EMAIL_CONSTANTS.SUBJECT_REMOVE_CLUB,
      html: EMAIL_CONSTANTS.MESSAGE_REMOVE_CLUB(playerName, clubName),
    });
    expect(result).toEqual({ messageId: '67890' });
  });
});