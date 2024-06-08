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
  JoinTable,
} from 'typeorm';
import { ulid } from 'ulid';
import { UserRole } from './userRole.entity';
import { Location } from './location.entity';
import { City } from './city.entity';
import { Order } from './order.entity';

@Entity()
export class User {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;
  
  @Column({ type: 'varchar', length: 26 })
  role_id: string;

  @Column({ type: 'varchar', length: 26, nullable: true })
  city_id: string;
  
  @Column()
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', unique: true })
  phone_number: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  geo_location: string
  
  @Column({ default: true })
  status: boolean

  @Column({ type: 'jsonb', nullable: true })
  permissions: object[];

  @Column({ type: 'varchar', nullable: true })
  refresh_token: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToMany(() => Location, (location) => location.users)
  @JoinTable()
  locations: Location[];

  @ManyToOne(() => UserRole, (userRole) => userRole.users)
  @JoinColumn({ name: 'role_id' })
  user_role: UserRole;

  @ManyToOne(() => City, (city) => city.users)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Order, (order) => order.sender)
  sender_orders: Order[];

  @OneToMany(() => Order, (order) => order.receiver)
  receiver_orders: Order[];

  @OneToMany(() => Location, location => location.deleted_by)
  deleted_locations: Location[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
