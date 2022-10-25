import {
    Controller,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { UsersService } from 'src/services/users.service';
import { User } from 'src/decorators/user.decorator';
import { UpdateUserDto } from '@dto/user.dto';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    public async create(@User() user, @Body() updateUserDto: UpdateUserDto) {

    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:userId')
    public async delete(@User() user, @Param('userId') commentId: string) {

    }
}