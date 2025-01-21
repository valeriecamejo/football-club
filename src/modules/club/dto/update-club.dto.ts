import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateClubDto {
  @ApiProperty({
    description: 'Budget of the club',
    example: '150500',
  })
  @IsNotEmpty({ message: 'The budget is mandatory.o' })
  @IsNumber({}, { message: 'The budget must be a valid number' })
  @Min(1, { message: 'Club budget must be greater than 0' })
  budget: number;
}
