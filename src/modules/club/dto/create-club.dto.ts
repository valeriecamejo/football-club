import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateClubDto {
    @ApiProperty({
        description: 'Name of the club',
        example: 'Barcelona',
    })
    @IsString()
    @IsNotEmpty({ message: 'Club name cannot be empty' })
    @Matches(/^(?!\s*$).+/, { message: 'The club name cannot be just spaces' })
    @Matches(/^[A-Za-z\s]+$/, {
        message: 'Name must contain only letters and spaces',
      })
    name: string;

    @ApiProperty({
        description: 'Budget of the club',
        example: '150500',
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'Budget must be greater than 0' })
    budget: number;
}