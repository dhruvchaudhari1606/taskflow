import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoardColumnsAndTaskColumnId1773800000003 implements MigrationInterface {
  name = 'AddBoardColumnsAndTaskColumnId1773800000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Board Columns Table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "board_columns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "name" character varying(100) NOT NULL,
        "color" character varying(30) NOT NULL DEFAULT '#4F46E5',
        "position" double precision NOT NULL DEFAULT 1000,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_board_columns_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_board_columns_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE
      )`,
    );

    // 2. Indexes for board_columns
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_board_columns_project_position" ON "board_columns" ("project_id", "position")`,
    );

    // 3. Add column_id to tasks table
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "column_id" uuid`,
    );

    // 4. Foreign key constraint for tasks.column_id
    await queryRunner.query(
      `DO $$ BEGIN
        ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_column" FOREIGN KEY ("column_id") REFERENCES "board_columns"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tasks_column_id" ON "tasks" ("column_id")`,
    );

    // 5. Convert tasks.status from enum to varchar(100) to allow dynamic/custom list status keys
    await queryRunner.query(
      `ALTER TABLE "tasks" ALTER COLUMN "status" TYPE character varying(100) USING "status"::text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "FK_tasks_column"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_tasks_column_id"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP COLUMN IF EXISTS "column_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "board_columns"`);
  }
}
