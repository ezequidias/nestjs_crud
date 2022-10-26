import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Query,
    Param,
    Delete,
    UseGuards,
    NotAcceptableException,
    BadRequestException,
    DefaultValuePipe,
    ParseIntPipe,
    HttpException,
    HttpStatus,
    ClassSerializerInterceptor,
    UseInterceptors
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { dbTransactionWrap } from 'src/helpers/utils.helper';
import { UsersService } from 'src/services/users.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, FindOneParams } from '@dto/user.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    public async index(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    ) {
        limit = limit > 100 ? 100 : limit;
        return await this.usersService.paginate({ page, limit });
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':userId')
    public async show(@Param() params: FindOneParams): Promise<User> {
        const _res = await this.usersService.findOne(params.userId);
        if (!_res) throw new BadRequestException('User not exists');
        return _res
    }

    @Post()
    public async create(@Body() createUserDto: CreateUserDto) {
        const existingUser = await this.usersService.findByEmail(createUserDto.email);
        if (existingUser?.email === createUserDto?.email) throw new BadRequestException('Email already exists');

        const user = await dbTransactionWrap(async (manager: EntityManager) => {
            const user = await this.usersService.create(
                createUserDto,
                existingUser,
                true,
                manager
            );
            return user
            // await this.emailService.sendWelcomeEmail(user.email, user.firstName, user.invitationToken);
        });

        return user;
    }

    @Put('/:userId')
    public async update(@Body() updateUserDto: UpdateUserDto, @Param() params: FindOneParams) {
        const _response = await User.findOne({ where: { id: params.userId }, });
        if (!_response) throw new BadRequestException('User not exists');
        if (_response?.email !== updateUserDto?.email) {
            const existingUser = await this.usersService.findByEmail(updateUserDto.email);
            if (existingUser?.email === updateUserDto?.email) throw new BadRequestException('Email already exists');
        }

        return await this.usersService.updateUser(params.userId, updateUserDto);
    }

    @Delete('/:userId')
    public async delete(@Param() params: FindOneParams) {
        const _response = await User.findOne({ where: { id: params.userId }, });
        if (!_response) throw new BadRequestException('User not exists');
        await this.usersService.delete(params.userId);
        return { message: 'User deleted with succesfully' }
    }
}