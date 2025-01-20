import { IsNotEmpty, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class CreatePlayerDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    salary?: number;

    @IsOptional()
    @IsNumber()
    club_id?: number;
}