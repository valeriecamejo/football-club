import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdatePlayerDto {
    @IsNotEmpty({ message: 'The salary is mandatory' })
    @IsNumber({}, { message: 'salary must be a number' })
    @Min(1,  { message: 'salary must be greater than 0' })
    salary: number;

    @IsNotEmpty({ message: 'club_id is required' })
    @IsNumber({}, { message: 'the club_id should be a number' })
    club_id: number;
}
