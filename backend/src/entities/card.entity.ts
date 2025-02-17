import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => User, user => user.assignedCards)
  responsible: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to' })
  assignedTo: User;

  @Column({ type: 'varchar', length: 20 })
  board: 'leads' | 'prospeccao' | 'negociacao' | 'contratos' | 'processos' | 'arquivados';

  @Column({ type: 'varchar', length: 20 })
  priority: 'baixa' | 'media' | 'alta';

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('simple-array', { nullable: true })
  attachments: string[];

  @Column('jsonb', { nullable: true })
  checklist: { item: string; completed: boolean }[];

  @Column('jsonb', { nullable: true })
  history: { action: string; timestamp: Date; user: string }[];

  @Column('jsonb', { nullable: true })
  comments: { text: string; user: string; timestamp: Date }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
