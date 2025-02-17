import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from './department.entity';
import { User } from './user.entity';
import { Message } from './message.entity';
import { QueuePriority, QueueStatus } from '../types/queue.types';

@Entity('queue_items')
export class QueueItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    ticketId: string;

    @Column()
    departmentId: string;

    @ManyToOne(() => Department)
    @JoinColumn({ name: 'departmentId' })
    department: Department;

    @Column({
        type: 'enum',
        enum: QueuePriority,
        default: QueuePriority.NORMAL
    })
    priority: QueuePriority;

    @CreateDateColumn()
    enteredAt: Date;

    @UpdateDateColumn()
    lastUpdate: Date;

    @Column({
        type: 'enum',
        enum: QueueStatus,
        default: QueueStatus.WAITING
    })
    status: QueueStatus;

    @Column({ nullable: true })
    assignedTo?: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assignedTo' })
    assignedAgent?: User;

    @Column('jsonb')
    metadata: {
        messageCount: number;
        firstMessage: Message;
        lastMessage: Message;
        source: string;
        tags: string[];
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
