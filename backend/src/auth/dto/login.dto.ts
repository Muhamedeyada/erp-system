import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Password is required' })
  password!: string;

  @IsOptional()
  @IsString()
  tenantSlug?: string;
}
