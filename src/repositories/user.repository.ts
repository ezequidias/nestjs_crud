import { Repository, EntityRepository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    public async createUser(
        createUserDto: CreateUserDto,
        userId: string,
    ): Promise<User> {
        const { first_name, last_name } = createUserDto;

        const _user = new User();
        _user.firstName = first_name;
        _user.lastName = last_name;

        await _user.save();
        return _user;
    }

    public async editUser(updateUserDto: UpdateUserDto, editedUser: User): Promise<User> {
        const { first_name, last_name } = updateUserDto;

        editedUser.firstName = first_name;
        editedUser.lastName = last_name;
        await editedUser.save();

        return editedUser;
    }
}