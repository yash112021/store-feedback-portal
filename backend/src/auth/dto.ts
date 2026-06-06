import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { PasswordValidators } from '../common/password.validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class SignupDto {
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
}
