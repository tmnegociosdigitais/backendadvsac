import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  whatsappNumber: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'timestamp' })
  lastInteraction: Date;

  @Column({ type: 'text', nullable: true })
  lastMessage: string;

  @Column({ type: 'varchar', length: 10 })
  conversationStatus: 'active' | 'inactive';

  @OneToMany(() => Message, message => message.client)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
