import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, Matches, MaxLength, Min } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'Name of the player',
    example: 'Mario Benetto',
  })
  @IsNotEmpty()
  @Matches(/^(?!\s*$).+/, { message: 'The club name cannot be just spaces' })
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'Name must contain only letters and spaces',
  })
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