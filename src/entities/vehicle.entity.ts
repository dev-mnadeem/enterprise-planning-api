import {
  Entity,
  Column,
  CreateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { User } from './user.entity';
import { VehicleType } from './vehicleType.entity';

@Entity()
export class Vehicle {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column({ type: 'varchar', length: 26 })
  driver_id: string;

  @Column('varchar', { length: 26 })
  vehicle_type_id: string;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column()
  registration_number: string;

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => User, user => user.vehicles)
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @ManyToOne(() => VehicleType, type => type.vehicles)
  @JoinColumn({ name: 'vehicle_type_id' })
  vehicle_type: VehicleType;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
