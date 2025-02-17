import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('departments')
export class Department {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'supervisor_id' })
    supervisor: User;

    @OneToMany(() => Message, message => message.department)
    messages: Message[];

    @Column({ default: true })
    active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
