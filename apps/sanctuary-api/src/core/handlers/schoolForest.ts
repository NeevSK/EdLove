import {
  type GratitudeGift,
  type SchoolForestState,
  type SchoolPulse,
  schoolForestContract,
} from '@repo/core/api/schoolForest.contract';
import { SovereignError } from '@repo/core/types/Errors';
import { queryDatabaseRows } from '@repo/database/client';
import { assertDatabase } from '../apiErrors';
import { implement, type ORPCContext } from '../orpc';
import { doubleGateMiddleware } from '../orpcMiddleware';

const impl = implement(schoolForestContract).$context<ORPCContext>();
const giftMessages = {
  lantern: [
    'Your principal lit a lantern for you today.',
    'ඔබේ විදුහල්පති අද ඔබ සඳහා ලාම්පුවක් දැල්වීය.',
    'இன்று உங்கள் அதிபர் உங்களுக்காக ஒரு விளக்கை ஏற்றினார்.',
  ],
  rain: [
    'Your school sees the work you are doing. Thank you.',
    'ඔබේ පාසල ඔබ කරන කාර්ය දකී. ස්තූතියි.',
    'உங்கள் பள்ளி நீங்கள் செய்யும் வேலையைப் பார்க்கிறது. நன்றி.',
  ],
  sunlight: [
    'You brought light to this school this week.',
    'ඔබ මේ සතියේ ඔබේ පාසලට ආලෝකය ගෙනආ.',
    'இந்த வாரம் நீங்கள் இந்த பள்ளிக்கு ஒளி கொண்டு வந்தீர்கள்.',
  ],
  seed: [
    'What you planted here will grow long after this season.',
    'ඔබ මෙහි රෝපණය කළ දෙය මෙම කාලයෙන් ඔබ්බට වැඩෙනු ඇත.',
    'நீங்கள் இங்கே நட்டது இந்த பருவக்காலத்திற்கு அப்பால் வளரும்.',
  ],
} as const;

const requireUser = (context: ORPCContext) => {
  assertDatabase(context);
  if (context.user.id === 'anonymous') throw SovereignError.authenticationRequired();
};

const iso = (value: unknown) => (value ? new Date(String(value)).toISOString() : null);
const mapGift = (row: any): GratitudeGift => ({
  id: String(row.id),
  sender_user_id: String(row.sender_user_id),
  recipient_user_id: String(row.recipient_user_id),
  school_id: row.school_id ? String(row.school_id) : null,
  message: row.message ?? null,
  gift_type: row.gift_type,
  warm_message_en: String(row.warm_message_en),
  warm_message_si: row.warm_message_si ?? null,
  warm_message_ta: row.warm_message_ta ?? null,
  delivered: Boolean(row.delivered),
  delivered_at: iso(row.delivered_at),
  created_at: iso(row.created_at) ?? new Date(0).toISOString(),
});

const requirePrincipalScope = async (
  context: ORPCContext,
  recipientUserId: string,
  schoolId?: string,
) => {
  const sender = await context.db.user.findUnique({
    where: { id: context.user.id },
    select: { capacity: true, school_id: true },
  });
  const recipient = await context.db.user.findUnique({
    where: { id: recipientUserId },
    select: { capacity: true, school_id: true },
  });
  const allowedCapacities = ['admin', 'principal', 'assistant_principal'];
  if (
    !sender ||
    !recipient ||
    !allowedCapacities.includes(sender.capacity ?? '') ||
    recipient.capacity !== 'teacher' ||
    sender.school_id !== recipient.school_id ||
    (schoolId && schoolId !== recipient.school_id)
  ) {
    throw SovereignError.unauthorized('create', 'gratitude gift');
  }
  return recipient.school_id;
};

const requireSchoolReadScope = async (context: ORPCContext, schoolId: string) => {
  requireUser(context);
  const viewer = await context.db.user.findUnique({
    where: { id: context.user.id },
    select: { capacity: true, school_id: true },
  });
  const allowedCapacities = [
    'admin',
    'principal',
    'assistant_principal',
    'assistantPrincipal',
    'section_head',
    'grade_head',
  ];
  if (
    !viewer ||
    viewer.school_id !== schoolId ||
    !allowedCapacities.includes(viewer.capacity ?? '')
  ) {
    throw SovereignError.unauthorized('read', 'school forest');
  }
};

