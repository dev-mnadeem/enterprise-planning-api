import { Entity, Column, BeforeInsert, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class VehicleType {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
