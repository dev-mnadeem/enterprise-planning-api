import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { Order } from './order.entity';

@Entity()
export class OrderHistory {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  order_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  city: string;
  
  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  geo_location: string;

  @Column('json')
  from_location: object;

  @Column('json', { nullable: true })
  to_location: object;

  @Column('json', { nullable: true })
  vehicle: object;

  @Column({
    type: 'enum',
    enum: ['in', 'out'],
    default: 'in',
  })
  status: string;

  @ManyToOne(() => Order, (order) => order.history)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
