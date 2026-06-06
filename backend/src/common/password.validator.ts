import { Matches, MaxLength, MinLength } from 'class-validator';

export function PasswordValidators() {
  return function (target: object, propertyName: string) {
    MinLength(8)(target, propertyName);
    MaxLength(16)(target, propertyName);
    Matches(/^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/, {
      message: 'password must include at least one uppercase letter and one special character',
    })(target, propertyName);
  };
}
