import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PasswordValidators } from '../common/password.validator';
import { Role } from '../common/roles';

export class CreateUserDto {
  @IsString()
  @MinLength(20)
  @MaxLength(60)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(400)
  address: string;

  @PasswordValidators()
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}

export class UpdatePasswordDto {
  @PasswordValidators()
  password: string;
}
