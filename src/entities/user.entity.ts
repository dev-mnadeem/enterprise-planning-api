import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { ulid } from 'ulid';
import { UserRole } from './userRole.entity';
import { Location } from './location.entity';
import { Address } from './address.entity';

@Entity()
export class User {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;
  
  @Column({ type: 'varchar', length: 26 })
  role_id: string;
  
  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  branch: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  mobile_number: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @Column({ type: 'array', default: [] })
  permissions: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToMany(() => Location, (location) => location.users)
  locations: Location[];

  @ManyToOne(() => UserRole, (userRole) => userRole.users)
  @JoinColumn({ name: 'role_id' })
  user_role: UserRole;

  @OneToMany(() => Location, location => location.deleted_by)
  deleted_locations: Location[];

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
