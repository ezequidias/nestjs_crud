import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { UsersService } from '@services/users.service';
import { GoogleOAuthService } from './google_oauth.service';
import { decamelizeKeys } from 'humps';
import { GitOAuthService } from './git_oauth.service';
import UserResponse from './models/user_response';

@Injectable()
export class OauthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly googleOAuthService: GoogleOAuthService,
        private readonly gitOAuthService: GitOAuthService,
        private readonly configService: ConfigService
    ) { }

    #isValidDomain(domain: string): boolean {
        const restrictedDomain = this.configService.get<string>('SSO_RESTRICTED_DOMAIN');

        if (!restrictedDomain) {
            return true;
        }
        if (!domain) {
            return false;
        }
        if (
            !restrictedDomain
                .split(',')
                .filter((e) => !!e)
                .includes(domain)
        ) {
            return false;
        }
        return true;
    }

    async #findOrCreateUser({ userSSOId, firstName, lastName, email, sso }: UserResponse): Promise<User> {
        const { user, newUserCreated } = await this.usersService.findOrCreateByEmail(
            { firstName, lastName, email },
        );

        // if (userSSOId) {
        //     await this.usersService.updateSSODetails(user, { userSSOId, sso });
        // }
        return user;
    }

    async #findAndActivateUser(email: string): Promise<User> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return user;
    }

    async #generateLoginResultPayload(user: User): Promise<any> {
        const JWTPayload: JWTPayload = { username: user.id, sub: user.email };
        return decamelizeKeys({
            id: user.id,
            auth_token: this.jwtService.sign(JWTPayload),
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
        });
    }

    async signIn(ssoResponse: SSOResponse): Promise<any> {
        const ssoSignUpDisabled =
            this.configService.get<string>('SSO_DISABLE_SIGNUP') &&
            this.configService.get<string>('SSO_DISABLE_SIGNUP') === 'true';

        const { token, origin } = ssoResponse;

        let userResponse: UserResponse;
        switch (origin) {
            case 'google':
                userResponse = await this.googleOAuthService.signIn(token);
                if (!this.#isValidDomain(userResponse.domain))
                    throw new UnauthorizedException(`You cannot sign in using a ${userResponse.domain} id`);
                break;

            case 'git':
                userResponse = await this.gitOAuthService.signIn(token);
                break;

            default:
                break;
        }

        if (!(userResponse.userSSOId && userResponse.email)) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const user: User = await (ssoSignUpDisabled
            ? this.#findAndActivateUser(userResponse.email)
            : this.#findOrCreateUser(userResponse));

        if (!user) {
            throw new UnauthorizedException(`Email id ${userResponse.email} is not registered`);
        }

        return await this.#generateLoginResultPayload(user);
    }
}

interface SSOResponse {
    token: string;
    origin: 'google' | 'git';
    state?: string;
    redirectUri?: string;
}

interface JWTPayload {
    username: string;
    sub: string;
}