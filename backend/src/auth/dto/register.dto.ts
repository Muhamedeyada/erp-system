import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterCompanyDto {
  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;

  @IsString()
  name?: string;
}
