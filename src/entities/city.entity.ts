import {
  Entity,
  Column,
  CreateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { Country } from './country.entity';

@Entity()
export class City {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column({ type: 'varchar', length: 26 })
  country_id: number;

  @Column()
  city_name: string;

  @ManyToOne(() => Country, country => country.id)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
