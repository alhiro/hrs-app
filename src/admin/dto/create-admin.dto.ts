import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  birth_date?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender: 'male' | 'female' | 'other';

  @IsOptional()
  @IsEnum(['admin', 'super_admin'])
  role: 'admin' | 'super_admin';

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
