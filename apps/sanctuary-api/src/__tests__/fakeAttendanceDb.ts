/**
 * Minimal in-memory stand-in for the ZenStack delegates the attendance and shadow-claim
 * code uses. $transaction snapshots the store and restores it if the callback throws,
 * so tests can prove a failed claim leaves nothing half-moved.
 */
type Row = Record<string, any>;
type Tables = Record<string, Row[]>;

const matches = (row: Row, where: Row = {}) =>
  Object.entries(where).every(([key, expected]) => {
    if (expected && typeof expected === 'object' && !(expected instanceof Date)) {
      if (Array.isArray(expected.in)) return expected.in.includes(row[key]);
      return Object.entries(expected).every(([k, v]) => row[key]?.[k] === v);
    }
    if (expected === null) return row[key] === null || row[key] === undefined;
    return String(row[key]) === String(expected);
  });

const flattenUnique = (where: Row) => {
  const compound = where.student_id_grade_class_id_attendance_date;
  if (!compound) return where;
  return {
    student_id: compound.student_id,
    grade_class_id: compound.grade_class_id,
    attendance_date: compound.attendance_date,
  };
};

export function createFakeDb(seed: Tables, options: { failOn?: string } = {}) {
  let tables: Tables = structuredClone(seed);
  let counter = 0;
  const delegate = (name: string) => {
    const rows = () => (tables[name] ??= []);
    const guard = (op: string) => {
      if (options.failOn === `${name}.${op}`) throw new Error(`boom: ${name}.${op}`);
    };
    return {
      findUnique: async ({ where }: any) =>
        rows().find((row) => matches(row, flattenUnique(where))) ?? null,
      findFirst: async ({ where }: any = {}) => rows().find((row) => matches(row, where)) ?? null,
      findMany: async ({ where, take }: any = {}) => {
        const found = rows().filter((row) => matches(row, where));
        return typeof take === 'number' ? found.slice(0, take) : found;
      },
      create: async ({ data }: any) => {
        guard('create');
        const row = { id: data.id ?? `${name}-${++counter}`, ...data };
        rows().push(row);
        return row;
      },
      update: async ({ where, data }: any) => {
        guard('update');
        const row = rows().find((item) => matches(item, where));
        if (!row) throw new Error(`${name} not found`);
        Object.assign(row, data);
        return row;
      },
      updateMany: async ({ where, data }: any) => {
        guard('updateMany');
        const found = rows().filter((row) => matches(row, where));
        for (const row of found) Object.assign(row, data);
        return { count: found.length };
      },
    };
  };
  const db: any = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (prop === '$transaction') {
          return async (fn: (tx: any) => Promise<unknown>) => {
            const snapshot = structuredClone(tables);
            try {
              return await fn(db);
            } catch (error) {
              tables = snapshot;
              throw error;
            }
          };
        }
        if (prop === 'tables') return tables;
        return delegate(prop);
      },
    },
  );
  return db;
}