const computeTreeHealth = (
  presenceSignals: number,
  nourishingSignals: number,
  weavingSignals: number,
  durationDays: number,
) => {
  const totalSignals = presenceSignals + nourishingSignals + weavingSignals;
  if (totalSignals === 0) return 'seedling' as const;
  const activeDimensions = [presenceSignals > 0, nourishingSignals > 0, weavingSignals > 0].filter(
    Boolean,
  ).length;
  if (durationDays > 180 && activeDimensions >= 3 && totalSignals > 30) return 'ancient' as const;
  if (activeDimensions >= 2 && weavingSignals > 2) return 'flowering' as const;
  if (presenceSignals >= 5 && nourishingSignals >= 3) return 'flourishing' as const;
  if (presenceSignals >= 3) return 'growing' as const;
  return 'seedling' as const;
};
const forestWeather = (trees: SchoolForestState['trees']): SchoolForestState['forest_weather'] => {
  if (trees.length === 0) return 'quiet';
  const flourishing = trees.filter((tree) =>
    ['flowering', 'flourishing', 'ancient'].includes(tree.tree_health),
  ).length;
  const fraction = flourishing / trees.length;
  if (fraction > 0.6) return 'radiant';
  if (fraction > 0.4) return 'lush';
  if (fraction > 0.2) return 'steady';
  return trees.filter((tree) => tree.needs_rain).length > trees.length * 0.3 ? 'quiet' : 'resting';
};
const forestNarrative = (
  weather: SchoolForestState['forest_weather'],
  trees: SchoolForestState['trees'],
) => {
  const active = trees.filter((tree) => tree.tree_health !== 'seedling').length;
  const needsRain = trees.filter((tree) => tree.needs_rain).length;
  const prefix =
    weather === 'radiant'
      ? `Your school forest is radiant this week — ${active} of ${trees.length} trees are alive with activity.`
      : weather === 'lush'
        ? 'The forest is lush and growing — most trees have been active.'
        : weather === 'steady'
          ? `The forest is steady — ${active} trees are engaged, others at rest.`
          : weather === 'quiet'
            ? 'The forest is very quiet this week. Some trees may need rain.'
            : 'The forest is in a resting season. That is natural and necessary.';
  return needsRain > 0
    ? `${prefix} ${needsRain} ${needsRain === 1 ? 'tree needs' : 'trees need'} some rain — a gentle check-in may help.`
    : prefix;
};

async function computeForestState(schoolId: string): Promise<SchoolForestState> {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000).toISOString();
  const teachers = await queryDatabaseRows<{ id: string }>(
    "select id from public.users where school_id = $1::uuid and capacity = 'teacher'",
    [schoolId],
  );
  if (teachers.length === 0) {
    return {
      school_id: schoolId,
      trees: [],
      forest_weather: 'quiet',
      forest_narrative_en: 'The forest is young — teachers are still finding their way here.',
      computed_at: now.toISOString(),
    };
  }
  const teacherIds = teachers.map((teacher) => teacher.id);
  const [signals, states] = await Promise.all([
    queryDatabaseRows<{ user_id: string; dimension: string; created_at: string }>(
      'select user_id, dimension, created_at from public.growth_events where user_id = any($1::uuid[]) and created_at >= $2::timestamptz',
      [teacherIds, fourteenDaysAgo],
    ),
    queryDatabaseRows<{
      user_id: string;
      created_at: string | null;
      blooming_signals: number | null;
    }>(
      'select user_id, created_at, blooming_signals from public.user_growth_state where user_id = any($1::uuid[])',
      [teacherIds],
    ),
  ]);
  const signalMap = new Map<string, typeof signals>();
  for (const signal of signals)
    signalMap.set(signal.user_id, [...(signalMap.get(signal.user_id) ?? []), signal]);
  const stateMap = new Map(states.map((state) => [state.user_id, state]));
  const trees = teachers.map((teacher) => {
    const teacherSignals = signalMap.get(teacher.id) ?? [];
    const lastSignal =
      teacherSignals
        .slice()
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0]?.created_at ??
      null;
    const daysSince = lastSignal
      ? Math.floor((now.getTime() - new Date(lastSignal).getTime()) / 86400000)
      : 999;
    const state = stateMap.get(teacher.id);
    const health = computeTreeHealth(
      teacherSignals.filter((signal) => signal.dimension === 'presence').length,
      teacherSignals.filter((signal) => signal.dimension === 'nourishing').length,
      teacherSignals.filter((signal) => signal.dimension === 'weaving').length,
      state?.created_at
        ? Math.floor((now.getTime() - new Date(state.created_at).getTime()) / 86400000)
        : 0,
    );
    return {
      user_id: teacher.id,
      tree_health: health,
      has_thuthimal: (state?.blooming_signals ?? 0) > 0,
      last_signal_at: iso(lastSignal),
      days_since_signal: daysSince,
      needs_rain: daysSince > 7,
    };
  });
  const weather = forestWeather(trees);
  return {
    school_id: schoolId,
    trees,
    forest_weather: weather,
    forest_narrative_en: forestNarrative(weather, trees),
    computed_at: now.toISOString(),
  };
}

