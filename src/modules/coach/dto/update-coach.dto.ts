import { PartialType } from '@nestjs/mapped-types';
import { CreateCoachDto } from './create-coach.dto';
import { IsDefined, IsInt, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCoachDto {
    @IsNotEmpty()
    @IsNumber({}, { message: 'Salary should be a number', })
    @Min(1, { message: 'Salary cannot be less than 1' })
    salary?: number;

    @IsNotEmpty({ message: 'club_id is required' })
    @IsNumber({}, { message: 'the club_id should be a number', })
    club_id: number;
}
