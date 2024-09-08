import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ParcelItem } from './parcelItem.entity';
import { ParcelHistory } from './parcelHistory.entity';
import { Order } from './order.entity';
ParcelHistory

@Entity()
export class Parcel {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  order_id: string;

  @Column()
  parcel_number: string;

  @ManyToOne(() => Order, (order) => order.order_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToMany(() => ParcelHistory, (history) => history.parcel)
  history: ParcelHistory[];

  @OneToOne(() => ParcelItem, (item) => item.parcel, { cascade: true, onDelete: 'CASCADE' })
  parcel_item: ParcelItem;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deleted_at: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
