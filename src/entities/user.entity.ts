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
import { Area } from './area.entity';

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

  @Column({ nullable: true })
  branch: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ nullable: true })
  mobile_number: string;

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => UserRole, (userRole) => userRole.users)
  @JoinColumn({ name: 'role_id' })
  user_role: UserRole;

  @ManyToOne(() => Area, (area) => area.users)
  @JoinColumn({ name: 'area_id' })
  area: Area;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
