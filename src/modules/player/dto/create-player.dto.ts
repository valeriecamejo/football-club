import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsUUID, MaxLength, Min } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Name of the player',
    example: 'Mario Benetto',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Name of the player',
    example: 'benetto@gmail.com',
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  @MaxLength(255, { message: 'Email must not exceed 255 characters' })
  email: string;

  @ApiProperty({
    description: `Player's salary`,
    example: '233000',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  salary?: number;

  @ApiProperty({
    description: `ClubID to which the player belongs`,
    example: '20',
  })
  @IsOptional()
  @IsNumber()
  club_id?: number;
}