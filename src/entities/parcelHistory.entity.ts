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
import { Parcel } from './parcel.entity';

@Entity()
export class ParcelHistory {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  parcel_id: string;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Parcel, (parcel) => parcel.history)
  @JoinColumn({ name: 'parcel_id' })
  parcel: Parcel;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
