'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { type FeeViewModel as FeeRecord, useTuitionDomain } from '@/lib/domain';
import styles from './tuition.module.css';

interface TuitionFloorProps {
  displayName: string;
  capacity?: string;
}

export function TuitionFloor({ displayName, capacity }: Readonly<TuitionFloorProps>) {
  const { fees, issueReceipt, isOnline } = useTuitionDomain();
  const isOffline = !isOnline;
  const pendingCount = fees.filter((f) => f.status === 'pending').length;
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [activeModalRecord, setActiveModalRecord] = useState<FeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredFees = fees.filter((f) => {
    if (filter === 'all') return true;
    return f.status === filter;
  });

  const totalCollected = fees
    .filter((f) => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = fees
    .filter((f) => f.status !== 'paid')
    .reduce((sum, f) => sum + f.amount, 0);

  const handleRecordPayment = async (record: FeeRecord) => {
    try {
      const updated = await issueReceipt(record.id);
      setActiveModalRecord(null);
      if (updated) {
        setNotice(
          isOffline
            ? `Receipt ${updated.receiptNo} issued offline for ${record.studentName}. Queued in device outbox.`
            : `Receipt ${updated.receiptNo} issued for ${record.studentName}.`,
        );
      } else {
        setNotice(`Payment processed for ${record.studentName}.`);
      }
      setTimeout(() => setNotice(null), 4000);
    } catch (err) {
      setNotice('Failed to issue receipt. Free storage and retry.');
    }
  };

  const getStatusClass = (status: FeeRecord['status']) => {
    if (status === 'paid' || status === 'statutory_exempt') return styles.statusPaid ?? '';
    if (status === 'pending') return styles.statusPending ?? '';
    return styles.statusOverdue ?? '';
  };

  return (
    <div className={styles.container}>
      <header className={styles.headerBar}>
        <div className={styles.titleArea}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Link
              href="/workspace"
              style={{
                fontSize: '0.8rem',
                fontWeight: 650,
                color: 'var(--color-action, #a85022)',
                textDecoration: 'none',
              }}
            >
              ← Back to Attendance Workspace
            </Link>
          </div>
          <h1>Tuition & Institutional Fee Ledger</h1>
          <p>
            Manage term installments, bursar fee collection, and verifiable receipts across
            classrooms.
          </p>
        </div>
      </header>

      {notice && (
        <div aria-live="polite" style={{ color: '#2e5d32', fontWeight: 700, fontSize: '0.85rem' }}>
          ✓ {notice}
        </div>
      )}

      {/* Aggregate Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Total Collected (LKR)</p>
          <p className={styles.statValue}>Rs. {totalCollected.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Outstanding Balance</p>
          <p className={styles.statValue}>Rs. {totalPending.toLocaleString()}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Settlement Ratio</p>
          <p className={styles.statValue}>
            {Math.round((fees.filter((f) => f.status === 'paid').length / fees.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Table Card */}
      <div className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <div className={styles.filterTabs}>
            <button
              className={styles.filterTab}
              data-active={filter === 'all'}
              onClick={() => setFilter('all')}
              type="button"
            >
              All Batches ({fees.length})
            </button>
            <button
              className={styles.filterTab}
              data-active={filter === 'paid'}
              onClick={() => setFilter('paid')}
              type="button"
            >
              Settled
            </button>
            <button
              className={styles.filterTab}
              data-active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              type="button"
            >
              Pending
            </button>
            <button
              className={styles.filterTab}
              data-active={filter === 'overdue'}
              onClick={() => setFilter('overdue')}
              type="button"
            >
              Overdue
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.feeTable}>
            <thead>
              <tr>
                <th scope="col">Student</th>
                <th scope="col">Classroom</th>
                <th scope="col">Fee Description</th>
                <th scope="col">Amount (LKR)</th>
                <th scope="col">Due Date</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 650 }}>{f.studentName}</td>
                  <td>{f.grade}</td>
                  <td>
                    <div>{f.feeType}</div>
                    {f.waiverReason && (
                      <div style={{ fontSize: '0.72rem', color: '#185abc', marginTop: '2px' }}>
                        ℹ {f.waiverReason}
                      </div>
                    )}
                  </td>
                  <td>
                    {f.waiverAmount && f.waiverAmount > 0 ? (
                      <div>
                        <span
                          style={{
                            textDecoration: 'line-through',
                            color: '#888',
                            fontSize: '0.75rem',
                            marginRight: '4px',
                          }}
                        >
                          Rs. {f.grossAmount?.toLocaleString()}
                        </span>
                        <span style={{ fontWeight: 700 }}>Rs. {f.amount.toLocaleString()}</span>
                      </div>
                    ) : f.amount === 0 ? (
                      <span style={{ color: '#137333', fontWeight: 650 }}>Rs. 0 (Free)</span>
                    ) : (
                      <span>Rs. {f.amount.toLocaleString()}</span>
                    )}
                  </td>
                  <td>{f.dueDate}</td>
                  <td>
                    <span className={`${styles.statusPill} ${getStatusClass(f.status)}`}>
                      {f.status === 'statutory_exempt' ? 'EXEMPT' : f.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {f.status === 'statutory_exempt' ? (
                      <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 600 }}>
                        Statutory Exemption
                      </span>
                    ) : f.status === 'paid' ? (
                      <span style={{ fontSize: '0.75rem', color: '#137333', fontWeight: 600 }}>
                        {f.receiptNo || 'Settled'}
                      </span>
                    ) : (
                      <button
                        className={styles.actionButton}
                        onClick={() => {
                          setActiveModalRecord(f);
                          setPaymentAmount(String(f.amount));
                        }}
                        style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        type="button"
                      >
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Dialog */}
      {activeModalRecord && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
          }}
        >
          <div className={styles.recordPaymentModal}>
            <h3
              style={{ margin: '0 0 0.5rem', fontFamily: 'var(--font-display, "Fraunces", serif)' }}
            >
              Record Bursar Payment
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-ink-soft, #453c35)',
                margin: '0 0 1rem',
              }}
            >
              Recording offline cash or bank transfer receipt for{' '}
              <strong>{activeModalRecord.studentName}</strong> ({activeModalRecord.feeType}).
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginBottom: '1.25rem',
              }}
            >
              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Amount (LKR)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setActiveModalRecord(null)}
                style={{
                  minHeight: 44,
                  padding: '0.4rem 0.85rem',
                  borderRadius: '0.375rem',
                  border: '1px solid var(--color-line, rgba(104, 94, 85, 0.25))',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => handleRecordPayment(activeModalRecord)}
              >
                Issue Receipt & Settle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
