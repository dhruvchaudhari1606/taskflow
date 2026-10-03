import { TaskStatus } from '@common/constants/constants';
import {
  DEFAULT_BOARD_COLUMNS,
  findColumnByStatus,
  statusKey,
} from './task-status.util';

describe('Task Status Utility', () => {
  describe('statusKey', () => {
    it('normalizes enum values and column titles to the same key', () => {
      expect(statusKey('To Do')).toBe(statusKey(TaskStatus.TODO));
      expect(statusKey('In Progress')).toBe(statusKey(TaskStatus.IN_PROGRESS));
      expect(statusKey('in review')).toBe(statusKey(TaskStatus.IN_REVIEW));
    });

    it('returns empty string for missing values', () => {
      expect(statusKey()).toBe('');
      expect(statusKey(null)).toBe('');
    });
  });

  describe('findColumnByStatus', () => {
    const columns = DEFAULT_BOARD_COLUMNS.map((c, i) => ({
      id: `col-${i}`,
      name: c.name,
    }));

    it('matches each TaskStatus to its default column', () => {
      expect(findColumnByStatus(columns, TaskStatus.TODO)?.name).toBe('To Do');
      expect(findColumnByStatus(columns, TaskStatus.IN_PROGRESS)?.name).toBe(
        'In Progress',
      );
      expect(findColumnByStatus(columns, TaskStatus.DONE)?.name).toBe('Done');
    });

    it('matches legacy title-format statuses', () => {
      expect(findColumnByStatus(columns, 'In Review')?.name).toBe('In Review');
    });

    it('returns undefined for unknown or empty statuses', () => {
      expect(findColumnByStatus(columns, 'Blocked')).toBeUndefined();
      expect(findColumnByStatus(columns, '')).toBeUndefined();
    });
  });
});
