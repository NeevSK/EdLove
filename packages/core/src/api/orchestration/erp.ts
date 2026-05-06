import { accountingAPI as rawAccountingAPI, paymentsAPI as rawPaymentsAPI } from '../erp';
import { erpContract } from '../erp.contract';
import { createPOAProxy } from '../poaProxy';

export const accountingAPI = createPOAProxy('accounting', rawAccountingAPI, erpContract, {
  getAccounts: 'getAccounts',
  recordTransaction: 'recordTransaction',
});

export const paymentsAPI = createPOAProxy('payments', rawPaymentsAPI, erpContract, {
  createPaymentIntent: 'createPaymentIntent',
  getInvoices: 'getInvoices',
  getReceipt: 'getReceipt',
});
