import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    example: 'Toyota',
    description: 'Vehicle make / manufacturer',
  })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({ example: 'Camry', description: 'Vehicle model' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 'Sedan', description: 'Vehicle category' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 26420.0,
    description: 'Vehicle price (must be greater than 0)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: 'Price must be greater than 0' })
  price: number;

  @ApiProperty({
    example: 5,
    description: 'Inventory stock count (must be >= 0)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  quantity: number;
}
