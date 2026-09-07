import { api, communityAPI, onboardingAPI, schoolAPI } from '@repo/core/api/client';
import {
  incrementInviteCodeUsage,
  usePermissions,
  validateInviteCode,
} from '@repo/core/logic';
import { useAuthStore } from '@repo/core/store';
import type { School } from '@repo/core/types';
import { BrandPulse } from '@repo/ui/components/BrandPulse';
import { SanctuaryButton } from '@repo/ui/components/SanctuaryButton';
import type { LucideIcon } from '@repo/ui/icons';
import {
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  CircleCheck,
  Key,
  Search,
  Users,
} from '@repo/ui/icons';
import {
  Box,
  Center,
  Heading,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@repo/ui/primitives';
import { useRouter } from 'expo-router';

import type React from 'react';
import { useCallback, useReducer, useState } from 'react';

// -- Types ----------------------------------------------------

type PrincipalCreateSchoolState = {
  step: 'details' | 'type' | 'done';
  name: string;
  type: 'primary' | 'secondary' | 'mixed';
  loading: boolean;
  error: string | null;
  schoolName: string;
};

type PrincipalCreateSchoolAction =
  | { type: 'SET_STEP'; step: PrincipalCreateSchoolState['step'] }
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_TYPE'; schoolType: PrincipalCreateSchoolState['type'] }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; schoolName: string }
  | { type: 'CREATE_FAILURE'; error: string };

const createSchoolReducer = (
  state: PrincipalCreateSchoolState,
  action: PrincipalCreateSchoolAction,
): PrincipalCreateSchoolState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_TYPE':
      return { ...state, type: action.schoolType };
    case 'CREATE_START':
      return { ...state, loading: true, error: null };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loading: false,
        schoolName: action.schoolName,
        step: 'done',
      };
    case 'CREATE_FAILURE':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

// -- Helpers --------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[1px] mb-2">
      {children}
    </Text>
  );
}

function SuccessCard({
  icon: StatusIcon,
  title,
  body,
  cta,
  onCta,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <VStack className="items-center gap-4 py-6 px-4 text-center">
      <Center className="w-16 h-16 rounded-full bg-phase-success/10">
        <Icon as={CircleCheck} size="xl" className="text-phase-success" />
      </Center>
      <StatusIcon size={28} color="#4F7DA3" aria-hidden />
      <VStack className="items-center">
        <Heading size="xs" className="m-0 text-phaseText-primary">
          {title}
        </Heading>
        <Text className="m-0 text-phaseText-muted text-[13px] max-w-[380px]">{body}</Text>
      </VStack>
      <SanctuaryButton
        action="primary"
        accessibilityLabel={cta}
        accessibilityHint={`Press to perform the action: ${cta}`}
        onPress={onCta}
        className="bg-phase-interactive"
      >
        <HStack className="items-center gap-2">
          <Text className="text-white font-bold">{cta}</Text>
          <Icon as={ArrowRight} size="xs" className="text-white" />
        </HStack>
      </SanctuaryButton>
    </VStack>
  );
}

const SCHOOL_TYPES = [
  {
    value: 'primary',
    label: 'Primary School',
    icon: Building2,
    desc: 'Grades 1–5',
  },
  {
    value: 'secondary',
    label: 'Secondary School',
    icon: BookOpen,
    desc: 'Grades 6–13',
  },
  {
    value: 'mixed',
    label: 'Mixed / All Grades',
    icon: Users,
    desc: 'All grade levels',
  },
] as const;

// -- subcomponents -------------------------------------------

