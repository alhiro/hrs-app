import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  first_name?: string;

  @IsOptional()
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  birth_date?: string;

  @IsOptional()
  gender?: "male" | "female" | "other";

  @IsOptional()
  role?: "admin" | "super_admin";

  @IsOptional()
  @MinLength(6)
  password?: string;
}
