export interface ChequeRecord {
  id: string;
  cheque_no: string;
  bank_name: string;
  payee_name: string;
  amount: number;
  issue_date: string;
  status: 'pending' | 'cleared' | 'bounced' | 'cancelled';
  cleared_date?: string;
  metadata?: any;
}

const memoryChequeStore = new Map<string, ChequeRecord>();

export class ChequeManager {
  /**
   * Registers a new cheque in the system.
   */
  static async registerCheque(cheque: {
    cheque_no: string;
    bank_name: string;
    payee_name: string;
    amount: number;
    issue_date: string;
    metadata?: any;
  }): Promise<ChequeRecord> {
    const id = `chk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const record: ChequeRecord = {
      id,
      ...cheque,
      status: 'pending',
    };
    memoryChequeStore.set(id, record);
    return record;
  }

  /**
   * Marks a cheque as cleared and triggers corresponding ledger entries.
   */
  static async clearCheque(id: string, clearedDate: string = new Date().toISOString()): Promise<ChequeRecord> {
    const existing = memoryChequeStore.get(id);
    if (!existing) {
      throw new Error(`Cheque with id ${id} not found.`);
    }
    const updated: ChequeRecord = {
      ...existing,
      status: 'cleared',
      cleared_date: clearedDate,
    };
    memoryChequeStore.set(id, updated);
    return updated;
  }
}
