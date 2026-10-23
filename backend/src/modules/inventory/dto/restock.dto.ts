import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class RestockDto {
  @ApiProperty({
    example: 5,
    description: 'Positive integer quantity to add to inventory stock',
  })
  @Type(() => Number)
  @IsInt({ message: 'Amount must be an integer' })
  @IsPositive({ message: 'Amount must be a positive integer' })
  @IsNotEmpty()
  amount: number;
}
