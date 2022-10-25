import { Controller, Post, UseGuards, Body, Param } from '@nestjs/common';
import { AppAuthenticationDto } from '@dto/app-authentication.dto';
import { AuthService } from '../services/auth.service';
import { SignupDisableGuard } from 'src/modules/auth/signup-disable.guard';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post(['authenticate'])
    async login(@Body() appAuthDto: AppAuthenticationDto) {
        return this.authService.login(appAuthDto.email, appAuthDto.password);
    }

    @UseGuards(SignupDisableGuard)
    @Post('signup')
    async signup(@Body() appAuthDto: AppAuthenticationDto) {
        return this.authService.signup(appAuthDto.email);
    }

}