import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    BaseEntity,
    OneToOne,
    JoinColumn,
} from 'typeorm';
const bcrypt = require('bcrypt');
import { File } from './file.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @BeforeInsert()
    @BeforeUpdate()
    hashPassword(): void {
        if (this.password) {
            this.password = bcrypt.hashSync(this.password, 10);
        }
    }

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'first_name' })
    firstName: string;

    @Column({ name: 'last_name' })
    lastName: string;

    @Column()
    email: string;

    @Column({ name: 'avatar_id', nullable: true, default: null })
    avatarId?: string;

    @Column({ name: 'invitation_token' })
    invitationToken: string;

    @Column({ name: 'forgot_password_token' })
    forgotPasswordToken: string;

    @Column({ name: 'password_digest' })
    password: string;

    @Column({ name: 'role' })
    role: string;

    @Column({ name: 'password_retry_count' })
    passwordRetryCount: number;

    @CreateDateColumn({ default: () => 'now()', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ default: () => 'now()', name: 'updated_at' })
    updatedAt: Date;

    @JoinColumn({ name: 'avatar_id' })
    @OneToOne(() => File, {
        nullable: true,
    })
    avatar?: File;

    isPasswordLogin: boolean;
    isSSOLogin: boolean;
}