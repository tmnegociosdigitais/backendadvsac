import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { WhatsAppInstanceStatus } from '../types/department';

@Entity('whatsapp_instances')
export class WhatsAppInstance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: WhatsAppInstanceStatus,
        default: WhatsAppInstanceStatus.DISCONNECTED
    })
    status: WhatsAppInstanceStatus;

    @Column({ nullable: true })
    qrCode?: string;

    @Column({ nullable: true })
    lastConnection?: Date;

    @Column()
    ownerId: string;

    @ManyToOne(() => User)
    owner: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Métodos auxiliares
    isConnected(): boolean {
        return this.status === WhatsAppInstanceStatus.CONNECTED;
    }

    needsQRCode(): boolean {
        return this.status === WhatsAppInstanceStatus.DISCONNECTED || 
               this.status === WhatsAppInstanceStatus.ERROR;
    }
}
