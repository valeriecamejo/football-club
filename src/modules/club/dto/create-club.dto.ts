import { IsNotEmpty, IsNumber, IsString, Matches, Min } from 'class-validator';

export class CreateClubDto {

    @IsString()
    @IsNotEmpty({ message: 'El nombre del club no puede estar vacío' })
    @Matches(/^(?!\s*$).+/, { message: 'El nombre del club no puede ser solo espacios' })
    name: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, { message: 'El  del club no puede ser negativo' })
    budget: number;
}