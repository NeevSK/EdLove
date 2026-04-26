import { useNavigation } from '@react-navigation/native';
import {
  api,
  communityAPI,
  incrementInviteCodeUsage,
  onboardingAPI,
  schoolAPI,
  usePermissions,
  useStore,
  validateInviteCode,
} from '@repo/core';
import {
  Box,
  Center,
  HStack,
  Icon,
  Input,
  InputField,
  Pressable,
  SanctuaryButton,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@repo/ui';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Key,
  Search,
  Users,
} from 'lucide-react-native';
import type React from 'react';
import { useCallback, useState } from 'react';

// -- Helpers --------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-[11px] font-black text-phaseText-muted uppercase tracking-[1px] mb-2">
      {children}
    </Text>
  );
}

function SuccessCard({
  emoji,
  title,
  body,
  cta,
  onCta,
}: {
  emoji: string;
  title: string;
  body: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <VStack className="items-center gap-4 py-6 px-4 text-center">
      <Center className="w-16 h-16 rounded-full bg-phase-success/10">
        <Icon as={CheckCircle2} size="xl" className="text-phase-success" />
      </Center>
      <Text className="text-[28px]">{emoji}</Text>
      <VStack className="items-center">
        <h3 className="m-0 text-xl font-black text-phaseText-primary">{title}</h3>
        <Text className="m-0 text-phaseText-muted text-[13px] max-w-[380px]">{body}</Text>
      </VStack>
      <SanctuaryButton variant="primary" onPress={onCta} className="bg-phase-interactive">
        <HStack className="items-center gap-2">
          <Text className="text-white font-bold">{cta}</Text>
          <Icon as={ArrowRight} size="xs" className="text-white" />
        </HStack>
      </SanctuaryButton>
    </VStack>
  );
}

const SCHOOL_TYPES = [
  { value: 'primary', label: 'Primary School', emoji: '🏫', desc: 'Grades 1–5' },
  { value: 'secondary', label: 'Secondary School', emoji: '🎓', desc: 'Grades 6–13' },
  { value: 'mixed', label: 'Mixed / All Grades', emoji: '🌿', desc: 'All grade levels' },
] as const;

// -- subcomponents -------------------------------------------

function PrincipalCreateSchool({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useStore();
  const [step, setStep] = useState<'details' | 'type' | 'done'>('details');
  const [name, setName] = useState('');
  const [type, setType] = useState<'primary' | 'secondary' | 'mixed'>('mixed');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const handleCreate = async () => {
    if (!user?.id || !name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const handle = name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9_-]/g, '');
      const school = await schoolAPI.create({
        name: name.trim(),
        handle,
        type,
        created_by: user.id,
      });
      try {
        await communityAPI.createGroupWithOwner(
          {
            name: `${name.trim()} HQ`,
            description: `Official community portal for ${name.trim()}`,
            type: 'general',
            join_policy: 'open',
            school_id: school.id,
          },
          user.id,
        );
      } catch {
        /* non-fatal */
      }
      setSchoolName(school.name);
      useStore.getState().setUser({ ...user, school_id: school.id });
      setStep('done');
    } catch (e: any) {
      setError(e?.message || 'Failed to create school');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'done')
    return (
      <SuccessCard
        emoji="🏛️"
        title={`${schoolName} is live!`}
        body="Your school sanctuary is ready. Invite teachers, create classrooms and start your journey."
        cta="Set up my school"
        onCta={onSuccess}
      />
    );

  return (
    <VStack className="gap-5">
      {step === 'details' && (
        <>
          <VStack>
            <SectionLabel>School Name *</SectionLabel>
            <Input className="bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12">
              <InputField
                value={name}
                onChangeText={setName}
                placeholder="e.g. Gurudevi Life School"
                className="text-sm font-bold text-phaseText-primary"
              />
            </Input>
          </VStack>
          <SanctuaryButton
            onPress={() => setStep('type')}
            disabled={!name.trim()}
            className="bg-phase-interactive"
          >
            <HStack className="items-center justify-center gap-2">
              <Text className="text-white font-bold text-sm">Next — Choose school type</Text>
              <Icon as={ChevronRight} size="xs" className="text-white" />
            </HStack>
          </SanctuaryButton>
        </>
      )}

      {step === 'type' && (
        <>
          <Text className="m-0 text-phaseText-muted text-[13px]">
            What kind of school is <Text className="font-bold text-phaseText-primary">{name}</Text>?
          </Text>
          {SCHOOL_TYPES.map((t) => (
            <Pressable
              key={t.value}
              onPress={() => setType(t.value)}
              className={`flex-row items-center gap-4 p-4 rounded-xl border-2 ${type === t.value ? 'bg-phase-interactive/5 border-phase-interactive' : 'bg-phase-surface-secondary border-phase-border'}`}
            >
              <Text className="text-[22px]">{t.emoji}</Text>
              <VStack className="flex-1">
                <Text className="text-sm font-bold text-phaseText-primary">{t.label}</Text>
                <Text className="text-xs text-phaseText-muted">{t.desc}</Text>
              </VStack>
              {type === t.value && (
                <Icon as={CheckCircle2} size="xs" className="text-phase-interactive" />
              )}
            </Pressable>
          ))}
          {error && <Text className="m-0 text-xs text-phase-error">{error}</Text>}
          <HStack className="gap-3">
            <SanctuaryButton
              onPress={() => setStep('details')}
              className="flex-1 border-phase-border"
            >
              <Text className="font-bold text-phaseText-secondary text-sm">← Back</Text>
            </SanctuaryButton>
            <SanctuaryButton
              onPress={handleCreate}
              disabled={loading}
              className="flex-[2] bg-phase-interactive"
            >
              <HStack className="items-center justify-center gap-2">
                {loading ? (
                  <Spinner size="small" color="#FFFFFF" />
                ) : (
                  <Icon as={Building2} size="xs" className="text-white" />
                )}
                <Text className="text-white font-bold text-sm">
                  {loading ? 'Creating…' : 'Create School'}
                </Text>
              </HStack>
            </SanctuaryButton>
          </HStack>
        </>
      )}
    </VStack>
  );
}

