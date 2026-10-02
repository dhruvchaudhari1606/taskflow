import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkspaceInvitations1773800000004 implements MigrationInterface {
  name = 'AddWorkspaceInvitations1773800000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create invitation status enum
    await queryRunner.query(
      `DO $$ BEGIN
        CREATE TYPE "workspace_invitation_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`,
    );

    // 2. Create workspace_invitations table
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "workspace_invitations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspace_id" uuid NOT NULL,
        "email" character varying(255) NOT NULL,
        "role" "workspace_role_enum" NOT NULL DEFAULT 'MEMBER',
        "token" character varying(128) NOT NULL,
        "inviter_id" uuid,
        "status" "workspace_invitation_status_enum" NOT NULL DEFAULT 'PENDING',
        "expires_at" TIMESTAMP NOT NULL,
        "accepted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_workspace_invitations_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_workspace_invitations_token" UNIQUE ("token"),
        CONSTRAINT "FK_workspace_invitations_workspace" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_workspace_invitations_inviter" FOREIGN KEY ("inviter_id") REFERENCES "users"("id") ON DELETE SET NULL
      )`,
    );

    // 3. Performance Indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_workspace_invitations_workspace_id" ON "workspace_invitations" ("workspace_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_workspace_invitations_email" ON "workspace_invitations" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_workspace_invitations_token" ON "workspace_invitations" ("token")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_workspace_invitations_status" ON "workspace_invitations" ("status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "workspace_invitations"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "workspace_invitation_status_enum"`,
    );
  }
}
