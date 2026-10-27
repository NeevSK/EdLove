'use client';

import {
  AlertCircle,
  Briefcase,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import type {
  FacultyMember,
  StaffLeaveRecord,
  StaffLeaveType,
  WorkforceMetrics,
} from '@repo/workforce/types';
import { workforceService } from '@repo/workforce/workforceService';
import styles from './workforce.module.css';

export function WorkforceFloor(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'leaves' | 'apply' | 'faculty'>('leaves');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  const [metrics, setMetrics] = useState<WorkforceMetrics>({
    totalStaff: 5,
    activeToday: 4,
    onLeaveToday: 1,
    pendingRequests: 1,
    coverageRatePercent: 80,
  });
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [leaves, setLeaves] = useState<StaffLeaveRecord[]>([]);

  // Apply Form State
  const [applicantId, setApplicantId] = useState<string>('usr-teacher-karunaratne');
  const [leaveType, setLeaveType] = useState<StaffLeaveType>('casual');
  const [startDate, setStartDate] = useState<string>('2026-10-28');
  const [endDate, setEndDate] = useState<string>('2026-10-29');
  const [reason, setReason] = useState<string>('');
  const [substituteId, setSubstituteId] = useState<string>('fac-2');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [f, l, m] = await Promise.all([
        workforceService.getFaculty(),
        workforceService.getLeaveRequests(),
        workforceService.getMetrics(),
      ]);
      setFaculty(f);
      setLeaves(l);
      setMetrics(m);
    } catch {
      // Graceful fallback to cached state
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredLeaves = useMemo(() => {
    if (filterStatus === 'all') return leaves;
    return leaves.filter((r) => r.status === filterStatus);
  }, [leaves, filterStatus]);

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await workforceService.reviewLeaveRequest(id, status, 'usr-principal-web');
      setNotification(`Leave request ${id} ${status} successfully.`);
      await loadData();
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setNotification('Please provide a reason for the leave.');
      return;
    }
    setSubmitting(true);
    try {
      const applicant = faculty.find((f) => f.userId === applicantId || f.id === applicantId);
      const substitute = faculty.find((f) => f.id === substituteId);
      await workforceService.submitLeaveRequest({
        schoolId: 'school-ananda-colombo',
        userId: applicantId,
        staffName: applicant?.name ?? 'Faculty Member',
        role: applicant?.role ?? 'Educator',
        leaveType,
        startDate,
        endDate,
        reason,
        substituteId: substitute?.id,
        substituteName: substitute?.name,
      });
      setNotification('Leave application submitted for institutional review.');
      setReason('');
      setActiveTab('leaves');
      await loadData();
    } catch (err) {
      setNotification(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Institutional Continuity & Human Capital</p>
        <h1 className={styles.title}>Workforce & Leave Operations</h1>
        <p className={styles.description}>
          Monitor real-time faculty presence, oversee leave applications with substitute allocations,
          and ensure pedagogical coverage across academic departments.
        </p>
      </header>

      {/* Metrics Ribbon */}
      <section className={styles.metricsGrid} aria-label="Workforce Metrics">
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Total Faculty</span>
          <span className={styles.metricValue}>{metrics.totalStaff}</span>
          <span className={styles.metricHint}>Active institutional staff</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Present Today</span>
          <span className={styles.metricValue}>{metrics.activeToday}</span>
          <span className={styles.metricHint}>On-premise educators</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>On Leave</span>
          <span className={styles.metricValue}>{metrics.onLeaveToday}</span>
          <span className={styles.metricHint}>Sanctioned absence</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Pending Approval</span>
          <span className={styles.metricValue}>{metrics.pendingRequests}</span>
          <span className={styles.metricHint}>Awaiting review</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Coverage Rate</span>
          <span className={styles.metricValue}>{metrics.coverageRatePercent}%</span>
          <span className={styles.metricHint}>Classroom continuity</span>
        </div>
      </section>

      {notification && (
        <div className={styles.notification} role="status">
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className={styles.tabBar} aria-label="Workforce Views">
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'leaves' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <Calendar size={18} />
          Leave Register ({leaves.length})
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'apply' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('apply')}
        >
          <Plus size={18} />
          Apply For Leave
        </button>
        <button
          type="button"
          className={`${styles.tabButton} ${activeTab === 'faculty' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          <Users size={18} />
          Faculty Directory ({faculty.length})
        </button>
      </nav>

      {/* Tab: Leave Register */}
      {activeTab === 'leaves' && (
        <section className={styles.tabContent}>
          <div className={styles.actionsBar}>
            <div className={styles.filterGroup}>
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`${styles.filterButton} ${filterStatus === status ? styles.activeFilter : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setActiveTab('apply')}
            >
              <Plus size={16} /> New Application
            </button>
          </div>

          <div className={styles.leaveList}>
            {filteredLeaves.length === 0 ? (
              <p style={{ color: 'var(--color-ink-muted)', textAlign: 'center', padding: '3rem' }}>
                No leave records match the selected filter.
              </p>
            ) : (
              filteredLeaves.map((record) => (
                <article key={record.id} className={styles.leaveCard}>
                  <div className={styles.leaveCardHeader}>
                    <div className={styles.staffMeta}>
                      <h3 className={styles.staffName}>{record.staffName}</h3>
                      <p className={styles.staffRole}>{record.role}</p>
                    </div>
                    <div className={styles.badgeGroup}>
                      <span className={`${styles.badge} ${styles.badgeType}`}>{record.leaveType}</span>
                      <span
                        className={`${styles.badge} ${
                          record.status === 'approved'
                            ? styles.badgeApproved
                            : record.status === 'rejected'
                              ? styles.badgeRejected
                              : styles.badgePending
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                  </div>

                  <div className={styles.leaveDetails}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Duration</span>
                      <span className={styles.detailValue}>
                        {record.startDate} → {record.endDate}
                      </span>
                    </div>
                    {record.substituteName && (
                      <div className={styles.detailItem}>
                        <span className={styles.detailLabel}>Assigned Substitute</span>
                        <span className={styles.detailValue}>{record.substituteName}</span>
                      </div>
                    )}
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Submitted</span>
                      <span className={styles.detailValue}>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className={styles.reason}>{record.reason}</p>

                  {record.status === 'pending' && (
                    <div className={styles.leaveCardActions}>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => handleReview(record.id, 'rejected')}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                      <button
                        type="button"
                        className={styles.btnPrimary}
                        onClick={() => handleReview(record.id, 'approved')}
                      >
                        <CheckCircle2 size={16} /> Approve
                      </button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {/* Tab: Apply For Leave */}
      {activeTab === 'apply' && (
        <section className={styles.tabContent}>
          <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--color-ink)' }}>
              Faculty Leave Request
            </h2>

            <div className={styles.formGrid}>
              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label htmlFor="applicant" className={styles.label}>
                  Applying Faculty Member
                </label>
                <select
                  id="applicant"
                  className={styles.select}
                  value={applicantId}
                  onChange={(e) => setApplicantId(e.target.value)}
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.userId}>
                      {f.name} — {f.role} ({f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="leaveType" className={styles.label}>
                  Leave Category
                </label>
                <select
                  id="leaveType"
                  className={styles.select}
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as StaffLeaveType)}
                >
                  <option value="casual">Casual Leave</option>
                  <option value="medical">Medical / Sick Leave</option>
                  <option value="duty">Official Duty / Ministry</option>
                  <option value="maternity">Maternity / Parental</option>
                  <option value="bereavement">Compassionate / Bereavement</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="substitute" className={styles.label}>
                  Nominated Substitute
                </label>
                <select
                  id="substitute"
                  className={styles.select}
                  value={substituteId}
                  onChange={(e) => setSubstituteId(e.target.value)}
                >
                  {faculty
                    .filter((f) => f.userId !== applicantId)
                    .map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label htmlFor="startDate" className={styles.label}>
                  Commencement Date
                </label>
                <input
                  id="startDate"
                  type="date"
                  className={styles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label htmlFor="endDate" className={styles.label}>
                  Conclusion Date
                </label>
                <input
                  id="endDate"
                  type="date"
                  className={styles.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className={`${styles.formField} ${styles.fullWidth}`}>
                <label htmlFor="reason" className={styles.label}>
                  Official Justification & Coverage Note
                </label>
                <textarea
                  id="reason"
                  className={styles.textarea}
                  placeholder="Detail institutional reason and handover arrangements..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => setActiveTab('leaves')}
              >
                Cancel
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Transmit Application'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Tab: Faculty Directory */}
      {activeTab === 'faculty' && (
        <section className={styles.tabContent}>
          <div className={styles.facultyGrid}>
            {faculty.map((member) => (
              <article key={member.id} className={styles.facultyCard}>
                <div className={styles.facultyCardHeader}>
                  <div>
                    <h3 className={styles.facultyName}>{member.name}</h3>
                    <p className={styles.facultyDept}>{member.department}</p>
                    <p className={styles.facultyRole}>{member.role}</p>
                  </div>
                  <span
                    className={styles.badge}
                    style={{ background: member.active ? '#dcfce7' : '#fee2e2', color: member.active ? '#15803d' : '#b91c1c' }}
                  >
                    {member.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className={styles.leaveBalances}>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceCount}>{member.leaveBalance.casual}</span>
                    <span className={styles.balanceLabel}>Casual</span>
                  </div>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceCount}>{member.leaveBalance.medical}</span>
                    <span className={styles.balanceLabel}>Medical</span>
                  </div>
                  <div className={styles.balanceItem}>
                    <span className={styles.balanceCount}>{member.leaveBalance.duty}</span>
                    <span className={styles.balanceLabel}>Duty</span>
                  </div>
                </div>

                {member.allocatedClasses.length > 0 && (
                  <div className={styles.classesList}>
                    <span className={styles.classesLabel}>Allocated Classrooms</span>
                    <div>
                      {member.allocatedClasses.map((cls) => (
                        <span key={cls} className={styles.classPill}>
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
