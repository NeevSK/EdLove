/**
 * sections.tsx
 * modular dashboard sections for the Self package.
 * Refactored to Zero-Legacy: purged corrupted StyleSheets and migrated to @repo/ui primitives.
 */

import { View, Text } from 'react-native';
import { usePermissions } from '@repo/core/logic';
import { WaitingSign } from '@repo/ui/components/native';
import {
  BookOpen,
  Brain,
  Leaf,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Target,
  User,
  Zap,
} from '@repo/ui/icons';
import type React from 'react';

type JournalEntry = {
  id: string;
  content?: string | null;
  title?: string | null;
};

type MoodLog = {
  id: string;
  mood_type?: string | null;
  mood?: string | null;
};

type BanyanSummary = {
  banyan_stage?: string | null;
  peer_mentored_count?: number | null;
};

type DecisionItem = {
  id: string;
  decision_text: string;
};

type WisdomItem = {
  id: string;
  insight: string;
};

type GoalItem = {
  id: string;
  title: string;
};

type NaturePath = {
  [key: string]: unknown;
  banyan_stage?: string | null;
  peer_mentored_count?: number | null;
  river_stage?: string | null;
  crystal_tier?: string | null;
  crystals_found_count?: number | null;
  fractal_moments_count?: number | null;
};

type EnergySummary = {
  energy_level?: string | number | null;
};

export const JournalSection: React.FC<{
  entries: JournalEntry[];
  loading?: boolean;
}> = ({ entries, loading }) => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-4 gap-2">
      <BookOpen size={18} className="text-violet-400" />
      <Text className="text-sm font-black uppercase tracking-widest text-violet-400">
        Inner Resonance
      </Text>
    </View>

    {loading ? (
      <View className="py-5 items-center justify-center">
        <WaitingSign size={32} />
      </View>
    ) : entries.length > 0 ? (
      <View className="gap-3">
        {entries.slice(0, 2).map((entry) => (
          <View
            key={entry.id}
            className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-l-violet-400 border-white/5 shadow-sm"
          >
            <Text className="text-sacredWhite/80 text-sm leading-relaxed" numberOfLines={2}>
              {entry.content || entry.title}
            </Text>
          </View>
        ))}
      </View>
    ) : (
      <Text className="text-mistGray text-xs italic text-center py-2">
        No recent reflections captured.
      </Text>
    )}
  </View>
);

export const MoodSection: React.FC<{ logs: MoodLog[]; loading?: boolean }> = ({
  logs,
  loading,
}) => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-4 gap-2">
      <Sparkles size={18} className="text-pink-400" />
      <Text className="text-sm font-black uppercase tracking-widest text-pink-400">
        Emotional Flow
      </Text>
    </View>

    {loading ? (
      <View className="py-5 items-center justify-center">
        <WaitingSign size={32} />
      </View>
    ) : (
      <Text className="text-sacredWhite/70 text-sm leading-relaxed italic">
        {logs.length > 0
          ? `Currently resonant with ${logs[0]?.mood_type || logs[0]?.mood}.`
          : 'The emotional waters are still.'}
      </Text>
    )}
  </View>
);

