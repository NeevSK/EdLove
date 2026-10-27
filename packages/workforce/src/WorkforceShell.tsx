'use client';

import { useDomainFeature } from '@repo/core/logic';
import {
  CircleAlert,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Plus,
  Users,
  X,
} from '@repo/ui/icons';
import {
  Box,
  Heading,
  HStack,
  Icon,
  Pressable,
  ScrollView,
  Text,
  Theme,
  VStack,
} from '@repo/ui/primitives';
import React, { useEffect, useState } from 'react';
import type {
  FacultyMember,
  StaffLeaveRecord,
  StaffLeaveType,
  WorkforceMetrics,
} from './types';
import { workforceService } from './workforceService';

export default function WorkforceShell(): React.ReactNode {
  const { result: workforceFeature } = useDomainFeature('workforce');

  const [activeTab, setActiveTab] = useState<'leaves' | 'apply' | 'faculty'>('leaves');
  const [metrics, setMetrics] = useState<WorkforceMetrics>({
    totalStaff: 5,
    activeToday: 4,
    onLeaveToday: 1,
    pendingRequests: 1,
    coverageRatePercent: 80,
  });
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [leaves, setLeaves] = useState<StaffLeaveRecord[]>([]);

  // Apply Leave Form State
  const [applicantId, setApplicantId] = useState<string>('usr-teacher-karunaratne');
  const [leaveType, setLeaveType] = useState<StaffLeaveType>('casual');
  const [startDate, setStartDate] = useState<string>('2026-10-28');
  const [endDate, setEndDate] = useState<string>('2026-10-29');
  const [reason, setReason] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const f = await workforceService.getFaculty();
    const l = await workforceService.getLeaveRequests();
    const m = await workforceService.getMetrics();
    setFaculty(f);
    setLeaves(l);
    setMetrics(m);
  }

  async function handleApprove(leaveId: string) {
    await workforceService.reviewLeaveRequest(leaveId, 'approved', 'usr-principal-colombo');
    setNotification('Leave request approved.');
    setTimeout(() => setNotification(null), 3000);
    await loadData();
  }

  async function handleReject(leaveId: string) {
    await workforceService.reviewLeaveRequest(leaveId, 'rejected', 'usr-principal-colombo');
    setNotification('Leave request rejected.');
    setTimeout(() => setNotification(null), 3000);
    await loadData();
  }

  async function handleSubmitLeave() {
    if (!reason.trim()) {
      setNotification('Please provide a reason for the leave.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSubmitting(true);
    const applicant = faculty.find((f) => f.userId === applicantId) || faculty[0];
    await workforceService.submitLeaveRequest({
      schoolId: 'school-ananda-colombo',
      userId: applicant ? applicant.userId : applicantId,
      staffName: applicant ? applicant.name : 'Faculty Staff',
      role: applicant ? applicant.role : 'Educator',
      leaveType,
      startDate,
      endDate,
      reason,
      substituteId: null,
      substituteName: null,
    });

    setSubmitting(false);
    setReason('');
    setNotification('Leave request submitted for Principal review.');
    setTimeout(() => setNotification(null), 3000);
    setActiveTab('leaves');
    await loadData();
  }

  if (!workforceFeature.permitted) return null;

  return (
    <ScrollView className="flex-1 bg-phase-canvas">
      <VStack space="lg" className="p-6 max-w-[1000px] mx-auto w-full">
        {/* Header Section */}
        <VStack space="xs">
          <HStack space="md" className="items-center">
            <Box className="w-10 h-10 rounded-xl bg-sanctuarySaffron/15 justify-center items-center">
              <Icon as={Briefcase} size={22} color={Theme.colors.sanctuarySaffron} />
            </Box>
            <VStack space="none">
              <Heading size="lg" className="font-serif">
                Workforce Management
              </Heading>
              <Text size="xs" className="text-phaseText-secondary">
                Institutional human capital, faculty presence, and pedagogical continuity
              </Text>
            </VStack>
          </HStack>
        </VStack>

        {/* Notifications Bar */}
        {notification && (
          <Box className="bg-sanctuarySaffron/10 border border-sanctuarySaffron/30 rounded-xl p-3 flex-row items-center gap-2">
            <Icon as={CircleAlert} size={16} color={Theme.colors.sanctuarySaffron} />
            <Text size="xs" className="font-medium text-sanctuarySaffron">
              {notification}
            </Text>
          </Box>
        )}

        {/* Metrics Grid */}
        <HStack space="md" className="flex-wrap">
          <Box className="flex-1 min-w-[140px] bg-white/70 border border-black/5 rounded-2xl p-4">
            <Text size="xs" className="text-phaseText-secondary font-medium">
              Total Staff
            </Text>
            <Heading size="xl" className="font-serif mt-1">
              {metrics.totalStaff}
            </Heading>
            <Text size="xs" className="text-phaseText-secondary mt-1">
              Registered Faculty
            </Text>
          </Box>

          <Box className="flex-1 min-w-[140px] bg-white/70 border border-black/5 rounded-2xl p-4">
            <Text size="xs" className="text-phaseText-secondary font-medium">
              Active Today
            </Text>
            <Heading size="xl" className="font-serif mt-1 text-emerald-600">
              {metrics.activeToday}
            </Heading>
            <Text size="xs" className="text-phaseText-secondary mt-1">
              {metrics.coverageRatePercent}% Coverage
            </Text>
          </Box>

          <Box className="flex-1 min-w-[140px] bg-white/70 border border-black/5 rounded-2xl p-4">
            <Text size="xs" className="text-phaseText-secondary font-medium">
              On Leave Today
            </Text>
            <Heading size="xl" className="font-serif mt-1 text-amber-600">
              {metrics.onLeaveToday}
            </Heading>
            <Text size="xs" className="text-phaseText-secondary mt-1">
              Covered by Substitutes
            </Text>
          </Box>

          <Box className="flex-1 min-w-[140px] bg-white/70 border border-black/5 rounded-2xl p-4">
            <Text size="xs" className="text-phaseText-secondary font-medium">
              Pending Requests
            </Text>
            <Heading size="xl" className="font-serif mt-1 text-sanctuarySaffron">
              {metrics.pendingRequests}
            </Heading>
            <Text size="xs" className="text-phaseText-secondary mt-1">
              Awaiting Approval
            </Text>
          </Box>
        </HStack>

        {/* Navigation Tabs */}
        <HStack space="sm" className="border-b border-black/10 pb-2">
          <Pressable
            onPress={() => setActiveTab('leaves')}
            className={
              'px-4 py-2 rounded-xl flex-row items-center gap-2 ' +
              (activeTab === 'leaves'
                ? 'bg-sanctuarySaffron text-white'
                : 'bg-black/5 text-phaseText-secondary')
            }
          >
            <Icon
              as={Calendar}
              size={15}
              color={activeTab === 'leaves' ? '#ffffff' : '#6B7280'}
            />
            <Text
              size="xs"
              className={activeTab === 'leaves' ? 'font-bold text-white' : 'font-medium'}
            >
              Leave Management
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('apply')}
            className={
              'px-4 py-2 rounded-xl flex-row items-center gap-2 ' +
              (activeTab === 'apply'
                ? 'bg-sanctuarySaffron text-white'
                : 'bg-black/5 text-phaseText-secondary')
            }
          >
            <Icon
              as={Plus}
              size={15}
              color={activeTab === 'apply' ? '#ffffff' : '#6B7280'}
            />
            <Text
              size="xs"
              className={activeTab === 'apply' ? 'font-bold text-white' : 'font-medium'}
            >
              Apply for Leave
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('faculty')}
            className={
              'px-4 py-2 rounded-xl flex-row items-center gap-2 ' +
              (activeTab === 'faculty'
                ? 'bg-sanctuarySaffron text-white'
                : 'bg-black/5 text-phaseText-secondary')
            }
          >
            <Icon
              as={Users}
              size={15}
              color={activeTab === 'faculty' ? '#ffffff' : '#6B7280'}
            />
            <Text
              size="xs"
              className={activeTab === 'faculty' ? 'font-bold text-white' : 'font-medium'}
            >
              Faculty Directory
            </Text>
          </Pressable>
        </HStack>

        {/* Tab 1: Leave Requests & Reviews */}
        {activeTab === 'leaves' && (
          <VStack space="md">
            <Heading size="sm" className="font-serif">
              Staff Leave Roster & Approvals
            </Heading>
            {leaves.length === 0 ? (
              <Box className="p-8 bg-white/60 rounded-2xl items-center justify-center">
                <Text size="sm" className="text-phaseText-secondary">
                  No active or past leave requests.
                </Text>
              </Box>
            ) : (
              leaves.map((item) => (
                <Box
                  key={item.id}
                  className="bg-white/80 border border-black/5 rounded-2xl p-4 flex-col gap-3"
                >
                  <HStack className="justify-between items-start flex-wrap gap-2">
                    <VStack space="none">
                      <Text size="sm" className="font-bold">
                        {item.staffName}
                      </Text>
                      <Text size="xs" className="text-phaseText-secondary">
                        {item.role} ·{' '}
                        <Text className="uppercase font-semibold tracking-wider">
                          {item.leaveType} LEAVE
                        </Text>
                      </Text>
                    </VStack>
                    <Box
                      className={
                        'px-2.5 py-1 rounded-full ' +
                        (item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200')
                      }
                    >
                      <Text
                        size="xs"
                        className={
                          'font-bold capitalize ' +
                          (item.status === 'approved'
                            ? 'text-emerald-700'
                            : item.status === 'rejected'
                              ? 'text-red-700'
                              : 'text-amber-700')
                        }
                      >
                        {item.status}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack space="md" className="items-center text-xs text-phaseText-secondary">
                    <HStack space="xs" className="items-center">
                      <Icon as={Clock} size={13} color={'#6B7280'} />
                      <Text size="xs">
                        {item.startDate} to {item.endDate}
                      </Text>
                    </HStack>
                    {item.substituteName && (
                      <HStack space="xs" className="items-center">
                        <Icon as={Users} size={13} color={'#6B7280'} />
                        <Text size="xs">Substitute: {item.substituteName}</Text>
                      </HStack>
                    )}
                  </HStack>

                  {item.reason && (
                    <Box className="bg-black/5 rounded-xl p-2.5">
                      <Text size="xs" className="text-phaseText italic">
                        "{item.reason}"
                      </Text>
                    </Box>
                  )}

                  {/* Actions for Pending Requests */}
                  {item.status === 'pending' && (
                    <HStack space="sm" className="justify-end pt-2 border-t border-black/5">
                      <Pressable
                        onPress={() => handleReject(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-100/60 flex-row items-center gap-1.5"
                      >
                        <Icon as={X} size={13} color="#b91c1c" />
                        <Text size="xs" className="font-semibold text-red-700">
                          Reject
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleApprove(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 flex-row items-center gap-1.5"
                      >
                        <Icon as={Check} size={13} color="#ffffff" />
                        <Text size="xs" className="font-semibold text-white">
                          Approve Leave
                        </Text>
                      </Pressable>
                    </HStack>
                  )}
                </Box>
              ))
            )}
          </VStack>
        )}

        {/* Tab 2: Apply for Leave Form */}
        {activeTab === 'apply' && (
          <Box className="bg-white/80 border border-black/5 rounded-2xl p-6">
            <VStack space="md">
              <Heading size="sm" className="font-serif">
                Submit Staff Leave Application
              </Heading>

              <VStack space="xs">
                <Text size="xs" className="font-bold text-phaseText">
                  Staff Member
                </Text>
                <select
                  value={applicantId}
                  onChange={(e) => setApplicantId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs font-sans"
                >
                  {faculty.map((f) => (
                    <option key={f.id} value={f.userId}>
                      {f.name} ({f.role}) - {f.department}
                    </option>
                  ))}
                </select>
              </VStack>

              <HStack space="md" className="flex-wrap">
                <VStack space="xs" className="flex-1 min-w-[150px]">
                  <Text size="xs" className="font-bold text-phaseText">
                    Leave Category
                  </Text>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as StaffLeaveType)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs font-sans"
                  >
                    <option value="casual">Casual Leave (14 days max)</option>
                    <option value="medical">Medical / Sick Leave</option>
                    <option value="duty">Official Duty / Exam Invigilation</option>
                    <option value="unpaid">Unpaid Personal Sabbatical</option>
                  </select>
                </VStack>

                <VStack space="xs" className="flex-1 min-w-[150px]">
                  <Text size="xs" className="font-bold text-phaseText">
                    Start Date
                  </Text>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs font-sans"
                  />
                </VStack>

                <VStack space="xs" className="flex-1 min-w-[150px]">
                  <Text size="xs" className="font-bold text-phaseText">
                    End Date
                  </Text>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs font-sans"
                  />
                </VStack>
              </HStack>

              <VStack space="xs">
                <Text size="xs" className="font-bold text-phaseText">
                  Reason & Handover Notes
                </Text>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide context, emergency contact, and curriculum lesson substitution notes..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs font-sans"
                />
              </VStack>

              <Pressable
                onPress={handleSubmitLeave}
                disabled={submitting}
                className="mt-2 py-3 px-6 bg-sanctuarySaffron rounded-xl items-center justify-center"
              >
                <Text size="xs" className="font-bold text-white">
                  {submitting ? 'Submitting Application...' : 'Submit Application to Principal'}
                </Text>
              </Pressable>
            </VStack>
          </Box>
        )}

        {/* Tab 3: Faculty Member Directory */}
        {activeTab === 'faculty' && (
          <VStack space="md">
            <Heading size="sm" className="font-serif">
              Institutional Faculty Directory & Leave Balances
            </Heading>
            {faculty.map((f) => (
              <Box
                key={f.id}
                className="bg-white/80 border border-black/5 rounded-2xl p-4 flex-col gap-2"
              >
                <HStack className="justify-between items-start flex-wrap gap-2">
                  <VStack space="none">
                    <Text size="sm" className="font-bold">
                      {f.name}
                    </Text>
                    <Text size="xs" className="text-phaseText-secondary">
                      {f.role} · {f.department}
                    </Text>
                  </VStack>
                  <Box className="px-2 py-0.5 rounded-full bg-black/5">
                    <Text size="xs" className="uppercase font-semibold tracking-wider text-black/60">
                      {f.family}
                    </Text>
                  </Box>
                </HStack>

                <HStack space="md" className="flex-wrap text-xs text-phaseText-secondary pt-2">
                  <Text size="xs">
                    Casual Balance:{' '}
                    <Text className="font-bold text-black">{f.leaveBalance.casual}d</Text>
                  </Text>
                  <Text size="xs">
                    Medical Balance:{' '}
                    <Text className="font-bold text-black">{f.leaveBalance.medical}d</Text>
                  </Text>
                  <Text size="xs">
                    Duty Balance:{' '}
                    <Text className="font-bold text-black">{f.leaveBalance.duty}d</Text>
                  </Text>
                </HStack>

                {f.allocatedClasses.length > 0 && (
                  <HStack space="xs" className="flex-wrap pt-1">
                    {f.allocatedClasses.map((cls) => (
                      <Box key={cls} className="px-2 py-0.5 rounded-md bg-sanctuarySaffron/10">
                        <Text size="xs" className="text-sanctuarySaffron font-medium">
                          {cls}
                        </Text>
                      </Box>
                    ))}
                  </HStack>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
}
