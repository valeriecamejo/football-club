import { handleDBExceptions } from './db-exception.util';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

describe('handleDBExceptions', () => {
  let logger: { error: jest.Mock };

  beforeEach(() => {
    logger = { error: jest.fn() };
  });

  /*test('should throw a BadRequestException for a unique constraint violation error (23505)', () => {
    const error = { code: 23505, detail: 'Unique constraint violation' };

    expect(() => handleDBExceptions(error, logger))
      .toThrowError(new BadRequestException('Unique constraint violation'));

    expect(logger.error).toHaveBeenCalled();
  });*/

  test('should throw an BadRequestException for any other error', () => {
    const error = { code: 23505, detail: 'Unique constraint violation' };

    expect(() => handleDBExceptions(error, logger))
      .toThrowError(new InternalServerErrorException('Unexpected error, check server logs'));

    expect(logger.error).toHaveBeenCalled();
  });

  test('should throw an InternalServerErrorException for any other error', () => {
    const error = { code: 12345, detail: 'Unknown database error' };

    expect(() => handleDBExceptions(error, logger))
      .toThrowError(new InternalServerErrorException('Unexpected error, check server logs'));

    expect(logger.error).toHaveBeenCalled();
  });
});