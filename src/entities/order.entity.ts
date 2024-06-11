import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
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
import { City } from './city.entity';
import { OrderHistory } from './orderHistory.entity';

@Entity()
export class Order {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  user_id: string;

  @Column()
  order_number: string;

  @Column({ type: 'timestamp', nullable: true })
  shipping_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  collection_time: Date;

  @Column('varchar', { length: 26 })
  sender_id: string;

  @Column()
  sender_name: string;

  @Column({ nullable: true })
  sender_email: string;

  @Column()
  sender_phone: string;

  @Column()
  sender_address: string;

  @Column('varchar', { length: 26 })
  sender_city_id: string;

  @Column('varchar', { length: 26 })
  receiver_id: string;

  @Column()
  receiver_name: string;

  @Column({ nullable: true })
  receiver_email: string;

  @Column()
  receiver_phone: string;

  @Column()
  receiver_address: string;

  @Column('varchar', { length: 26 })
  receiver_city_id: string;

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

  @Column({ type: 'json', nullable: true })
  package: object;

  @OneToMany(() => OrderHistory, (history) => history.order)
  history: OrderHistory[];

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, onDelete: 'CASCADE' })
  orderItems: OrderItem[];

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.sender_orders)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receiver_orders)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @ManyToOne(() => City, (city) => city.city_sender_orders)
  @JoinColumn({ name: 'sender_city_id' })
  sender_city: City;

  @ManyToOne(() => City, (city) => city.city_receiver_orders)
  @JoinColumn({ name: 'receiver_city_id' })
  receiver_city: City;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deleted_at: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
