import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './client.entity';
import { User } from './user.entity';
import { Department } from './department.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Client, client => client.messages)
  client: Client;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'varchar', length: 10 })
  direction: 'incoming' | 'outgoing';

  @Column({ type: 'varchar', length: 10 })
  status: 'sent' | 'delivered' | 'read';

  @Column({ type: 'varchar', length: 100 })
  evolutionApiMessageId: string;

  @Column({ type: 'integer' })
  messageOrder: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
