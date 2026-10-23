import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class SearchVehicleDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'Toyota', description: 'Case-insensitive partial make match' })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ example: 'Camry', description: 'Case-insensitive partial model match' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ example: 'Sedan', description: 'Case-insensitive partial category match' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 10000, description: 'Minimum price threshold' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'minPrice cannot be negative' })
  minPrice?: number;

  @ApiPropertyOptional({ example: 50000, description: 'Maximum price threshold' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'maxPrice cannot be negative' })
  maxPrice?: number;
}
