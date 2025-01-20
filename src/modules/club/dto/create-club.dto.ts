import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateClubDto {

    @IsString()
    @IsNotEmpty({ message: 'Club name cannot be empty' })
    @Matches(/^(?!\s*$).+/, { message: 'The club name cannot be just spaces' })
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Budget must be greater than 0' })
    budget: number;
}