import { Entity, Column, BeforeInsert, PrimaryColumn, OneToMany } from 'typeorm';
import { ulid } from 'ulid';
import { Vehicle } from './vehicle.entity';

@Entity()
export class VehicleType {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @OneToMany(() => Vehicle, vehicle => vehicle.vehicle_type)
  vehicles: Vehicle[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
