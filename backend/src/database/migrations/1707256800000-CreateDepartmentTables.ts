import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDepartmentTables1707256800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Criar tabela de instâncias WhatsApp
        await queryRunner.createTable(new Table({
            name: "whatsapp_instances",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["connected", "disconnected", "connecting", "error"],
                    default: "'disconnected'"
                },
                {
                    name: "qr_code",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "last_connection",
                    type: "timestamp",
                    isNullable: true
                },
                {
                    name: "owner_id",
                    type: "uuid"
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));

        // Criar tabela de departamentos
        await queryRunner.createTable(new Table({
            name: "departments",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "name",
                    type: "varchar"
                },
                {
                    name: "description",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "whatsapp_instance_id",
                    type: "uuid",
                    isNullable: true
                },
                {
                    name: "active",
                    type: "boolean",
                    default: true
                },
                {
                    name: "created_at",
                    type: "timestamp",
                    default: "now()"
                },
                {
                    name: "updated_at",
                    type: "timestamp",
                    default: "now()"
                }
            ]
        }));

        // Criar tabela de junção para supervisores
        await queryRunner.createTable(new Table({
            name: "department_supervisors",
            columns: [
                {
                    name: "department_id",
                    type: "uuid"
                },
                {
                    name: "user_id",
                    type: "uuid"
                }
            ]
        }));

        // Criar tabela de junção para membros
        await queryRunner.createTable(new Table({
            name: "department_members",
            columns: [
                {
                    name: "department_id",
                    type: "uuid"
                },
                {
                    name: "user_id",
                    type: "uuid"
                }
            ]
        }));

        // Adicionar chaves estrangeiras
        await queryRunner.createForeignKey("whatsapp_instances", new TableForeignKey({
            columnNames: ["owner_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("departments", new TableForeignKey({
            columnNames: ["whatsapp_instance_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "whatsapp_instances",
            onDelete: "SET NULL"
        }));

        await queryRunner.createForeignKey("department_supervisors", new TableForeignKey({
            columnNames: ["department_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "departments",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("department_supervisors", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("department_members", new TableForeignKey({
            columnNames: ["department_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "departments",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("department_members", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remover chaves estrangeiras primeiro
        const tables = [
            "department_members",
            "department_supervisors",
            "departments",
            "whatsapp_instances"
        ];

        for (const table of tables) {
            const foreignKeys = await queryRunner.getTable(table).then(table => table?.foreignKeys);
            if (foreignKeys) {
                for (const foreignKey of foreignKeys) {
                    await queryRunner.dropForeignKey(table, foreignKey);
                }
            }
        }

        // Remover tabelas
        await queryRunner.dropTable("department_members");
        await queryRunner.dropTable("department_supervisors");
        await queryRunner.dropTable("departments");
        await queryRunner.dropTable("whatsapp_instances");
    }
}
