import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { Project } from '../entities/project.entity';
import { Task } from '../entities/task.entity';
import {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserStatus,
  WorkspaceRole,
} from '@common/constants/constants';
import * as bcrypt from 'bcrypt';

export default class TaskFlowSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);
    const roleRepo = dataSource.getRepository(Role);
    const workspaceRepo = dataSource.getRepository(Workspace);
    const memberRepo = dataSource.getRepository(WorkspaceMember);
    const projectRepo = dataSource.getRepository(Project);
    const taskRepo = dataSource.getRepository(Task);

    console.log('🚀 Seeding TaskFlow SaaS Workspace & Projects...');

    const userRole =
      (await roleRepo.findOne({ where: { name: 'user' } })) || undefined;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash('password123', saltRounds);

    // 1. Seed Demo Users
    let sarah = await userRepo.findOne({
      where: { email: 'sarah@northstar.io' },
    });
    if (!sarah) {
      sarah = userRepo.create({
        name: 'Sarah Mitchell',
        first_name: 'Sarah',
        last_name: 'Mitchell',
        email: 'sarah@northstar.io',
        password: passwordHash,
        roles: userRole ? [userRole] : [],
        status: UserStatus.ACTIVE,
        email_verified_at: new Date(),
        language: 'en',
      });
      sarah = await userRepo.save(sarah);
      console.log('✓ Created demo user: Sarah Mitchell (sarah@northstar.io)');
    }

    let alex = await userRepo.findOne({
      where: { email: 'alex@brightlabs.com' },
    });
    if (!alex) {
      alex = userRepo.create({
        name: 'Alex Rivera',
        first_name: 'Alex',
        last_name: 'Rivera',
        email: 'alex@brightlabs.com',
        password: passwordHash,
        roles: userRole ? [userRole] : [],
        status: UserStatus.ACTIVE,
        email_verified_at: new Date(),
        language: 'en',
      });
      alex = await userRepo.save(alex);
      console.log('✓ Created demo user: Alex Rivera (alex@brightlabs.com)');
    }

    let elena = await userRepo.findOne({ where: { email: 'elena@design.io' } });
    if (!elena) {
      elena = userRepo.create({
        name: 'Elena Chen',
        first_name: 'Elena',
        last_name: 'Chen',
        email: 'elena@design.io',
        password: passwordHash,
        roles: userRole ? [userRole] : [],
        status: UserStatus.ACTIVE,
        email_verified_at: new Date(),
        language: 'en',
      });
      elena = await userRepo.save(elena);
      console.log('✓ Created demo user: Elena Chen (elena@design.io)');
    }

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

      await memberRepo.save(
        memberRepo.create({
          workspace_id: alphaWs.id,
          user_id: sarah.id,
          role: WorkspaceRole.OWNER,
        }),
      );

      await memberRepo.save(
        memberRepo.create({
          workspace_id: alphaWs.id,
          user_id: alex.id,
          role: WorkspaceRole.ADMIN,
        }),
      );

      await memberRepo.save(
        memberRepo.create({
          workspace_id: alphaWs.id,
          user_id: elena.id,
          role: WorkspaceRole.MEMBER,
        }),
      );
      console.log('✓ Created workspace: Alpha Operations (alpha-operations)');
    }

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

    // 4. Seed Tasks in Platform Execution Core
    const existingTaskCount = await taskRepo.count({
      where: { project_id: coreProject.id },
    });

    if (existingTaskCount === 0) {
      const demoTasks = [
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
      ];

      for (const t of demoTasks) {
        const task = taskRepo.create({
          ...t,
          project_id: coreProject.id,
        });
        await taskRepo.save(task);
      }
      console.log(
        `✓ Seeded ${demoTasks.length} Kanban tasks in Platform Execution Core`,
      );
    }

    console.log('🎉 TaskFlow seeding finished successfully!');
  }
}
