import { v4 as uuidv4 } from 'uuid';

/**
 * Idempotency Utility
 * Follows the "Hat 04 - Data Reliability" domain.
 *
 * Ensures that high-volume writes (Grants, Attendance, Grades) can be safely retried
 * on flaky 3G/Offline-to-Online conditions without double-counting data.
 */
export const Idempotency = {
  /**
   * Generates a unique idempotency key.
   * Mobile clients should generate this at the moment of USER ACTION
   * and persist it until the server confirms success.
   */
  generateKey: (namespace?: string) => {
    const key = uuidv4();
    return namespace ? `${namespace}:${key}` : key;
  },

  /**
   * Standard header key for Gurudevi infrastructure.
   */
  HEADER: 'x-idempotency-key',

  /**
   * Domain Namespaces
   */
  DOMAINS: {
    ATTENDANCE: 'att',
    GRADES: 'grd',
    WELLBEING: 'wlb',
    FINANCE: 'fin',
    IDENTITY: 'id',
  } as const,
};

export default Idempotency;
