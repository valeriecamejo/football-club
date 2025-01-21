import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateCoachDto {
  @ApiProperty({
    description: 'Name of the coach',
    example: 'Mario Benetto',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: `Coach's email`,
    example: 'mario@gmail.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    description: `Coach salary`,
    example: '125000',
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Salary cannot be less than 0' })
  salary?: number;

  @ApiProperty({
    description: `ClubID to which the coach belongs`,
    example: '20',
  })
  @IsOptional()
  @IsNumber()
  club_id?: number;
}