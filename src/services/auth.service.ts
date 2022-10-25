import {
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
// import { EmailService } from './email.service';
import { decamelizeKeys } from 'humps';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from 'typeorm';
import { dbTransactionWrap } from 'src/helpers/utils.helper';
const bcrypt = require('bcrypt');

interface JWTPayload {
    username: string;
    sub: string;
    isSSOLogin?: boolean;
    isPasswordLogin: boolean;
}
@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        // private emailService: EmailService,
        private configService: ConfigService
    ) { }

    verifyToken(token: string) {
        try {
            const signedJwt = this.jwtService.verify(token);
            return signedJwt;
        } catch (err) {
            return null;
        }
    }

    private async validateUser(email: string, password: string): Promise<User> {
        const user = await this.usersService.findByEmail(email);

        if (!user) return;

        const passwordRetryConfig = this.configService.get<string>('PASSWORD_RETRY_LIMIT');

        const passwordRetryAllowed = passwordRetryConfig ? parseInt(passwordRetryConfig) : 5;

        if (
            this.configService.get<string>('DISABLE_PASSWORD_RETRY_LIMIT') !== 'true' &&
            user.passwordRetryCount >= passwordRetryAllowed
        ) {
            throw new UnauthorizedException(
                'Maximum password retry limit reached, please reset your password using forget password option'
            );
        }

        if (!(await bcrypt.compare(password, user.password))) {
            await this.usersService.updateUser(user.id, { passwordRetryCount: user.passwordRetryCount + 1 });
            return;
        }

        return user;
    }

    async login(email: string, password: string) {
        const user = await this.validateUser(email, password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.usersService.updateUser(user.id, {
            passwordRetryCount: 0,
        });

        const payload: JWTPayload = {
            username: user.id,
            sub: user.email,
            isPasswordLogin: true,
        };

        return decamelizeKeys({
            id: user.id,
            auth_token: this.jwtService.sign(payload),
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
        });
    }

    async signup(email: string) {
        const existingUser = await this.usersService.findByEmail(email);
        // if (existingUser?.organizationUsers?.some((ou) => ou.status === 'active')) {
        //     throw new NotAcceptableException('Email already exists');
        // }

        if (existingUser?.invitationToken) {
            // await this.emailService.sendWelcomeEmail(
            //     existingUser.email,
            //     existingUser.firstName,
            //     existingUser.invitationToken
            // );
            return;
        }

        await dbTransactionWrap(async (manager: EntityManager) => {
            // Create default organization
            const user = await this.usersService.create(
                { email },
                existingUser,
                true,
                manager
            );
            // await this.emailService.sendWelcomeEmail(user.email, user.firstName, user.invitationToken);
        });
        return {};
    }

}