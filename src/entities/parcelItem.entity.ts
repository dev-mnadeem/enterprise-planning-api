import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';

import { Parcel } from './parcel.entity';
import { OrderItem } from './orderItem.entity';

@Entity()
export class ParcelItem {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  parcel_id: string;

  @Column('varchar', { length: 26 })
  item_id: string;

  @Column()
  quantity: number;

  @OneToOne(() => Parcel, (parcel) => parcel.parcel_item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parcel_id' })
  parcel: Parcel;

  @ManyToOne(() => OrderItem, (item) => item.parcel_items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  order_item: OrderItem;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
