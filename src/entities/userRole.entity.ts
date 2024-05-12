import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
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

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