function TeacherJoinSchool({ onJoined }: { onJoined: (schoolId: string) => void }) {
  const { user } = useStore();
  const [method, setMethod] = useState<'code' | 'search'>('code');

  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);

  const fmtCode = (v: string) => {
    const raw = v
      .replace(/[^A-Za-z0-9]/g, '')
      .toUpperCase()
      .slice(0, 16);
    if (raw.length <= 4) return raw;
    if (raw.length <= 10) return `${raw.slice(0, 4)}-${raw.slice(4)}`;
    return `${raw.slice(0, 4)}-${raw.slice(4, 10)}-${raw.slice(10)}`;
  };

  const { context } = usePermissions();
  const handleCode = async () => {
    if (!user?.id) return;
    setCodeLoading(true);
    setCodeErr('');
    try {
      const res = await validateInviteCode(code.trim());
      if (!res.valid || !res.data) {
        setCodeErr(res.error || 'Invalid code');
        return;
      }
      await onboardingAPI.requestSchoolJoin(
        user.id,
        res.data.school_id,
        (context?.roles?.[0] as any) || 'teacher',
      );
      await incrementInviteCodeUsage(code.trim());
      const roleSummary = await api.identity.getClassroomRoleSummary(user.id);
      const schoolId = roleSummary.schoolId || roleSummary.profile.school_id || null;
      if (schoolId) {
        useStore.getState().setUser({ ...user, school_id: schoolId });
        onJoined(schoolId);
      } else {
        setReqSent(true);
      }
    } catch (e: any) {
      setCodeErr(e?.message || 'Something went wrong');
    } finally {
      setCodeLoading(false);
    }
  };

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [reqSent, setReqSent] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.length < 3) return;
    setSearching(true);
    try {
      setResults(await schoolAPI.searchSchools(query));
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleRequest = async (schoolId: string) => {
    if (!user?.id) return;
    setRequesting(schoolId);
    try {
      await onboardingAPI.requestSchoolJoin(user.id, schoolId, 'teacher');
      setReqSent(true);
    } finally {
      setRequesting(null);
    }
  };

  if (reqSent)
    return (
      <SuccessCard
        emoji="📬"
        title="Request Sent!"
        body="Your join request has been sent to the Principal. You'll be notified once approved."
        cta="OK, I'll wait"
        onCta={() => setReqSent(false)}
      />
    );

  return (
    <VStack className="gap-4">
      <HStack className="gap-1.5 p-1 bg-phase-surface/40 rounded-[12px] border border-phase-border/20">
        {(
          [
            { id: 'code', label: '🔑 Invite Code' },
            { id: 'search', label: '🔍 Search School' },
          ] as const
        ).map((m) => {
          const isActive = method === m.id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setMethod(m.id)}
              className={`flex-1 py-2 rounded-lg items-center ${isActive ? 'bg-phase-surface shadow-sm' : ''}`}
            >
              <Text
                className={`text-[12px] font-bold ${isActive ? 'text-phaseText-primary' : 'text-phaseText-muted'}`}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </HStack>

      {method === 'code' && (
        <VStack className="gap-3">
          <VStack>
            <SectionLabel>Invite Code from Principal</SectionLabel>
            <Input
              className={`bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12 ${codeErr ? 'border-phase-error' : ''}`}
            >
              <InputField
                value={code}
                onChangeText={(v) => setCode(fmtCode(v))}
                placeholder="GURU-ABC123-TEACH"
                className="text-sm font-bold text-phaseText-primary tracking-[2px] uppercase"
              />
            </Input>
            {codeErr && <Text className="mt-1 text-[11px] text-phase-error">{codeErr}</Text>}
          </VStack>
          <SanctuaryButton
            onPress={handleCode}
            disabled={code.length < 15 || codeLoading}
            className="bg-phase-interactive"
          >
            <HStack className="items-center justify-center gap-2">
              {codeLoading ? (
                <Spinner size="small" color="#FFFFFF" />
              ) : (
                <Icon as={Key} size="xs" className="text-white" />
              )}
              <Text className="text-white font-bold text-sm">
                {codeLoading ? 'Joining…' : 'Join with Code'}
              </Text>
            </HStack>
          </SanctuaryButton>
        </VStack>
      )}

      {method === 'search' && (
        <VStack className="gap-3">
          <HStack className="gap-2">
            <Input className="flex-1 bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-11">
              <InputField
                value={query}
                onChangeText={setQuery}
                placeholder="Type school name…"
                className="text-sm font-bold text-phaseText-primary"
              />
            </Input>
            <SanctuaryButton
              variant="secondary"
              onPress={handleSearch}
              disabled={query.length < 3 || searching}
              className="px-4 h-11"
            >
              <HStack className="items-center gap-2">
                {searching ? <Spinner size="small" /> : <Icon as={Search} size="xs" />}
                <Text className="text-xs font-bold text-phaseText-primary">Search</Text>
              </HStack>
            </SanctuaryButton>
          </HStack>
          <VStack className="gap-2 max-h-[220px]">
            <ScrollView showsVerticalScrollIndicator={false}>
              {results.map((s) => (
                <Box
                  key={s.id}
                  className="flex-row items-center justify-between p-3.5 mb-2 rounded-xl bg-phase-surface-secondary border border-phase-border/40"
                >
                  <VStack>
                    <Text className="text-sm font-bold text-phaseText-primary">{s.name}</Text>
                    <Text className="text-[11px] text-phaseText-muted uppercase">{s.type}</Text>
                  </VStack>
                  <SanctuaryButton
                    variant="secondary"
                    onPress={() => handleRequest(s.id)}
                    disabled={requesting === s.id}
                    className="h-8 px-3"
                  >
                    <Text className="text-[11px] font-bold text-phaseText-primary">
                      {requesting === s.id ? '...' : 'Request Join'}
                    </Text>
                  </SanctuaryButton>
                </Box>
              ))}
            </ScrollView>
            {!searching && query.length >= 3 && results.length === 0 && (
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

function TeacherCreateStandaloneClassroom({ onSuccess }: { onSuccess: () => void }) {
  const { context } = usePermissions();
  const { userId } = context;
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ name: string } | null>(null);

  const handleCreate = async () => {
    if (!userId || !name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.classrooms.create({
        name: name.trim(),
        subject: subject.trim() || undefined,
        teacher_id: userId,
        school_id: null,
        is_archived: false,
      });
      setCreated({ name: name.trim() });
    } catch (e: any) {
      setError(e?.message || 'Failed to create classroom');
    } finally {
      setLoading(false);
    }
  };

  if (created)
    return (
      <SuccessCard
        emoji="📚"
        title={`"${created.name}" is ready!`}
        body="Your personal classroom is live. Start adding students and lessons."
        cta="Go to my classroom"
        onCta={onSuccess}
      />
    );

  return (
    <VStack className="gap-4">
      <Box className="p-4 bg-phase-interactive/5 rounded-xl border border-phase-interactive/10">
        <Text className="text-[12px] text-phaseText-muted leading-[1.6]">
          💡 A <Text className="font-bold text-phaseText-primary">standalone classroom</Text> is
          personal &mdash; it's not linked to any school.
        </Text>
      </Box>
      <VStack>
        <SectionLabel>Classroom Name *</SectionLabel>
        <Input className="bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12">
          <InputField
            value={name}
            onChangeText={setName}
            placeholder="e.g. Grade 10B Science"
            className="text-sm font-bold text-phaseText-primary"
          />
        </Input>
      </VStack>
      <VStack>
        <SectionLabel>Subject</SectionLabel>
        <Input className="bg-phase-surface-secondary border-phase-border rounded-xl px-4 h-12">
          <InputField
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Biology"
            className="text-sm font-bold text-phaseText-primary"
          />
        </Input>
      </VStack>
      {error && <Text className="text-xs text-phase-error">{error}</Text>}
      <SanctuaryButton
        onPress={handleCreate}
        disabled={!name.trim() || loading}
        className="bg-phase-interactive"
      >
        <HStack className="items-center justify-center gap-2">
          {loading ? (
            <Spinner size="small" color="#FFFFFF" />
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
      <HStack className="gap-1.5 p-1 bg-phase-surface/40 rounded-[12px] border border-phase-border/20">
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center gap-2 ${isActive ? 'bg-phase-surface shadow-sm' : ''}`}
            >
              <Icon
                as={t.icon}
                size="xs"
                className={isActive ? 'text-phase-interactive' : 'text-phaseText-muted'}
              />
              <Text
                className={`text-[12px] font-bold ${isActive ? 'text-phase-interactive' : 'text-phaseText-muted'}`}
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
            emoji="🎉"
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

function StudentJoinClassroom({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleClaim = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await api.classroomStudents.claimStudent(code.trim());
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Invalid code or record already claimed');
    } finally {
      setLoading(false);
    }
  };

  if (done)
    return (
      <SuccessCard
        emoji="🌱"
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
          className={`bg-phase-surface-secondary border-phase-border rounded-2xl px-6 h-20 items-center justify-center ${error ? 'border-phase-error' : ''}`}
        >
          <InputField
            value={code}
            onChangeText={(v) => setCode(v.toLowerCase().slice(0, 12))}
            placeholder="a1b2c3d4"
            className="text-[28px] font-black text-phaseText-primary tracking-[6px] text-center uppercase"
            style={{ outline: 'none' } as any}
          />
        </Input>
        {error && <Text className="mt-2 text-xs text-phase-error text-center">{error}</Text>}
      </VStack>

      <SanctuaryButton
        onPress={handleClaim}
        disabled={code.length < 6 || loading}
        className="bg-phase-interactive h-14"
      >
        <HStack className="items-center justify-center gap-2">
          {loading ? (
            <Spinner size="small" color="#FFFFFF" />
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
  const navigation = useNavigation<any>();

  const canCreateSchool = can('create', 'School');
  const canCreateClassroom = can('create', 'Classroom');
  const canJoinClassroom = can('submit', 'AssignmentSubmission');

  const handleSuccess = () => {
    try {
      (navigation.navigate as any)('Classroom');
    } catch {
      /* noop */
    }
  };

  const META = canCreateSchool
    ? {
        emoji: '🏛️',
        heading: 'Create your school',
        sub: 'Set up your school sanctuary. Invite teachers and students once ready.',
      }
    : canCreateClassroom
      ? {
          emoji: '📚',
          heading: 'Set up your classroom',
          sub: 'Join a school, or create a standalone personal classroom right away.',
        }
      : {
          emoji: '🌱',
          heading: 'Join your classroom',
          sub: 'Enter the invite code your teacher gave you to link your account.',
        };

  return (
    <ScrollView className="bg-phase-canvas">
      <VStack className="max-w-[520px] mx-auto py-12 px-6 w-full">
        <VStack className="items-center text-center mb-10">
          <Text className="text-5xl mb-3">{META.emoji}</Text>
          <h1 className="text-[28px] font-black text-phaseText-primary mb-2">{META.heading}</h1>
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
