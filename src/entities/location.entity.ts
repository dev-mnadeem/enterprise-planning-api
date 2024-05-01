import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { City } from './city.entity';
import { User } from './user.entity';
import { LocationType } from './locationType.entity';

@Entity()
export class Location {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column('varchar', { length: 26 })
  location_type_id: string;

  @Column('varchar', { length: 26 })
  city_id: string;
  
  @Column('varchar', { length: 26, nullable: true })
  deleted_by_id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  geo_location: string;

  @Column()
  status: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp' })
  deleted_at: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => LocationType, (locationType) => locationType.locations)
  @JoinColumn({ name: 'location_type_id' })
  location_type: LocationType;

  @ManyToOne(() => City, (city) => city.locations)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @ManyToOne(() => User, (user) => user.deleted_locations)
  @JoinColumn({ name: 'deleted_by_id' })
  deleted_by: User;

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
