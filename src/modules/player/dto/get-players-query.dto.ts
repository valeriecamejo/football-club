import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsNotEmpty } from 'class-validator';

export class GetPlayersQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1, { message: 'club_id must be greater than 0 and valid value ' })
    @Type(() => Number)
    club_id?: number;

    @IsString()
    @IsOptional()
    name?: string;

    @IsInt()
    @IsOptional()
    @Min(1, { message: 'page must be an integer greater than or equal to 1.' })
    @Type(() => Number)
    page: number = 1;

    @IsInt()
    @IsOptional()
    @Min(1, { message: 'The limit must be an integer greater than or equal to 1.' })
    @Max(100, { message: 'The limit cannot exceed 100' })
    @Type(() => Number)
    limit: number = 10;
}