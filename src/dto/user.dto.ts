import { IsEmail, IsString, IsOptional, IsNotEmpty, IsNumberString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { sanitizeInput, lowercaseString } from 'src/helpers/utils.helper';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    @Transform(({ value }) => lowercaseString(value))
    email: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => sanitizeInput(value))
    first_name: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => sanitizeInput(value))
    last_name: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsOptional()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsOptional()
    @Transform(({ value }) => sanitizeInput(value))
    role: string;
}

export class FindOneParams {
    @IsUUID()
    @IsString()
    @IsNotEmpty()
    userId: string;
}


export class UpdateUserDto extends PartialType(CreateUserDto) { }