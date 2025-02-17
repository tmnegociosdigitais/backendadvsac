import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageTable1707249000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "messages",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "client_id",
                        type: "uuid"
                    },
                    {
                        name: "content",
                        type: "text"
                    },
                    {
                        name: "timestamp",
                        type: "timestamp",
                        default: "now()"
                    },
                    {
                        name: "direction",
                        type: "varchar",
                        length: "10"
                    },
                    {
                        name: "status",
                        type: "varchar",
                        length: "10"
                    },
                    {
                        name: "evolution_api_message_id",
                        type: "varchar",
                        length: "100"
                    },
                    {
                        name: "message_type",
                        type: "varchar",
                        length: "20"
                    },
                    {
                        name: "media_url",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "quoted_message_id",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "message_order",
                        type: "integer"
                    },
                    {
                        name: "retry_count",
                        type: "integer",
                        default: 0
                    },
                    {
                        name: "webhook_events",
                        type: "jsonb",
                        isNullable: true
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

        // Adicionar foreign keys
        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["client_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "clients",
                onDelete: "CASCADE"
            })
        );

        await queryRunner.createForeignKey(
            "messages",
            new TableForeignKey({
                columnNames: ["quoted_message_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "messages",
                onDelete: "SET NULL"
            })
        );

        // Adicionar check constraint para limitar mensagens por cliente
        await queryRunner.query(`
            ALTER TABLE messages 
            ADD CONSTRAINT messages_per_client 
            CHECK (message_order <= 100)
        `);

        // Adicionar check constraint para message_type
        await queryRunner.query(`
            ALTER TABLE messages 
            ADD CONSTRAINT valid_message_type 
            CHECK (message_type IN ('text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'sticker'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("messages");
        const foreignKeys = table.foreignKeys;
        
        for (const foreignKey of foreignKeys) {
            await queryRunner.dropForeignKey("messages", foreignKey);
        }
        
        await queryRunner.dropTable("messages");
    }
}
