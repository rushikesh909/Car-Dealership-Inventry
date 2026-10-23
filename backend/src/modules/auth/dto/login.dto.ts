import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@dealership.com', description: 'User login email' })
  @IsEmail({}, { message: 'Must be a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'User account password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