function PrincipalCreateSchool({ onSuccess }: { onSuccess: () => void }) {
  const user = useAuthStore((state) => state.user);
  const [state, dispatch] = useReducer(createSchoolReducer, {
    step: 'details',
    name: '',
    type: 'mixed',
    loading: false,
    error: null,
    schoolName: '',
  });

  const handleCreate = useCallback(async () => {
    if (!user?.id || !state.name.trim()) return;
    dispatch({ type: 'CREATE_START' });
    try {
      const handle = state.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '');
      const school = await schoolAPI.create({
        name: state.name.trim(),
        handle,
        type: state.type,
        created_by: user.id,
      });
      await onboardingAPI.createFounderSchoolBond(user.id, school.id);
      try {
        await communityAPI.createGroupWithOwner(
          {
            name: `${state.name.trim()} HQ`,
            description: `Official community portal for ${state.name.trim()}`,
            type: 'general',
            join_policy: 'open',
            school_id: school.id,
          },
          user.id,
        );
      } catch {
        /* non-fatal */
      }
      dispatch({ type: 'CREATE_SUCCESS', schoolName: school.name });
      useAuthStore.getState().setUser({ ...user, school_id: school.id });
    } catch (e: unknown) {
      dispatch({
        type: 'CREATE_FAILURE',
        error: e instanceof Error ? e.message : 'Failed to create school',
      });
    }
  }, [user, state.name, state.type]);

  if (state.step === 'done')
    return (
      <SuccessCard
        icon={Building2}
        title={`${state.schoolName} is live!`}
        body="Your school sanctuary is ready. Invite teachers, create classrooms and start your journey."
        cta="Set up my school"
        onCta={onSuccess}
      />
    );

  return (
    <VStack className="gap-5">
      {state.step === 'details' && (
        <>
          <VStack>
            <SectionLabel>School Name *</SectionLabel>
            <Input className="bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12">
              <InputField
                value={state.name}
                onChangeText={(name) => dispatch({ type: 'SET_NAME', name })}
                placeholder="e.g. Gurudevi Life School"
                className="text-sm font-bold text-phaseText-primary"
                accessibilityLabel="School Name Input"
                accessibilityHint="Enter the formal name of your school"
              />
            </Input>
          </VStack>
          <SanctuaryButton
            onPress={() => dispatch({ type: 'SET_STEP', step: 'type' })}
            isDisabled={!state.name.trim()}
            className="bg-phase-interactive"
            accessibilityLabel="Next step — Choose school type"
            accessibilityHint="Navigates to the next step to select school category"
          >
            <HStack className="items-center justify-center gap-2">
              <Text className="text-white font-bold text-sm">Next — Choose school type</Text>
              <Icon as={ChevronRight} size="xs" className="text-white" />
            </HStack>
          </SanctuaryButton>
        </>
      )}

      {state.step === 'type' && (
        <>
          <Text className="m-0 text-phaseText-muted text-[13px]">
            What kind of school is{' '}
            <Text className="font-bold text-phaseText-primary">{state.name}</Text>?
          </Text>
          {SCHOOL_TYPES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => dispatch({ type: 'SET_TYPE', schoolType: t.value })}
              role="radio"
              accessibilityLabel={`Select ${t.label}`}
              accessibilityHint={`Selects ${t.label} as your school type`}
              accessibilityState={{ selected: state.type === t.value }}
              className={`flex-row items-center gap-4 p-4 rounded-xl border-2 ${
                state.type === t.value
                  ? 'bg-phase-interactive/5 border-phase-interactive'
                  : 'bg-phase-surface-secondary border-phase-border'
              }`}
            >
              <Icon as={t.icon} size="sm" className="text-phase-interactive" />
              <VStack className="flex-1">
                <Text className="text-sm font-bold text-phaseText-primary">{t.label}</Text>
                <Text className="text-xs text-phaseText-muted">{t.desc}</Text>
              </VStack>
              {state.type === t.value && (
                <Icon as={CircleCheck} size="xs" className="text-phase-interactive" />
              )}
            </Pressable>
          ))}
          {state.error && <Text className="m-0 text-xs text-phase-error">{state.error}</Text>}
          <HStack className="gap-3">
            <SanctuaryButton
              onPress={() => dispatch({ type: 'SET_STEP', step: 'details' })}
              className="flex-1 border-phase-border"
              accessibilityLabel="Go back to school details"
              accessibilityHint="Returns to the previous screen to edit school name"
            >
              <Text className="font-bold text-phaseText-secondary text-sm">← Back</Text>
            </SanctuaryButton>
            <SanctuaryButton
              onPress={handleCreate}
              isDisabled={state.loading}
              className="flex-[2] bg-phase-interactive"
              accessibilityLabel="Create School now"
              accessibilityHint="Submits your school details and creates the institution"
            >
              <HStack className="items-center justify-center gap-2">
                {state.loading ? (
                  <BrandPulse size={18} tintColor="#FFFFFF" accessibilityLabel="Creating school" />
                ) : (
                  <Icon as={Building2} size="xs" className="text-white" />
                )}
                <Text className="text-white font-bold text-sm">
                  {state.loading ? 'Creating…' : 'Create School'}
                </Text>
              </HStack>
            </SanctuaryButton>
          </HStack>
        </>
      )}
    </VStack>
  );
}

