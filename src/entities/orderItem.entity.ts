import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';

import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  order_id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  courier_type: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  weight: number;

  @Column()
  weight_type: string;

  @Column('decimal', { precision: 10, scale: 2 })
  length: number;

  @Column('decimal', { precision: 10, scale: 2 })
  width: number;

  @Column('decimal', { precision: 10, scale: 2 })
  height: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
