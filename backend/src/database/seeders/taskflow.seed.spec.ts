import TaskFlowSeeder from './taskflow.seed';
import { WorkspaceRole } from '@common/constants/constants';

type Row = Record<string, unknown>;

/** Minimal in-memory stand-in for a TypeORM repository (findOne/create/save). */
function fakeRepo(initial: Row[] = []) {
  const rows: Row[] = initial.map((r) => ({ ...r }));
  return {
    rows,
    findOne: jest.fn(({ where }: { where: Row }) =>
      Promise.resolve(
        rows.find((r) => Object.entries(where).every(([k, v]) => r[k] === v)) ??
          null,
      ),
    ),
    create: jest.fn((data: Row) => ({ ...data })),
    save: jest.fn((entity: Row) => {
      if (!entity.id) {
        entity.id = `id-${rows.length + 1}`;
        rows.push(entity);
      }
      return Promise.resolve(entity);
    }),
  };
}

const spec = {
  email: 'sarah.mitchell@taskflow.test',
  legacyEmail: 'sarah@northstar.io',
  firstName: 'Sarah',
  lastName: 'Mitchell',
};

// Private helpers are exercised directly; they hold the migration logic.
type SeederInternals = {
  ensureDemoUser: (...args: unknown[]) => Promise<Row>;
  ensureMembership: (...args: unknown[]) => Promise<void>;
};

describe('TaskFlowSeeder demo data helpers', () => {
  const seeder = new TaskFlowSeeder() as unknown as SeederInternals;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  describe('ensureDemoUser', () => {
    it('renames a legacy demo account in place, keeping its id', async () => {
      const repo = fakeRepo([
        { id: 'u-1', email: 'sarah@northstar.io', name: 'Old Name' },
      ]);

      const user = await seeder.ensureDemoUser(repo, spec, 'hash');

      expect(user.id).toBe('u-1');
      expect(user.email).toBe('sarah.mitchell@taskflow.test');
      expect(user.name).toBe('Sarah Mitchell');
      expect(repo.rows).toHaveLength(1);
    });

    it('returns the existing account when the new email already exists', async () => {
      const repo = fakeRepo([
        { id: 'u-2', email: 'sarah.mitchell@taskflow.test' },
      ]);

      const user = await seeder.ensureDemoUser(repo, spec, 'hash');

      expect(user.id).toBe('u-2');
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('prefers the new account and warns when both addresses exist', async () => {
      const repo = fakeRepo([
        { id: 'u-old', email: 'sarah@northstar.io' },
        { id: 'u-new', email: 'sarah.mitchell@taskflow.test' },
      ]);

      const user = await seeder.ensureDemoUser(repo, spec, 'hash');

      expect(user.id).toBe('u-new');
      expect(console.warn).toHaveBeenCalled();
    });

    it('creates a verified, active account when none exists', async () => {
      const repo = fakeRepo();

      const user = await seeder.ensureDemoUser(repo, spec, 'hash');

      expect(user).toMatchObject({
        email: 'sarah.mitchell@taskflow.test',
        name: 'Sarah Mitchell',
        password: 'hash',
      });
      expect(user.email_verified_at).toBeInstanceOf(Date);
      expect(repo.rows).toHaveLength(1);
    });
  });

  describe('ensureMembership', () => {
    it('adds a missing membership with the given role', async () => {
      const repo = fakeRepo();

      await seeder.ensureMembership(repo, 'ws-1', 'u-1', WorkspaceRole.ADMIN);

      expect(repo.rows).toEqual([
        expect.objectContaining({
          workspace_id: 'ws-1',
          user_id: 'u-1',
          role: WorkspaceRole.ADMIN,
        }),
      ]);
    });

    it('does not duplicate an existing membership', async () => {
      const repo = fakeRepo([
        { id: 'm-1', workspace_id: 'ws-1', user_id: 'u-1', role: 'OWNER' },
      ]);

      await seeder.ensureMembership(repo, 'ws-1', 'u-1', WorkspaceRole.OWNER);

      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
