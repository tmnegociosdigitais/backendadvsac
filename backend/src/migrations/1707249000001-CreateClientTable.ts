import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateClientTable1707249000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "clients",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "whatsapp_number",
                        type: "varchar",
                        length: "20",
                        isUnique: true
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100"
                    },
                    {
                        name: "last_interaction",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "last_message",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "conversation_status",
                        type: "varchar",
                        length: "10"
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
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("clients");
    }
}
