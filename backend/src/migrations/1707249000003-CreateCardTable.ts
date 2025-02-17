import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCardTable1707249000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "cards",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "title",
                        type: "varchar",
                        length: "255"
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true
                    },
                    {
                        name: "responsible_id",
                        type: "uuid"
                    },
                    {
                        name: "board",
                        type: "varchar",
                        length: "20"
                    },
                    {
                        name: "priority",
                        type: "varchar",
                        length: "20"
                    },
                    {
                        name: "tags",
                        type: "text",
                        isArray: true,
                        isNullable: true
                    },
                    {
                        name: "attachments",
                        type: "text",
                        isArray: true,
                        isNullable: true
                    },
                    {
                        name: "checklist",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "history",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "comments",
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

        // Adicionar foreign key
        await queryRunner.createForeignKey(
            "cards",
            new TableForeignKey({
                columnNames: ["responsible_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "SET NULL"
            })
        );

        // Adicionar check constraint para board
        await queryRunner.query(`
            ALTER TABLE cards 
            ADD CONSTRAINT valid_board 
            CHECK (board IN ('leads', 'prospeccao', 'negociacao', 'contratos', 'processos', 'arquivados'))
        `);

        // Adicionar check constraint para priority
        await queryRunner.query(`
            ALTER TABLE cards 
            ADD CONSTRAINT valid_priority 
            CHECK (priority IN ('baixa', 'media', 'alta'))
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("cards");
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("responsible_id") !== -1);
        await queryRunner.dropForeignKey("cards", foreignKey);
        await queryRunner.dropTable("cards");
    }
}
