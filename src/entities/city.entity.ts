import {
  Entity,
  Column,
  CreateDateColumn,
  BeforeInsert,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ulid } from 'ulid';
import { State } from './state.entity';
import { Area } from './area.entity';
import { Location } from './location.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity()
export class City {
  @PrimaryColumn('varchar', { length: 26 })
  id: string;

  @Column({ type: 'varchar', length: 26 })
  state_id: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => State, state => state.cities)
  @JoinColumn({ name: 'state_id' })
  state: State;

  @OneToMany(() => Area, area => area.city)
  area: Area;

  @OneToMany(() => Location, location => location.city)
  locations: Location[];

  @OneToMany(() => User, (user) => user.city)
  users: User[];

  @OneToMany(() => Order, (order) => order.sender_city)
  city_sender_orders: Order[];

  @OneToMany(() => Order, (order) => order.receiver_city)
  city_receiver_orders: Order[];

  @BeforeInsert()
  generateUlid() {
    this.id = ulid();
  }
}
