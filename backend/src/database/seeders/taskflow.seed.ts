import { Seeder } from 'typeorm-extension';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { Project } from '../entities/project.entity';
import { Task } from '../entities/task.entity';
import { BoardColumn } from '../entities/board-column.entity';
import { Comment } from '../entities/comment.entity';
import {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserStatus,
  WorkspaceRole,
} from '@common/constants/constants';
import {
  DEFAULT_BOARD_COLUMNS,
  findColumnByStatus,
} from '@common/utils/task-status.util';
import * as bcrypt from 'bcrypt';

type DemoTask = Pick<
  Task,
  | 'task_key'
  | 'title'
  | 'description'
  | 'status'
  | 'priority'
  | 'position'
  | 'assignee_id'
  | 'reporter_id'
  | 'tags'
>;

interface DemoUserSpec {
  email: string;
  /** Previous demo address; an existing account with it is renamed in place */
  legacyEmail: string;
  firstName: string;
  lastName: string;
}

// Demo accounts use the reserved `.test` domain so mail can never be delivered
const DEMO_USERS: DemoUserSpec[] = [
  {
    email: 'sarah.mitchell@taskflow.test',
    legacyEmail: 'sarah@northstar.io',
    firstName: 'Sarah',
    lastName: 'Mitchell',
  },
  {
    email: 'alex.rivera@taskflow.test',
    legacyEmail: 'alex@brightlabs.com',
    firstName: 'Alex',
    lastName: 'Rivera',
  },
  {
    email: 'elena.chen@taskflow.test',
    legacyEmail: 'elena@design.io',
    firstName: 'Elena',
    lastName: 'Chen',
  },
];

