import { PartialType } from '@nestjs/mapped-types';
import { CreateClubDto } from './create-club.dto';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateClubDto {
    @IsNotEmpty({ message: 'El presupuesto es obligatorio' })
    @IsNumber({}, { message: 'El presupuesto debe ser un número válido' })
    @Min(1, { message: 'El presupuesto del club no puede ser menor a 1' })
    budget: number;
}