// -- TeacherJoinSchool ---------------------------------------

type TeacherJoinSchoolState = {
  method: 'code' | 'search';
  code: string;
  codeErr: string | null;
  codeLoading: boolean;
  query: string;
  results: School[]; // Ideally School[] from core
  searching: boolean;
  requesting: string | null;
  reqSent: boolean;
  actionError: string | null;
};

type TeacherJoinSchoolAction =
  | { type: 'SET_METHOD'; method: 'code' | 'search' }
  | { type: 'SET_CODE'; code: string }
  | { type: 'CODE_START' }
  | { type: 'CODE_SUCCESS'; reqSent: boolean }
  | { type: 'CODE_FAILURE'; error: string }
  | { type: 'SET_QUERY'; query: string }
  | { type: 'SEARCH_START' }
  | { type: 'SEARCH_SUCCESS'; results: School[] }
  | { type: 'ACTION_ERROR'; error: string }
  | { type: 'REQUEST_START'; schoolId: string }
  | { type: 'REQUEST_SUCCESS' }
  | { type: 'RESET_REQ' };

const joinSchoolReducer = (
  state: TeacherJoinSchoolState,
  action: TeacherJoinSchoolAction,
): TeacherJoinSchoolState => {
  switch (action.type) {
    case 'SET_METHOD':
      return { ...state, method: action.method, actionError: null };
    case 'SET_CODE':
      return { ...state, code: action.code, codeErr: null };
    case 'CODE_START':
      return { ...state, codeLoading: true, codeErr: null };
    case 'CODE_SUCCESS':
      return { ...state, codeLoading: false, reqSent: action.reqSent };
    case 'CODE_FAILURE':
      return { ...state, codeLoading: false, codeErr: action.error };
    case 'SET_QUERY':
      return { ...state, query: action.query, actionError: null };
    case 'SEARCH_START':
      return { ...state, searching: true };
    case 'SEARCH_SUCCESS':
      return { ...state, searching: false, results: action.results, actionError: null };
    case 'REQUEST_START':
      return { ...state, requesting: action.schoolId };
    case 'REQUEST_SUCCESS':
      return { ...state, requesting: null, reqSent: true };
    case 'ACTION_ERROR':
      return { ...state, searching: false, requesting: null, actionError: action.error };
    case 'RESET_REQ':
      return { ...state, reqSent: false };
    default:
      return state;
  }
};

