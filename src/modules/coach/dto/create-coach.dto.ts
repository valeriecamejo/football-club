import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateCoachDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1,  { message: 'Salary cannot be less than 0' })
    salary: number;

    @IsOptional()
    @IsNumber()
    club_id?: number;
}