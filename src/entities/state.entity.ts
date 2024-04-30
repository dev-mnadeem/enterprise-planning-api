import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ulid } from 'ulid';
import { Country } from './country.entity';
import { City } from './city.entity';

@Entity()
export class State {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column({ type: 'varchar', length: 26 })
  country_id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => Country, country => country.states)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @OneToMany(() => City, city => city.state)
  cities: City[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
