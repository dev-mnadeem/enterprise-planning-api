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

  @Column()
  name: string;

  @Column()
  model: string;

  @Column()
  type: number;

  @Column()
  registration_number: string;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @ManyToOne(() => VehicleType, vehicleType => vehicleType.id)
  @JoinColumn({ name: 'type' })
  vehicleType: VehicleType;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
