import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Department } from './department.entity';
import { Message } from './message.entity';
import { Card } from './card.entity';
import bcrypt from 'bcryptjs';

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  AGENT = 'agent'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.AGENT
  })
  role: UserRole;

  @ManyToMany(() => Department)
  @JoinTable({
    name: 'user_departments',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'department_id', referencedColumnName: 'id' }
  })
  departments: Department[];

  @ManyToMany(() => Department)
  @JoinTable({
    name: 'supervisor_departments',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'department_id', referencedColumnName: 'id' }
  })
  supervisedDepartments: Department[];

  @OneToMany(() => Message, message => message.user)
  messages: Message[];

  @OneToMany(() => Card, card => card.assignedTo)
  assignedCards: Card[];

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Hash da senha antes de inserir/atualizar
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Só faz hash se a senha foi modificada
    if (this.password && this.password.length < 60) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  // Método para comparar senha
  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // Método para retornar usuário sem a senha
  toJSON() {
    const { password, ...user } = this;
    return user;
  }

  // Métodos auxiliares
  isSupervisor(): boolean {
    return this.role === UserRole.SUPERVISOR || this.role === UserRole.ADMIN;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
