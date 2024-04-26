import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { UserRole } from './userRole.entity';

@Entity()
export class User {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;
  
  @Column({ type: 'varchar', length: 26 })
  role_id: string;
  
  @Column({ type: 'varchar', length: 26 })
  area_id: string;
  
  @Column()
  username: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  branch: string;

  @Column()
  phone_number: string;

  @Column()
  mobile_number: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => UserRole, (userRole) => userRole.id)
  @JoinColumn({ name: 'user_id' })
  user_role: UserRole;

  @ManyToOne(() => UserRole, (userRole) => userRole.id)
  @JoinColumn({ name: 'area_id' })
  area: UserRole;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
