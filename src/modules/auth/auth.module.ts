import { Module } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../../services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UsersModule } from '../users/users.module';
import { ConfigService } from '@nestjs/config';
// import { EmailService } from '@services/email.service';
import { OauthService, GoogleOAuthService, GitOAuthService } from '@ee/services/oauth';
import { OauthController } from '@ee/controllers/oauth.controller';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('SECRET_KEY_BASE'),
                    signOptions: {
                        expiresIn: config.get<string | number>('JWT_EXPIRATION_TIME') || '30d',
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [
        AuthService,
        JwtStrategy,
        UsersService,
        // EmailService,
        OauthService,
        GoogleOAuthService,
        GitOAuthService,
    ],
    controllers: [OauthController],
    exports: [AuthService],
})
export class AuthModule { }