export const TeacherPulse: React.FC<{
  banyan?: BanyanSummary | null;
  loading?: boolean;
}> = ({ banyan, loading }) => {
  const { can } = usePermissions();
  if (!can('manage', 'TeacherDashboard')) return null;

  return (
    <View className="p-6 bg-emeraldGreen/5 rounded-2xl border border-emeraldGreen/10 mb-4">
      <View className="flex-row items-center items-center mb-4 gap-2">
        <Zap size={18} className="text-emeraldGreen" />
        <Text className="text-sm font-black uppercase tracking-widest text-emeraldGreen">
          Instructional Energy
        </Text>
      </View>

      {loading ? (
        <View className="py-5 items-center justify-center">
          <WaitingSign size={32} />
        </View>
      ) : (
        <View className="gap-2">
          <View className="flex-row items-center justify-between items-center">
            <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">
              Banyan Stage
            </Text>
            <View className="bg-emeraldGreen/10 px-3 py-1 rounded-full border border-emeraldGreen/20">
              <Text className="text-emeraldGreen text-[10px] font-black uppercase">
                {banyan?.banyan_stage?.replace(/_/g, ' ') || 'Seedling'}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between items-center">
            <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">
              Ecosystem Ripple
            </Text>
            <Text className="text-sacredWhite font-bold">
              {banyan?.peer_mentored_count || 0} pts
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export const BanyanSection: React.FC = () => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-3 gap-2">
      <Leaf size={18} className="text-emeraldGreen" />
      <Text className="text-sm font-black uppercase tracking-widest text-emeraldGreen">
        The Banyan Tree
      </Text>
    </View>
    <Text className="text-mistGray text-xs leading-relaxed italic">
      Visualizing your classroom&apos;s collective growth roots.
    </Text>
  </View>
);

export const PrincipalPulse: React.FC<{
  energy?: EnergySummary | null;
  decisions?: DecisionItem[];
  loading?: boolean;
}> = ({ energy, decisions, loading }) => {
  const { can } = usePermissions();
  if (!can('manage', 'PrincipalDashboard')) return null;

  return (
    <View className="p-6 bg-amber-400/5 rounded-2xl border border-amber-400/20 mb-4">
      <View className="flex-row items-center items-center mb-4 gap-2">
        <Brain size={18} className="text-amber-400" />
        <Text className="text-sm font-black uppercase tracking-widest text-amber-400">
          Systemic Pulse
        </Text>
      </View>
      {loading ? (
        <View className="py-5 items-center justify-center">
          <WaitingSign size={32} />
        </View>
      ) : (
        <View className="gap-2">
          <Text className="text-sacredWhite/80 text-sm">
            Energy Equilibrium:{' '}
            <Text className="font-bold text-amber-400">{energy?.energy_level || 'Balanced'}/5</Text>
          </Text>
          <Text className="text-sacredWhite/80 text-sm">
            Strategic Acts:{' '}
            <Text className="font-bold text-amber-400">{decisions?.length || 0} active loops</Text>
          </Text>
        </View>
      )}
    </View>
  );
};

export const DecisionSection: React.FC<{
  decisions: DecisionItem[];
  loading?: boolean;
}> = ({ decisions, loading }) => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-4 gap-2">
      <Zap size={18} className="text-amber-400" />
      <Text className="text-sm font-black uppercase tracking-widest text-amber-400">
        Governance Mirror
      </Text>
    </View>
    {loading ? (
      <View className="py-5 items-center justify-center">
        <WaitingSign size={32} />
      </View>
    ) : decisions.length > 0 ? (
      <View className="gap-3">
        {decisions.slice(0, 2).map((d) => (
          <View
            key={d.id}
            className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-l-amber-400 border-white/5 shadow-sm"
          >
            <Text className="text-sacredWhite/80 text-sm leading-relaxed" numberOfLines={2}>
              {d.decision_text}
            </Text>
          </View>
        ))}
      </View>
    ) : (
      <Text className="text-mistGray text-xs italic text-center py-2">
        No major steering decisions recorded.
      </Text>
    )}
  </View>
);

export const VisionSection: React.FC = () => {
  const { can } = usePermissions();
  if (!can('manage', 'FounderDashboard')) return null;

  return (
    <View className="p-6 bg-sanctuarySaffron/5 rounded-2xl border border-sanctuarySaffron/20 mb-4">
      <View className="flex-row items-center items-center mb-4 gap-2">
        <Sparkles size={18} className="text-sanctuarySaffron" />
        <Text className="text-sm font-black uppercase tracking-widest text-sanctuarySaffron">
          Ecosystem Vision
        </Text>
      </View>
      <Text className="text-sanctuarySaffron italic text-sm leading-relaxed font-medium">
        &ldquo;The architecture of education is the architecture of human potential.&rdquo;
      </Text>
    </View>
  );
};

export const PhilosophySection: React.FC<{
  wisdom: WisdomItem[];
  loading?: boolean;
}> = ({ wisdom, loading }) => {
  const { can } = usePermissions();
  if (!can('manage', 'FounderDashboard')) return null;

  return (
    <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
      <View className="flex-row items-center items-center mb-4 gap-2">
        <Lightbulb size={18} className="text-sanctuarySaffron" />
        <Text className="text-sm font-black uppercase tracking-widest text-sanctuarySaffron">
          Philosophical Anchors
        </Text>
      </View>
      {loading ? (
        <View className="py-5 items-center justify-center">
          <WaitingSign size={32} />
        </View>
      ) : wisdom.length > 0 ? (
        <View className="gap-3">
          {wisdom.slice(0, 2).map((w) => (
            <View
              key={w.id}
              className="p-4 bg-white/[0.02] rounded-xl border-l-4 border-l-sanctuarySaffron border-white/5 shadow-sm"
            >
              <Text className="text-sacredWhite/80 text-sm leading-relaxed">{w.insight}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-mistGray text-xs italic text-center py-2">
          No wisdom seeds planted yet.
        </Text>
      )}
    </View>
  );
};

export const GoalSection: React.FC<{ goals: GoalItem[]; loading?: boolean }> = ({
  goals,
  loading,
}) => {
  const { can } = usePermissions();
  if (!can('manage', 'StudentDashboard')) return null;

  return (
    <View className="p-6 bg-indigo-400/5 rounded-2xl border border-indigo-400/10 mb-4">
      <View className="flex-row items-center items-center mb-4 gap-2">
        <Target size={18} className="text-indigo-400" />
        <Text className="text-sm font-black uppercase tracking-widest text-indigo-400">
          Active Intentions
        </Text>
      </View>
      {loading ? (
        <View className="py-5 items-center justify-center">
          <WaitingSign size={32} />
        </View>
      ) : goals.length > 0 ? (
        <View className="gap-2">
          {goals.map((g) => (
            <View className="flex-row items-center gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/5"
              key={g.id}
            >
              <Target size={18} className="text-indigo-300" />
              <Text className="text-sacredWhite/80 font-bold text-sm flex-1">{g.title}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="text-mistGray text-xs italic text-center py-2">
          No active goals found.
        </Text>
      )}
    </View>
  );
};

export const StudentPulse: React.FC<{
  banyan?: BanyanSummary | null;
  loading?: boolean;
}> = ({ banyan, loading }) => {
  const { can } = usePermissions();
  if (!can('manage', 'StudentDashboard')) return null;

  return (
    <View className="p-6 bg-indigo-400/5 rounded-2xl border border-indigo-400/10 mb-4">
      <View className="flex-row items-center items-center mb-4 gap-2">
        <Zap size={18} className="text-indigo-400" />
        <Text className="text-sm font-black uppercase tracking-widest text-indigo-400">
          Learning Pulse
        </Text>
      </View>
      {loading ? (
        <View className="py-5 items-center justify-center">
          <WaitingSign size={32} />
        </View>
      ) : (
        <View className="gap-2">
          <View className="flex-row items-center justify-between items-center">
            <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">
              Banyan Stage
            </Text>
            <Text className="text-indigo-400 font-black text-xs uppercase">
              {banyan?.banyan_stage?.replace(/_/g, ' ') || 'Seedling'}
            </Text>
          </View>
          <View className="flex-row items-center justify-between items-center">
            <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">
              Peer Ripples
            </Text>
            <Text className="text-sacredWhite font-bold text-xs">
              {banyan?.peer_mentored_count || 0} active
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export const NatureSection: React.FC<{ paths: NaturePath | null; loading?: boolean }> = ({
  paths,
  loading,
}) => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-4 gap-2">
      <Leaf size={18} className="text-emeraldGreen" />
      <Text className="text-sm font-black uppercase tracking-widest text-emeraldGreen">
        Residual Resonance
      </Text>
    </View>
    {loading ? (
      <View className="py-5 items-center justify-center">
        <WaitingSign size={32} />
      </View>
    ) : (
      <View className="gap-3">
        <View className="flex-row items-center justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
          <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">Stage</Text>
          <Text className="text-emeraldGreen font-black text-xs uppercase">
            {paths?.banyan_stage?.replace(/_/g, ' ') || 'Growing'}
          </Text>
        </View>
        <View className="flex-row items-center justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
          <Text className="text-mistGray text-xs uppercase tracking-wider font-bold">
            Mentorship Hub
          </Text>
          <Text className="text-sacredWhite font-bold text-xs">
            {paths?.peer_mentored_count || 0} active ripples
          </Text>
        </View>
      </View>
    )}
  </View>
);

export const IdentitySection: React.FC = () => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-4 gap-2">
      <User size={18} className="text-violet-300" />
      <Text className="text-sm font-black uppercase tracking-widest text-violet-300">
        Who Am I Becoming?
      </Text>
    </View>
    <Text className="text-mistGray text-xs italic text-center py-4">
      Reflecting your inner qualities...
    </Text>
  </View>
);

export const TeacherFeedbackSection: React.FC = () => (
  <View className="p-6 bg-white/5 rounded-2xl border border-white/10 mb-4">
    <View className="flex-row items-center items-center mb-4 gap-2">
      <MessageCircle size={18} className="text-sky-300" />
      <Text className="text-sm font-black uppercase tracking-widest text-sky-300">
        Teacher Echoes
      </Text>
    </View>
    <Text className="text-mistGray text-xs italic text-center py-4">
      Guidance from your mentors.
    </Text>
  </View>
);
