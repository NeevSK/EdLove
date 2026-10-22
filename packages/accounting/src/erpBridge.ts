import type { FinancialTransaction, LedgerEntry } from '@repo/accounting/types';
import type { AccrualInvoiceJournal, CashSettlementJournal } from '@repo/core/types';

export interface ChartOfAccountMapping {
  cashBankAccountId: string;
  studentReceivablesAccountId: string;
  revenueTuitionAccountId: string;
  statutorySubsidyAccountId: string;
  inventoryOnHandAccountId: string;
  programExpenseAccountId: string;
  sdsReserveAccountId: string;
}

export const DEFAULT_INSTITUTIONAL_COA: ChartOfAccountMapping = {
  cashBankAccountId: 'coa_1100_cash_bank',
  studentReceivablesAccountId: 'coa_1200_student_ar',
  revenueTuitionAccountId: 'coa_4100_tuition_revenue',
  statutorySubsidyAccountId: 'coa_4200_statutory_subsidies',
  inventoryOnHandAccountId: 'coa_1300_inventory_on_hand',
  programExpenseAccountId: 'coa_5100_operational_supplies',
  sdsReserveAccountId: 'coa_3100_sds_reserve',
};

function resolveAccountId(accountCode: string, coa: ChartOfAccountMapping): string {
  switch (accountCode) {
    case '1100_CASH_BANK':
      return coa.cashBankAccountId;
    case '1200_STUDENT_AR':
      return coa.studentReceivablesAccountId;
    case '1300_INVENTORY_ON_HAND':
      return coa.inventoryOnHandAccountId;
    case '4100_TUITION_REVENUE':
      return coa.revenueTuitionAccountId;
    case '4200_STATUTORY_SUBSIDY':
      return coa.statutorySubsidyAccountId;
    case '5100_OPERATIONAL_SUPPLIES':
      return coa.programExpenseAccountId;
    default:
      return `coa_${accountCode.toLowerCase()}`;
  }
}

/**
 * Converts an AccrualInvoiceJournal from @repo/core into balanced FinancialTransaction entries.
 */
export function convertAccrualInvoiceToTransaction(
  journal: AccrualInvoiceJournal,
  coa: ChartOfAccountMapping = DEFAULT_INSTITUTIONAL_COA,
): {
  transaction: Omit<FinancialTransaction, 'id' | 'entries'>;
  entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[];
} {
  const entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[] = journal.entries.map(
    (e: AccrualInvoiceJournal['entries'][number]) => ({
      accountId: resolveAccountId(e.accountCode ?? e.accountId ?? 'unknown', coa),
      amount: e.amountCents / 100,
      side: e.side,
      description: e.description,
    }),
  );

  return {
    transaction: {
      date: journal.assessmentDate,
      description: journal.description,
      referenceNo: journal.invoiceId,
      metadata: {
        invoiceId: journal.invoiceId,
        netStudentReceivableCents: journal.netStudentReceivableCents,
        subsidyCoveredCents: journal.subsidyCoveredCents,
      },
    },
    entries,
  };
}

/**
 * Converts a CashSettlementJournal into balanced FinancialTransaction entries.
 */
export function convertCashSettlementToTransaction(
  journal: CashSettlementJournal,
  coa: ChartOfAccountMapping = DEFAULT_INSTITUTIONAL_COA,
): {
  transaction: Omit<FinancialTransaction, 'id' | 'entries'>;
  entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[];
} {
  const entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[] = journal.entries.map(
    (e: CashSettlementJournal['entries'][number]) => ({
      accountId: resolveAccountId(e.accountCode ?? e.accountId ?? 'unknown', coa),
      amount: e.amountCents / 100,
      side: e.side,
      description: e.description,
    }),
  );

  return {
    transaction: {
      date: journal.settledAt,
      description: `Cash settlement for ${journal.invoiceId} via ${journal.paymentMethod}`,
      referenceNo: journal.settlementId,
      metadata: {
        settlementId: journal.settlementId,
        invoiceId: journal.invoiceId,
        payerUserId: journal.payerUserId,
        paymentMethod: journal.paymentMethod,
        amountSettledCents: journal.amountSettledCents,
      },
    },
    entries,
  };
}

/**
 * Converts inventory consumable stock consumption into an operational supplies expense.
 */
export function convertStockConsumptionToTransaction(
  movement: {
    id: string;
    assetItemId: string;
    assetName: string;
    totalCostCents: number;
    relatedEventId?: string;
  },
  coa: ChartOfAccountMapping = DEFAULT_INSTITUTIONAL_COA,
): {
  transaction: Omit<FinancialTransaction, 'id' | 'entries'>;
  entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[];
} {
  const amountLkr = movement.totalCostCents / 100;
  return {
    transaction: {
      date: new Date().toISOString(),
      description: `Inventory stock consumption: ${movement.assetName}`,
      referenceNo: movement.id,
      metadata: {
        movementId: movement.id,
        assetItemId: movement.assetItemId,
        relatedEventId: movement.relatedEventId,
      },
    },
    entries: [
      {
        accountId: coa.programExpenseAccountId,
        amount: amountLkr,
        side: 'debit',
        description: `Operational consumption of ${movement.assetName}`,
      },
      {
        accountId: coa.inventoryOnHandAccountId,
        amount: amountLkr,
        side: 'credit',
        description: `Inventory on-hand depleted for ${movement.assetName}`,
      },
    ],
  };
}
