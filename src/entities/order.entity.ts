import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';

import { OrderItem } from './orderItem.entity';
import { User } from './user.entity';

@Entity()
export class Order {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  user_id: string;

  @Column()
  order_number: string;

  @Column()
  sender_name: string;

  @Column({ nullable: true })
  sender_email: string;

  @Column()
  sender_phone: string;

  @Column()
  sender_address: string;

  @Column()
  sender_city: string;

  @Column()
  receiver_name: string;

  @Column({ nullable: true })
  receiver_email: string;

  @Column()
  receiver_phone: string;

  @Column()
  receiver_address: string;

  @Column()
  receiver_city: string;

  @Column()
  total_quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sub_total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column()
  payment_type: string;

  @Column()
  payment_status: string;

  @Column('timestamp')
  payment_date: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_process', 'in_route', 'delivered', 'cancelled', 'return_in_progrss'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  locations: object[];

  @OneToMany(() => OrderItem, (item) => item.order)
  orderItems: OrderItem[];

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
