import { PartialType } from '@nestjs/mapped-types';
import { CreatePlayerDto } from './create-player.dto';
import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdatePlayerDto {
    @IsNotEmpty({ message: 'El salario es obligatorio' })
    @IsNumber({}, { message: 'el salario debe ser un número' })
    @Min(1,  { message: 'El salario debe ser mayor a 0' })
    salary: number;

    @IsNotEmpty({ message: 'El club_id es obligatorio' })
    @IsNumber({}, { message: 'el club_id debe ser un club existente',  })
    club_id: number;
}
