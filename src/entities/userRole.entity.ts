import { BeforeInsert, BeforeRemove, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { User } from './user.entity';

@Entity()
export class UserRole {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.user_role)
  users: User[];

  @Column({ type: 'jsonb', nullable: true })
  permissions: object[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }

  @BeforeRemove()
  async checkUsersBeforeRemove() {
    if (this.users && this.users.length > 0) {
      throw new Error('Cannot delete role because it is assigned to one or more users.');
    }
  }
}