const schoolForestOverview = async (schoolId: string): Promise<SchoolForestState> => {
  const rows = await queryDatabaseRows<any>(
    'select teacher_user_id, tree_health, has_thuthimal, last_signal_at from public.school_forest_state where school_id = $1::uuid',
    [schoolId],
  );
  if (rows.length === 0) return computeForestState(schoolId);
  const now = new Date();
  const trees = rows.map((row) => {
    const lastSignal = iso(row.last_signal_at);
    const daysSince = lastSignal
      ? Math.floor((now.getTime() - new Date(lastSignal).getTime()) / 86400000)
      : 999;
    return {
      user_id: String(row.teacher_user_id),
      tree_health: row.tree_health,
      has_thuthimal: Boolean(row.has_thuthimal),
      last_signal_at: lastSignal,
      days_since_signal: daysSince,
      needs_rain: daysSince > 7,
    };
  });
  const weather = forestWeather(trees);
  return {
    school_id: schoolId,
    trees,
    forest_weather: weather,
    forest_narrative_en: forestNarrative(weather, trees),
    computed_at: now.toISOString(),
  };
};

const schoolPulse = async (schoolId: string): Promise<SchoolPulse> => {
  const periodStart = new Date(Date.now() - 7 * 86400000).toISOString();
  const [teachers, signals] = await Promise.all([
    queryDatabaseRows<{ id: string }>(
      "select id from public.users where school_id = $1::uuid and capacity = 'teacher'",
      [schoolId],
    ),
    queryDatabaseRows<{ user_id: string; dimension: string }>(
      'select user_id, dimension from public.growth_events where school_id = $1::uuid and created_at >= $2::timestamptz',
      [schoolId, periodStart],
    ),
  ]);
  const fraction =
    teachers.length === 0
      ? 0
      : Math.round(
          (new Set(signals.map((signal) => signal.user_id)).size / teachers.length) * 100,
        ) / 100;
  const counts = new Map<string, number>();
  for (const signal of signals)
    counts.set(signal.dimension, (counts.get(signal.dimension) ?? 0) + 1);
  const leading = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'presence';
  const narrative =
    fraction > 0.7
      ? "Most of your school's teachers have been active this week. The forest is alive."
      : fraction > 0.4
        ? 'About half the school has been engaged this week — steady and growing.'
        : fraction > 0.2
          ? 'A quieter week for many. Some trees may be resting; some may need rain.'
          : 'This has been a very quiet week across the school. A compassionate check-in with your team may be timely.';
  return {
    school_id: schoolId,
    presence_fraction: fraction,
    leading_dimension: leading,
    pulse_narrative_en: narrative,
    period_start: periodStart,
    computed_at: new Date().toISOString(),
  };
};

export const schoolForestRouter = impl.router({
  getForestOverview: impl.getForestOverview
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await requireSchoolReadScope(context, input.params.schoolId);
      return schoolForestOverview(input.params.schoolId);
    }),
  getSchoolPulse: impl.getSchoolPulse
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      await requireSchoolReadScope(context, input.params.schoolId);
      return schoolPulse(input.params.schoolId);
    }),
  sendGratitudeGift: impl.sendGratitudeGift
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const schoolId = await requirePrincipalScope(
        context,
        input.body.recipientUserId,
        input.body.schoolId,
      );
      const messages = giftMessages[input.body.giftType];
      const gift = await context.db.gratitudeGift.create({
        data: {
          sender_user_id: context.user.id,
          recipient_user_id: input.body.recipientUserId,
          school_id: schoolId,
          message: input.body.message ?? null,
          gift_type: input.body.giftType,
          warm_message_en: messages[0],
          warm_message_si: messages[1],
          warm_message_ta: messages[2],
          delivered: false,
        },
      });
      await context.db.impactRipple.create({
        data: {
          recipient_user_id: input.body.recipientUserId,
          actor_user_id: context.user.id,
          ripple_type: 'principal_recognition',
          warm_message_en: messages[0],
          delivered: false,
        },
      });
      return mapGift(gift);
    }),

  getPendingGifts: impl.getPendingGifts
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      if (context.user.id !== input.params.recipientUserId) {
        throw SovereignError.unauthorized('read', 'gratitude gifts');
      }
      const gifts = await context.db.gratitudeGift.findMany({
        where: { recipient_user_id: context.user.id, delivered: false },
        orderBy: { created_at: 'desc' },
      });
      return gifts.map(mapGift);
    }),

  markGiftDelivered: impl.markGiftDelivered
    .use(doubleGateMiddleware)
    .handler(async ({ input, context }) => {
      requireUser(context);
      const gift = await context.db.gratitudeGift.findUnique({
        where: { id: input.params.giftId },
      });
      if (!gift || gift.recipient_user_id !== context.user.id) {
        throw SovereignError.notFound('Gratitude gift');
      }
      return mapGift(
        await context.db.gratitudeGift.update({
          where: { id: input.params.giftId },
          data: { delivered: true, delivered_at: new Date() },
        }),
      );
    }),
});
