import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';
import { UserRole } from '../types/auth';

export class CreateUsersTable1707184894000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cria o enum de roles
    await queryRunner.query(`
      CREATE TYPE user_role AS ENUM ('owner', 'contractor', 'employee')
    `);

    // Cria a tabela de usuários
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()'
          },
          {
            name: 'name',
            type: 'varchar'
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true
          },
          {
            name: 'password',
            type: 'varchar'
          },
          {
            name: 'role',
            type: 'user_role',
            default: `'${UserRole.EMPLOYEE}'`
          },
          {
            name: 'active',
            type: 'boolean',
            default: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()'
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()'
          }
        ]
      }),
      true
    );

    // Cria o índice para o email
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_users_email',
        columnNames: ['email'],
        isUnique: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove índices
    await queryRunner.dropIndex('users', 'IDX_users_email');

    // Remove a tabela
    await queryRunner.dropTable('users');

    // Remove o enum
    await queryRunner.query(`DROP TYPE user_role`);
  }
}
