import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateClubDto {
    @IsNotEmpty({ message: 'The budget is mandatory.o' })
    @IsNumber({}, { message: 'The budget must be a valid number' })
    @Min(1, { message: 'Club budget must be greater than 0' })
    budget: number;
}
