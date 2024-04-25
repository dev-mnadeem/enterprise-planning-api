import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn
} from 'typeorm';
import { ulid } from 'ulid';

@Entity()
export class Country {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column()
  status: boolean;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
