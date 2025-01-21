import { IsEmail, IsNotEmpty, IsNumber, IsOptional, Matches, MaxLength, Min } from 'class-validator';

export class CreateCoachDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(255, { message: 'Email must not exceed 255 characters' })
    email: string;

    @IsOptional()
    @IsNumber()
    @Min(1,  { message: 'Salary cannot be less than 0' })
    salary?: number;

    @IsOptional()
    @IsNumber()
    club_id?: number;
}