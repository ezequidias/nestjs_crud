import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import {
    paginate,
    Pagination,
    IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { cleanObject, dbTransactionWrap } from 'src/helpers/utils.helper';
const uuid = require('uuid');
const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async paginate(options: IPaginationOptions): Promise<Pagination<User>> {
        return paginate<User>(this.usersRepository, options);
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async findOne(id: string): Promise<User> {
        return this.usersRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findByPasswordResetToken(token: string): Promise<User> {
        return this.usersRepository.findOne({
            where: { forgotPasswordToken: token },
        });
    }

    async create(
        userParams: Partial<User>,
        existingUser?: User,
        isInvite?: boolean,
        manager?: EntityManager
    ): Promise<User> {
        const password = uuid.v4();

        const { email, firstName, lastName } = userParams;
        let user: User;

        await dbTransactionWrap(async (manager: EntityManager) => {
            if (!existingUser) {
                user = manager.create(User, {
                    email,
                    firstName,
                    lastName,
                    password,
                    invitationToken: isInvite ? uuid.v4() : null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                await manager.save(user);
            } else {
                user = existingUser;
            }
        }, manager);

        return user;
    }

    async findOrCreateByEmail(
        userParams: Partial<User>,
        manager?: EntityManager
    ): Promise<{ user: User; newUserCreated: boolean }> {
        let user: User;
        let newUserCreated = false;

        user = await this.findByEmail(userParams.email);
        user = await this.create(userParams, user, null, manager);
        newUserCreated = true;

        return { user, newUserCreated };
    }

    async update(userId: string, params: any, manager?: EntityManager) {
        const { forgotPasswordToken, password, firstName, lastName } = params;

        const hashedPassword = password ? bcrypt.hashSync(password, 10) : undefined;

        const updatableParams = {
            forgotPasswordToken,
            firstName,
            lastName,
            password: hashedPassword,
        };
        // removing keys with undefined values
        cleanObject(updatableParams);

        return await dbTransactionWrap(async (manager: EntityManager) => {
            await manager.update(User, userId, updatableParams);
            const user = await manager.findOne(User, { where: { id: userId } });
            return user;
        }, manager);
    }

    async updateUser(userId: string, updatableParams: Partial<User>, manager?: EntityManager): Promise<User> {
        console.log('asd', updatableParams)
        if (updatableParams.password) updatableParams.password = bcrypt.hashSync(updatableParams.password, 10);
        return await dbTransactionWrap(async (manager: EntityManager) => {
            await manager.update(User, userId, updatableParams);
            const user = await manager.findOne(User, { where: { id: userId } });
            return user;
        }, manager);
    }

    async delete(userId: string, manager?: EntityManager) {
        await dbTransactionWrap(async (manager: EntityManager) => {
            await manager.delete(User, userId);
        }, manager);
    }

}