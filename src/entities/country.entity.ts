import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { State } from './state.entity';
import { Container } from './container.entity';

@Entity()
export class Country {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column()
  status: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => State, state => state.country)
  states: State[];

  @OneToMany(() => Container, (container) => container.from_country)
  from_containers: Container[];

  @OneToMany(() => Container, (container) => container.to_country)
  to_containers: Container[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
