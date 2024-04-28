import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { ulid } from 'ulid';
import { City } from './city.entity';
import { Area } from './area.entity';

@Entity()
export class Country {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => City, city => city.country)
  cities: Country;

  @OneToMany(() => Area, area => area.country)
  area: Area;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