function TeacherJoinSchool({ onJoined }: { onJoined: (schoolId: string) => void }) {
  const user = useAuthStore((state) => state.user);
  const { context } = usePermissions();
  const [state, dispatch] = useReducer(joinSchoolReducer, {
    method: 'code',
    code: '',
    codeErr: null,
    codeLoading: false,
    query: '',
    results: [],
    searching: false,
    requesting: null,
    reqSent: false,
    actionError: null,
  });

  const fmtCode = (v: string) => {
    const raw = v
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 16);
    if (raw.length <= 4) return raw;
    if (raw.length <= 10) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return `${raw.slice(0, 4)}-${raw.slice(4, 10)}-${raw.slice(10)}`;
  };

  const handleCode = useCallback(async () => {
    if (!user?.id || state.code.replace(/-/g, '').length < 16) return;
    dispatch({ type: 'CODE_START' });
    try {
      const res = await validateInviteCode(state.code.trim());
      if (!res.valid || !res.data) {
        dispatch({ type: 'CODE_FAILURE', error: res.error || 'Invalid code' });
        return;
      }
      const capacity = (context.activeBond?.capacity ?? context.primaryCapacity ?? 'teacher') as
        | 'student'
        | 'teacher'
        | 'gradeHead'
        | 'sectionHead'
        | 'principal'
        | 'assistantPrincipal'
        | 'parent'
        | 'guardian'
        | 'admin'
        | 'developer'
        | 'founder'
        | 'librarian'
        | 'nurse'
        | 'guest';
      await onboardingAPI.requestSchoolJoin(
        user.id,
        res.data.school_id,
        capacity === 'guest' ? 'member' : capacity,
      );
      await incrementInviteCodeUsage(state.code.trim());
      const capacitySummary = await api.identity.getClassroomCapacitySummary(user.id);
      const schoolId = capacitySummary.schoolId || capacitySummary.profile.school_id || null;

      if (schoolId) {
        useAuthStore.getState().setUser({ ...user, school_id: schoolId });
        onJoined(schoolId);
      } else {
        dispatch({ type: 'CODE_SUCCESS', reqSent: true });
      }
    } catch (e: unknown) {
      dispatch({
        type: 'CODE_FAILURE',
        error: e instanceof Error ? e.message : 'Something went wrong',
      });
    }
  }, [user, state.code, context, onJoined]);

  const normalizedCodeLength = state.code.replace(/-/g, '').length;

  const handleSearch = useCallback(async () => {
    if (state.query.length < 3) return;
    dispatch({ type: 'SEARCH_START' });
    try {
      const results = await schoolAPI.searchSchools(state.query);
      dispatch({ type: 'SEARCH_SUCCESS', results });
    } catch (error) {
      console.error('Failed to search schools:', error);
      dispatch({ type: 'ACTION_ERROR', error: 'Schools could not be searched. Please try again.' });
    }
  }, [state.query]);

  const handleRequest = useCallback(
    async (schoolId: string) => {
      if (!user?.id) return;
      dispatch({ type: 'REQUEST_START', schoolId });
      try {
        await onboardingAPI.requestSchoolJoin(user.id, schoolId, 'teacher');
        dispatch({ type: 'REQUEST_SUCCESS' });
      } catch (error) {
        console.error('Failed to request school join:', error);
        dispatch({ type: 'ACTION_ERROR', error: 'Your join request could not be sent. Please try again.' });
      }
    },
    [user],
  );

  if (state.reqSent)
    return (
      <SuccessCard
        icon={CircleCheck}
        title="Request Sent!"
        body="Your join request has been sent to the Principal. You'll be notified once approved."
        cta="OK, I'll wait"
        onCta={() => dispatch({ type: 'RESET_REQ' })}
      />
    );

  return (
    <VStack className="gap-4">
      <HStack className="gap-1.5 p-1 bg-phase-surface/40 rounded-[12px] border border-phase-border/20">
        {(
          [
            { id: 'code', label: 'Invite Code', icon: Key },
            { id: 'search', label: 'Search School', icon: Search },
          ] as const
        ).map((m) => {
          const isActive = state.method === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => dispatch({ type: 'SET_METHOD', method: m.id })}
              role="tab"
              accessibilityLabel={m.label}
              accessibilityHint={`Switch to join by ${m.label}`}
              accessibilityState={{ selected: isActive }}
              className={`flex-1 py-2 rounded-lg items-center ${
                isActive ? 'bg-phase-surface shadow-sm' : ''
              }`}
            >
              <HStack className="items-center gap-1.5">
                <Icon
                  as={m.icon}
                  size="xs"
                  className={isActive ? 'text-phase-interactive' : 'text-phaseText-muted'}
                />
                <Text
                  className={`text-[12px] font-bold ${
                    isActive ? 'text-phaseText-primary' : 'text-phaseText-muted'
                  }`}
                >
                  {m.label}
                </Text>
              </HStack>
            </Pressable>
          );
        })}
      </HStack>

      {state.method === 'code' && (
        <VStack className="gap-3">
          <VStack>
            <SectionLabel>Invite Code from Principal</SectionLabel>
            <Input
              className={`bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12 ${
                state.codeErr ? 'border-phase-error' : ''
              }`}
            >
              <InputField
                value={state.code}
                onChangeText={(v) => dispatch({ type: 'SET_CODE', code: fmtCode(v) })}
                placeholder="GURU-ABC123-TEACH"
                className="text-sm font-bold text-phaseText-primary tracking-[2px] uppercase"
                accessibilityLabel="Enter Invite Code"
                accessibilityHint="Paste or type the 16-character invite code provided by your principal"
              />
            </Input>
            {state.codeErr && (
              <Text className="mt-1 text-[11px] text-phase-error">{state.codeErr}</Text>
            )}
          </VStack>
          <SanctuaryButton
            onPress={handleCode}
            isDisabled={normalizedCodeLength < 16 || state.codeLoading}
            className="bg-phase-interactive"
            accessibilityLabel="Join with invite code"
            accessibilityHint="Attempts to join the school using the provided code"
          >
            <HStack className="items-center justify-center gap-2">
              {state.codeLoading ? (
                <BrandPulse size={18} tintColor="#FFFFFF" accessibilityLabel="Joining school" />
              ) : (
                <Icon as={Key} size="xs" className="text-white" />
              )}
              <Text className="text-white font-bold text-sm">
                {state.codeLoading ? 'Joining…' : 'Join with Code'}
              </Text>
            </HStack>
          </SanctuaryButton>
        </VStack>
      )}

      {state.method === 'search' && (
        <VStack className="gap-3">
          <HStack className="gap-2">
            <Input className="flex-1 bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-11">
              <InputField
                value={state.query}
                onChangeText={(query) => dispatch({ type: 'SET_QUERY', query })}
                placeholder="Type school name…"
                className="text-sm font-bold text-phaseText-primary"
                accessibilityLabel="Search schools input"
                accessibilityHint="Type at least 3 characters to find your school"
              />
            </Input>
            <SanctuaryButton
              action="secondary"
              onPress={handleSearch}
              isDisabled={state.query.length < 3 || state.searching}
              className="px-4 h-11"
              accessibilityLabel="Search schools"
              accessibilityHint="Triggers a search for schools matching your query"
            >
              <HStack className="items-center gap-2">
                {state.searching ? (
                  <BrandPulse size={16} accessibilityLabel="Searching schools" />
                ) : (
                  <Icon as={Search} size="xs" />
                )}
                <Text className="text-xs font-bold text-phaseText-primary">Search</Text>
              </HStack>
            </SanctuaryButton>
          </HStack>
          <VStack className="gap-2 max-h-[220px]">
            {state.actionError ? (
              <Text className="text-xs text-phase-error" accessibilityRole="alert">{state.actionError}</Text>
            ) : null}
            <ScrollView showsVerticalScrollIndicator={false}>
              {state.results.map((s: School) => (
                <Box
                  key={s.id}
                  className="flex-row items-center justify-between p-3.5 mb-2 rounded-xl bg-phase-surface-secondary border border-phase-border/40"
                >
                  <VStack>
                    <Text className="text-sm font-bold text-phaseText-primary">{s.name}</Text>
                    <Text className="text-[11px] text-phaseText-muted uppercase">{s.type}</Text>
                  </VStack>
                  <SanctuaryButton
                    action="secondary"
                    onPress={() => handleRequest(s.id)}
                    isDisabled={state.requesting === s.id}
                    className="h-8 px-3"
                    accessibilityLabel={`Request to join ${s.name}`}
                    accessibilityHint={`Sends a join request to ${s.name} administrators`}
                  >
                    <Text className="text-[11px] font-bold text-phaseText-primary">
                      {state.requesting === s.id ? '...' : 'Request Join'}
                    </Text>
                  </SanctuaryButton>
                </Box>
              ))}
            </ScrollView>
            {!state.searching && state.query.length >= 3 && state.results.length === 0 && (
              <Text className="text-xs text-phaseText-muted text-center italic">
                No schools found.
              </Text>
            )}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

// -- TeacherCreateStandaloneClassroom ------------------------

type StandaloneClassroomState = {
  name: string;
  subject: string;
  loading: boolean;
  error: string | null;
  createdName: string | null;
};

type StandaloneClassroomAction =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_SUBJECT'; subject: string }
  | { type: 'CREATE_START' }
  | { type: 'CREATE_SUCCESS'; name: string }
  | { type: 'CREATE_FAILURE'; error: string };

const standaloneClassroomReducer = (
  state: StandaloneClassroomState,
  action: StandaloneClassroomAction,
): StandaloneClassroomState => {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_SUBJECT':
      return { ...state, subject: action.subject };
    case 'CREATE_START':
      return { ...state, loading: true, error: null };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false, createdName: action.name };
    case 'CREATE_FAILURE':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

function TeacherCreateStandaloneClassroom({ onSuccess }: { onSuccess: () => void }) {
  const { context } = usePermissions();
  const { userId } = context;

  const [state, dispatch] = useReducer(standaloneClassroomReducer, {
    name: '',
    subject: '',
    loading: false,
    error: null,
    createdName: null,
  });

  const handleCreate = useCallback(async () => {
    if (!userId || !state.name.trim()) return;
    dispatch({ type: 'CREATE_START' });
    try {
      await api.classrooms.create({
        name: state.name.trim(),
        subject: state.subject.trim() || undefined,
        teacher_id: userId,
        school_id: null,
        is_archived: false,
      });
      dispatch({ type: 'CREATE_SUCCESS', name: state.name.trim() });
    } catch (e: unknown) {
      dispatch({
        type: 'CREATE_FAILURE',
        error: e instanceof Error ? e.message : 'Failed to create classroom',
      });
    }
  }, [userId, state.name, state.subject]);

  if (state.createdName)
    return (
      <SuccessCard
        icon={BookOpen}
        title={`"${state.createdName}" is ready!`}
        body="Your personal classroom is live. Start adding students and lessons."
        cta="Go to my classroom"
        onCta={onSuccess}
      />
    );

  return (
    <VStack className="gap-4">
      <Box className="p-4 bg-phase-interactive/5 rounded-xl border border-phase-interactive/10">
        <Text className="text-[12px] text-phaseText-muted leading-[1.6]">
          A <Text className="font-bold text-phaseText-primary">standalone classroom</Text> is
          personal &mdash; it&apos;s not linked to any school.
        </Text>
      </Box>
      <VStack>
        <SectionLabel>Classroom Name *</SectionLabel>
        <Input className="bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12">
          <InputField
            value={state.name}
            onChangeText={(name) => dispatch({ type: 'SET_NAME', name })}
            placeholder="e.g. Grade 10B Science"
            className="text-sm font-bold text-phaseText-primary"
            accessibilityLabel="Classroom Name Input"
            accessibilityHint="Enter the name for your personal classroom"
          />
        </Input>
      </VStack>
      <VStack>
        <SectionLabel>Subject</SectionLabel>
        <Input className="bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12">
          <InputField
            value={state.subject}
            onChangeText={(subject) => dispatch({ type: 'SET_SUBJECT', subject })}
            placeholder="e.g. Biology"
            className="text-sm font-bold text-phaseText-primary"
            accessibilityLabel="Subject Input"
            accessibilityHint="Optionally specify the subject for this classroom"
          />
        </Input>
      </VStack>
      {state.error && <Text className="text-xs text-phase-error text-center">{state.error}</Text>}
      <SanctuaryButton
        onPress={handleCreate}
        isDisabled={!state.name.trim() || state.loading}
        className="bg-phase-interactive"
        accessibilityLabel="Create personal classroom now"
        accessibilityHint="Initializes your standalone classroom"
      >
        <HStack className="items-center justify-center gap-2">
          {state.loading ? (
            <BrandPulse size={18} tintColor="#FFFFFF" accessibilityLabel="Creating classroom" />
          ) : (
            <Icon as={BookOpen} size="xs" className="text-white" />
          )}
          <Text className="text-white font-bold text-sm">Create Classroom</Text>
        </HStack>
      </SanctuaryButton>
    </VStack>
  );
}

function TeacherFlow({ onSuccess }: { onSuccess: () => void }) {
  const [tab, setTab] = useState<'join_school' | 'standalone'>('join_school');
  const [joinedSchoolId, setJoinedSchoolId] = useState<string | null>(null);

  const TABS = [
    { id: 'join_school', label: 'Join a School', icon: Building2 },
    { id: 'standalone', label: 'Personal Classroom', icon: BookOpen },
  ] as const;

  return (
    <VStack className="gap-6">
      <HStack
        className="gap-1.5 p-1 bg-phase-surface/40 rounded-[12px] border border-phase-border/20"
        role="tablist"
      >
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              role="tab"
              accessibilityLabel={t.label}
              accessibilityHint={`Switch to ${t.label} flow`}
              accessibilityState={{ selected: isActive }}
              className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${
                isActive ? 'bg-phase-surface shadow-sm' : ''
              }`}
            >
              <Icon
                as={t.icon}
                size="xs"
                className={isActive ? 'text-phase-interactive' : 'text-phaseText-muted'}
              />
              <Text
                className={`text-[12px] font-bold ${
                  isActive ? 'text-phase-interactive' : 'text-phaseText-muted'
                }`}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {tab === 'join_school' &&
        (joinedSchoolId ? (
          <SuccessCard
            icon={CircleCheck}
            title="Joined!"
            body="You've been added to the school. Go ahead and create your classroom."
            cta="Continue"
            onCta={onSuccess}
          />
        ) : (
          <TeacherJoinSchool
            onJoined={(id) => {
              setJoinedSchoolId(id);
              onSuccess();
            }}
          />
        ))}

      {tab === 'standalone' && <TeacherCreateStandaloneClassroom onSuccess={onSuccess} />}
    </VStack>
  );
}

// -- StudentJoinClassroom ------------------------------------

type StudentJoinState = {
  code: string;
  loading: boolean;
  error: string | null;
  done: boolean;
};

type StudentJoinAction =
  | { type: 'SET_CODE'; code: string }
  | { type: 'JOIN_START' }
  | { type: 'JOIN_SUCCESS' }
  | { type: 'JOIN_FAILURE'; error: string };

const studentJoinReducer = (
  state: StudentJoinState,
  action: StudentJoinAction,
): StudentJoinState => {
  switch (action.type) {
    case 'SET_CODE':
      return { ...state, code: action.code, error: null };
    case 'JOIN_START':
      return { ...state, loading: true, error: null };
    case 'JOIN_SUCCESS':
      return { ...state, loading: false, done: true };
    case 'JOIN_FAILURE':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};

function StudentJoinClassroom({ onSuccess }: { onSuccess: () => void }) {
  const [state, dispatch] = useReducer(studentJoinReducer, {
    code: '',
    loading: false,
    error: null,
    done: false,
  });

  const handleClaim = useCallback(async () => {
    if (!state.code.trim()) return;
    dispatch({ type: 'JOIN_START' });
    try {
      await api.classroomStudents.claimStudent(state.code.trim());
      dispatch({ type: 'JOIN_SUCCESS' });
    } catch (e: unknown) {
      dispatch({
        type: 'JOIN_FAILURE',
        error: e instanceof Error ? e.message : 'Invalid code or record already claimed',
      });
    }
  }, [state.code]);

  if (state.done)
    return (
      <SuccessCard
        icon={CircleCheck}
        title="Enrolled!"
        body="You've been linked to your classroom. Your teacher will see you in the roll."
        cta="Go to my classes"
        onCta={onSuccess}
      />
    );

  return (
    <VStack className="gap-5">
      <Box className="p-4 bg-phase-interactive/5 rounded-xl border border-phase-interactive/10">
        <HStack className="items-center gap-3">
          <Icon as={Users} size="xs" className="text-phase-interactive" />
          <Text className="text-[12px] text-phaseText-muted leading-[1.6] flex-1">
            Ask your teacher for your classroom invite code (typically 8 characters).
          </Text>
        </HStack>
      </Box>

      <VStack>
        <SectionLabel>Your Classroom Code</SectionLabel>
        <Input
          className={`bg-phase-surface-secondary border-phase-border rounded-2xl px-6 h-20 items-center justify-center ${
            state.error ? 'border-phase-error' : ''
          }`}
        >
          <InputField
            value={state.code}
            onChangeText={(v) => dispatch({ type: 'SET_CODE', code: v.toLowerCase().slice(0, 12) })}
            placeholder="a1b2c3d4"
            className="text-[28px] font-black text-phaseText-primary tracking-[6px] text-center uppercase"
            // @ts-expect-error - style with outline is web-specific
            style={{ outline: 'none' }}
            accessibilityLabel="Classroom invite code input"
            accessibilityHint="8-character code provided by your teacher"
          />
        </Input>
        {state.error && (
          <Text className="mt-2 text-xs text-phase-error text-center">{state.error}</Text>
        )}
      </VStack>

      <SanctuaryButton
        onPress={handleClaim}
        isDisabled={state.code.length < 6 || state.loading}
        className="bg-phase-interactive h-14"
        accessibilityLabel="Join Classroom now"
        accessibilityHint="Redeems your classroom code and enrolls you in the class"
      >
        <HStack className="items-center justify-center gap-2">
          {state.loading ? (
            <BrandPulse size={18} tintColor="#FFFFFF" accessibilityLabel="Joining classroom" />
          ) : (
            <Icon as={BookOpen} size="xs" className="text-white" />
          )}
          <Text className="text-white font-bold text-sm">Join Classroom</Text>
        </HStack>
      </SanctuaryButton>
    </VStack>
  );
}

// -- Main Component -------------------------------------------

export default function NoSchoolView() {
  const { can } = usePermissions();
  const router = useRouter();

  const canCreateSchool = can('create', 'School');
  const canCreateClassroom = can('create', 'Classroom');
  const canJoinClassroom = can('submit', 'AssignmentSubmission');

  const handleSuccess = useCallback(() => {
    router.push('/workspace');
  }, [router]);

  const META = canCreateSchool
    ? {
        icon: Building2,
        heading: 'Create your school',
        sub: 'Set up your school sanctuary. Invite teachers and students once ready.',
      }
    : canCreateClassroom
      ? {
          icon: BookOpen,
          heading: 'Set up your classroom',
          sub: 'Join a school, or create a standalone personal classroom right away.',
        }
      : {
          icon: Users,
          heading: 'Join your classroom',
          sub: 'Enter the invite code your teacher gave you to link your account.',
        };

  return (
    <ScrollView className="bg-phase-canvas">
      <VStack className="max-w-[520px] mx-auto py-12 px-6 w-full">
        <VStack className="items-center text-center mb-10">
          <META.icon size={44} color="#4F7DA3" aria-hidden />
          <Heading className="text-[28px] font-black text-phaseText-primary mb-2">
            {META.heading}
          </Heading>
          <Text className="text-center text-phaseText-muted text-sm leading-[1.6] max-w-[380px]">
            {META.sub}
          </Text>
        </VStack>

        <Box className="bg-phase-surface p-8 rounded-[32px] border border-phase-border shadow-2xl">
          {canCreateSchool && <PrincipalCreateSchool onSuccess={handleSuccess} />}
          {canCreateClassroom && <TeacherFlow onSuccess={handleSuccess} />}
          {canJoinClassroom && !canCreateClassroom && (
            <StudentJoinClassroom onSuccess={handleSuccess} />
          )}
        </Box>
      </VStack>
    </ScrollView>
  );
}
