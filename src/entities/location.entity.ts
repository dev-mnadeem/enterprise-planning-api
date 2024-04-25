import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { ulid } from 'ulid';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity()
export class Location {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  country_id: number;

  @Column()
  city_id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  geo_location: string;

  @Column()
  location_type: number;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @ManyToOne(() => Country, country => country.id)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => City, city => city.id)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
