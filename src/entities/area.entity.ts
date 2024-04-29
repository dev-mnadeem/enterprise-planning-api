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
import { City } from './city.entity';

@Entity()
export class Area {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column({ type: 'varchar', length: 26 })
  country_id: string;
  
  @Column({ type: 'varchar', length: 26 })
  city_id: string;
  
  @Column()
  name: string;

  @Column()
  postal_code: string;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

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
