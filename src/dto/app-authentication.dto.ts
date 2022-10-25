import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { lowercaseString } from 'src/helpers/utils.helper';
import { Transform } from 'class-transformer';

export class AppAuthenticationDto {
    @IsEmail()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => lowercaseString(value))
    email: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    token: string;
}