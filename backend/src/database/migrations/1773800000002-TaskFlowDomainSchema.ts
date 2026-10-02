import { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskFlowDomainSchema1773800000002 implements MigrationInterface {
  name = 'TaskFlowDomainSchema1773800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enums with UPPERCASE values matching constants.ts
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "workspace_role_enum" AS ENUM('OWNER', 'ADMIN', 'MEMBER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "project_status_enum" AS ENUM('PLANNING', 'ACTIVE', 'COMPLETED', 'ON_HOLD');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "task_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "task_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    // 2. Workspaces Table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "workspaces" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "description" text,
        "avatar_url" character varying,
        "owner_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "UQ_workspaces_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_workspaces_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_workspaces_owner" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT
      )`,
    );

    // 3. Workspace Members Table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "workspace_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" "workspace_role_enum" NOT NULL DEFAULT 'MEMBER',
        "joined_at" TIMESTAMP NOT NULL DEFAULT now(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_workspace_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_workspace_member_unique" UNIQUE ("workspace_id", "user_id"),
        CONSTRAINT "FK_workspace_members_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workspace_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );

    // 4. Projects Table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "key" character varying NOT NULL,
        "category" character varying NOT NULL DEFAULT 'Engineering',
        "description" text,
        "status" "project_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "lead_id" uuid,
        "target_date" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_projects_workspace_key" UNIQUE ("workspace_id", "key"),
        CONSTRAINT "FK_projects_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_projects_lead" FOREIGN KEY ("lead_id") REFERENCES "users"("id") ON DELETE SET NULL
      )`,
    );

    // 5. Tasks Table (with position for Kanban drag-and-drop, zero sprint fields)
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "project_id" uuid NOT NULL,
        "task_key" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "status" "task_status_enum" NOT NULL DEFAULT 'TODO',
        "priority" "task_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "position" double precision NOT NULL DEFAULT 1000,
        "assignee_id" uuid,
        "reporter_id" uuid,
        "tags" text[] NOT NULL DEFAULT '{}',
        "due_date" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tasks_project_key" UNIQUE ("project_id", "task_key"),
        CONSTRAINT "FK_tasks_project" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_tasks_reporter" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE SET NULL
      )`,
    );

    // 6. Comments Table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "task_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "content" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_comments_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_task" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )`,
    );

    // 7. Performance Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tasks_project_status_position" ON "tasks" ("project_id", "status", "position")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_tasks_assignee" ON "tasks" ("assignee_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_projects_workspace" ON "projects" ("workspace_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_workspace_members_user" ON "workspace_members" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_comments_task" ON "comments" ("task_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "comments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tasks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "projects"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspace_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workspaces"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "task_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "task_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "project_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "workspace_role_enum"`);
  }
}