export default class TaskFlowSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);
    const roleRepo = dataSource.getRepository(Role);
    const workspaceRepo = dataSource.getRepository(Workspace);
    const memberRepo = dataSource.getRepository(WorkspaceMember);
    const projectRepo = dataSource.getRepository(Project);
    const taskRepo = dataSource.getRepository(Task);
    const columnRepo = dataSource.getRepository(BoardColumn);
    const commentRepo = dataSource.getRepository(Comment);

    console.log('🚀 Seeding TaskFlow SaaS Workspace & Projects...');

    const userRole =
      (await roleRepo.findOne({ where: { name: 'user' } })) || undefined;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    // 1. Seed Demo Users (renames legacy demo accounts in place, so existing
    //    workspaces, tasks and comments stay linked after the email change)
    const [sarah, alex, elena] = await Promise.all(
      DEMO_USERS.map((spec) =>
        this.ensureDemoUser(userRepo, spec, passwordHash, userRole),
      ),
    );

    // 2. Seed Workspaces
    let alphaWs = await workspaceRepo.findOne({
      where: { slug: 'alpha-operations' },
    });
    if (!alphaWs) {
      alphaWs = workspaceRepo.create({
        name: 'Alpha Operations',
        slug: 'alpha-operations',
        description:
          'Core product engineering and release operations workspace',
        owner_id: sarah.id,
      });
      alphaWs = await workspaceRepo.save(alphaWs);
      console.log('✓ Created workspace: Alpha Operations (alpha-operations)');
    }

    // Ensure every demo user belongs to the workspace (also repairs existing data)
    await this.ensureMembership(
      memberRepo,
      alphaWs.id,
      sarah.id,
      WorkspaceRole.OWNER,
    );
    await this.ensureMembership(
      memberRepo,
      alphaWs.id,
      alex.id,
      WorkspaceRole.ADMIN,
    );
    await this.ensureMembership(
      memberRepo,
      alphaWs.id,
      elena.id,
      WorkspaceRole.MEMBER,
    );

    // 3. Seed Projects
    let coreProject = await projectRepo.findOne({
      where: { workspace_id: alphaWs.id, key: 'EXEC' },
    });
    if (!coreProject) {
      coreProject = projectRepo.create({
        workspace_id: alphaWs.id,
        name: 'Platform Execution Core',
        key: 'EXEC',
        category: 'Engineering',
        description:
          'Core roadmap focusing on real-time task sync, edge caching, and mobile responsiveness.',
        status: ProjectStatus.ACTIVE,
        lead_id: sarah.id,
        target_date: new Date(Date.now() + 14 * 86400000),
      });
      coreProject = await projectRepo.save(coreProject);
      console.log('✓ Created project: Platform Execution Core (EXEC)');
    }

    let billingProject = await projectRepo.findOne({
      where: { workspace_id: alphaWs.id, key: 'BILL' },
    });
    if (!billingProject) {
      billingProject = projectRepo.create({
        workspace_id: alphaWs.id,
        name: 'Billing & Stripe Integration',
        key: 'BILL',
        category: 'Infrastructure',
        description:
          'Subscription lifecycle, webhook handling, and metered customer usage invoicing.',
        status: ProjectStatus.ACTIVE,
        lead_id: alex.id,
        target_date: new Date(Date.now() + 30 * 86400000),
      });
      billingProject = await projectRepo.save(billingProject);
      console.log('✓ Created project: Billing & Stripe Integration (BILL)');
    }

    // 4. Seed board columns, so every task is linked to a column from the start
    const coreColumns = await this.ensureBoardColumns(
      columnRepo,
      coreProject.id,
    );
    const billingColumns = await this.ensureBoardColumns(
      columnRepo,
      billingProject.id,
    );

    // 5. Seed Tasks in Platform Execution Core
    await this.seedProjectTasks(taskRepo, coreProject, coreColumns, [
      {
        task_key: 'EXEC-1',
        title: 'Configure Redis session blacklist & key expiration',
        description:
          'Implement redis blacklist cache to immediately revoke stolen or consumed refresh tokens.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        position: 1000,
        assignee_id: alex.id,
        reporter_id: sarah.id,
        tags: ['Security', 'Redis'],
      },
      {
        task_key: 'EXEC-2',
        title: 'Design dark mode theme tokens for UI system',
        description:
          'Implement high-contrast Stitch-aligned slate tokens across buttons, tables, and modals.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        position: 2000,
        assignee_id: elena.id,
        reporter_id: sarah.id,
        tags: ['UI/UX', 'Design'],
      },
      {
        task_key: 'EXEC-3',
        title: 'Audit database queries for pessimistic lock efficiency',
        description:
          'Ensure row-level locks on user sessions execute inside quick transaction blocks.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        position: 3000,
        assignee_id: alex.id,
        reporter_id: sarah.id,
        tags: ['Database', 'Postgres'],
      },
      {
        task_key: 'EXEC-4',
        title: 'Implement JWT refresh token rotation with row-level locks',
        description:
          'Guarantee race condition prevention on simultaneous token refreshes using pessimistic write locks.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        position: 1000,
        assignee_id: sarah.id,
        reporter_id: sarah.id,
        tags: ['Auth', 'Security'],
      },
      {
        task_key: 'EXEC-5',
        title: 'Add rate limiter guards on public authentication endpoints',
        description:
          'Throttle password reset and registration calls to 5 requests per minute.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        position: 2000,
        assignee_id: alex.id,
        reporter_id: sarah.id,
        tags: ['Security'],
      },
      {
        task_key: 'EXEC-6',
        title: 'Setup Sentry exception capture with PII payload scrubbing',
        description:
          'Sanitize authorization tokens, passwords, and sensitive fields before reporting.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        position: 3000,
        assignee_id: elena.id,
        reporter_id: sarah.id,
        tags: ['DevOps', 'Observability'],
      },
      {
        task_key: 'EXEC-7',
        title: 'Implement optimistic UI updates for Kanban card reordering',
        description:
          'Zero-latency visual drag-and-drop response before asynchronous server confirmation.',
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.HIGH,
        position: 1000,
        assignee_id: alex.id,
        reporter_id: sarah.id,
        tags: ['Frontend', 'React'],
      },
      {
        task_key: 'EXEC-8',
        title: 'Scaffold Next.js 16 App Router with Tailwind CSS v4',
        description:
          'Initialize application structure with clean atomic design and layout composition.',
        status: TaskStatus.DONE,
        priority: TaskPriority.URGENT,
        position: 1000,
        assignee_id: sarah.id,
        reporter_id: sarah.id,
        tags: ['Frontend'],
      },
      {
        task_key: 'EXEC-9',
        title: 'Design Stitch-inspired dual-mode B2B landing page',
        description:
          'Create interactive hero with responsive Mac shell preview, glowing badges, and metrics.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        position: 2000,
        assignee_id: elena.id,
        reporter_id: sarah.id,
        tags: ['UI/UX', 'Stitch'],
      },
    ]);

    // 6. Seed Tasks in Billing & Stripe Integration
    await this.seedProjectTasks(taskRepo, billingProject, billingColumns, [
      {
        task_key: 'BILL-1',
        title: 'Verify Stripe webhook signatures',
        description:
          'Validate every webhook with the signing secret and reject replayed events older than 5 minutes.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        position: 1000,
        assignee_id: alex.id,
        reporter_id: alex.id,
        tags: ['Backend', 'Security'],
      },
      {
        task_key: 'BILL-2',
        title: 'Build subscription plan picker',
        description:
          'Monthly/annual toggle with a seat-based price preview before checkout.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        position: 1000,
        assignee_id: elena.id,
        reporter_id: alex.id,
        tags: ['Frontend', 'UI/UX'],
      },
      {
        task_key: 'BILL-3',
        title: 'Sync seat count to Stripe on member changes',
        description:
          'Update the subscription quantity when members join or leave the workspace.',
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.HIGH,
        position: 1000,
        assignee_id: alex.id,
        reporter_id: alex.id,
        tags: ['Backend', 'Billing'],
      },
      {
        task_key: 'BILL-4',
        title: 'Configure Stripe test and live keys per environment',
        description:
          'Load keys from environment config only; separate test and live modes.',
        status: TaskStatus.DONE,
        priority: TaskPriority.MEDIUM,
        position: 1000,
        assignee_id: sarah.id,
        reporter_id: alex.id,
        tags: ['DevOps'],
      },
    ]);

    // 7. Seed a realistic discussion on a few core tasks (only if none exist yet)
    const commentsByTaskKey: Record<
      string,
      { author: User; content: string }[]
    > = {
      'EXEC-4': [
        {
          author: alex,
          content:
            'Reproduced the race locally: two parallel refresh calls both succeeded before the lock change.',
        },
        {
          author: sarah,
          content:
            'Pessimistic write lock is in. Concurrent refreshes now serialize and the second request is rejected. Adding a reuse-detection test next.',
        },
      ],
      'EXEC-7': [
        {
          author: alex,
          content:
            'PR is up. Cards move instantly and roll back if the server rejects the reorder.',
        },
        {
          author: elena,
          content:
            'Tested on a throttled connection and the snap-back feels smooth. One nit: the drag shadow flickers in dark mode.',
        },
        {
          author: alex,
          content: 'Fixed the shadow token. Ready for another look.',
        },
      ],
      'EXEC-1': [
        {
          author: sarah,
          content:
            'Let’s match the blacklist TTL to the refresh token lifetime so entries expire on their own.',
        },
      ],
      'EXEC-6': [
        {
          author: elena,
          content:
            'Scrubbing rules now cover passwords, tokens and auth headers. Still verifying multipart request bodies.',
        },
      ],
      'EXEC-9': [
        {
          author: sarah,
          content:
            'Shipped to production and it looks great on mobile too. Thanks Elena!',
        },
      ],
    };

    const discussedTasks = await taskRepo.find({
      where: {
        project_id: coreProject.id,
        task_key: In(Object.keys(commentsByTaskKey)),
      },
    });
    const existingCommentCount =
      discussedTasks.length > 0
        ? await commentRepo.count({
            where: { task_id: In(discussedTasks.map((t) => t.id)) },
          })
        : 0;

    if (discussedTasks.length > 0 && existingCommentCount === 0) {
      const comments = discussedTasks.flatMap((task) =>
        (commentsByTaskKey[task.task_key] || []).map((c) =>
          commentRepo.create({
            task_id: task.id,
            user_id: c.author.id,
            content: c.content,
          }),
        ),
      );
      // Saved one by one so creation timestamps follow conversation order
      for (const comment of comments) {
        await commentRepo.save(comment);
      }
      console.log(`✓ Seeded ${comments.length} task comments`);
    }

    console.log('🎉 TaskFlow seeding finished successfully!');
  }

  /**
   * Return the demo user for `spec`: the existing account, a legacy account
   * renamed to the new address, or a newly created one.
   */
  private async ensureDemoUser(
    userRepo: Repository<User>,
    spec: DemoUserSpec,
    passwordHash: string,
    userRole?: Role,
  ): Promise<User> {
    const name = `${spec.firstName} ${spec.lastName}`;
    const [current, legacy] = await Promise.all([
      userRepo.findOne({ where: { email: spec.email } }),
      userRepo.findOne({ where: { email: spec.legacyEmail } }),
    ]);

    if (current) {
      if (legacy) {
        console.warn(
          `⚠ Both ${spec.legacyEmail} and ${spec.email} exist; using ${spec.email}. ` +
            `The legacy account can be removed manually.`,
        );
      }
      return current;
    }

    if (legacy) {
      legacy.email = spec.email;
      legacy.name = name;
      legacy.first_name = spec.firstName;
      legacy.last_name = spec.lastName;
      const renamed = await userRepo.save(legacy);
      console.log(`✓ Renamed demo user: ${spec.legacyEmail} → ${spec.email}`);
      return renamed;
    }

    const created = await userRepo.save(
      userRepo.create({
        name,
        first_name: spec.firstName,
        last_name: spec.lastName,
        email: spec.email,
        password: passwordHash,
        roles: userRole ? [userRole] : [],
        status: UserStatus.ACTIVE,
        email_verified_at: new Date(),
        language: 'en',
      }),
    );
    console.log(`✓ Created demo user: ${name} (${spec.email})`);
    return created;
  }

  /** Add a user to a workspace with the given role, unless already a member. */
  private async ensureMembership(
    memberRepo: Repository<WorkspaceMember>,
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<void> {
    const existing = await memberRepo.findOne({
      where: { workspace_id: workspaceId, user_id: userId },
    });
    if (existing) return;
    await memberRepo.save(
      memberRepo.create({ workspace_id: workspaceId, user_id: userId, role }),
    );
    console.log(`✓ Added ${role} to workspace`);
  }

  /** Return the project's board columns, creating the defaults if it has none. */
  private async ensureBoardColumns(
    columnRepo: Repository<BoardColumn>,
    projectId: string,
  ): Promise<BoardColumn[]> {
    const existing = await columnRepo.find({
      where: { project_id: projectId },
      order: { position: 'ASC' },
    });
    if (existing.length > 0) return existing;

    return columnRepo.save(
      DEFAULT_BOARD_COLUMNS.map((c) =>
        columnRepo.create({
          project_id: projectId,
          name: c.name,
          color: c.color,
          position: c.position,
        }),
      ),
    );
  }

  /** Create demo tasks for a project (only if it has none), linked to their status column. */
  private async seedProjectTasks(
    taskRepo: Repository<Task>,
    project: Project,
    columns: BoardColumn[],
    demoTasks: DemoTask[],
  ): Promise<void> {
    const existingTaskCount = await taskRepo.count({
      where: { project_id: project.id },
    });
    if (existingTaskCount > 0) return;

    await taskRepo.save(
      demoTasks.map((t) =>
        taskRepo.create({
          ...t,
          project_id: project.id,
          column_id: findColumnByStatus(columns, t.status)?.id ?? null,
        }),
      ),
    );
    console.log(`✓ Seeded ${demoTasks.length} Kanban tasks in ${project.name}`);
  }
}
