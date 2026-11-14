import { View, Text, Pressable } from 'react-native';
import { GraduationCap, Plus, School, X } from '@repo/ui/icons';

interface StepHierarchyProps {
  data: {
    levels: string[];
    gradeRange: { start: number; end: number };
    sections: { name: string; headName?: string }[];
  };
  onUpdate: (data: Partial<StepHierarchyProps['data']>) => void;
}

const AVAILABLE_LEVELS = [
  { id: 'Primary', label: 'Primary (Grade 1-5)' },
  { id: 'Junior Secondary', label: 'Junior Secondary (Grade 6-9)' },
  { id: 'Senior Secondary', label: 'Senior Secondary (Grade 10-11)' },
  { id: 'Advanced Level', label: 'Advanced Level (Grade 12-13)' },
];

export default function StepHierarchy({ data, onUpdate }: StepHierarchyProps) {
  const toggleLevel = (levelId: string) => {
    const currentLevels = data.levels || [];
    if (currentLevels.includes(levelId)) {
      onUpdate({ levels: currentLevels.filter((l) => l !== levelId) });
    } else {
      onUpdate({ levels: [...currentLevels, levelId] });
    }
  };

  const addSection = () => {
    const currentSections = data.sections || [];
    onUpdate({
      sections: [...currentSections, { name: '' }],
    });
  };

  const removeSection = (index: number) => {
    const currentSections = data.sections || [];
    onUpdate({
      sections: currentSections.filter((_, i) => i !== index),
    });
  };

  return (
    <View className="gap-8">
      <View className="gap-4">
        <View className="gap-1">
          <Text className="text-lg font-black text-phaseText-primary uppercase tracking-wider">
            Academic Levels
          </Text>
          <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest">
            Define school educational tiers
          </Text>
        </View>
        <View className="gap-2">
          {AVAILABLE_LEVELS.map((level) => {
            const isActive = data.levels.includes(level.id);
            return (
              <Pressable key={level.id} onPress={() => toggleLevel(level.id)}>
                <View
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? 'bg-phase-interactive/5 border-phase-interactive/20'
                      : 'bg-phase-canvas border-phase-border'
                  }`}
                >
                  <View className="flex-row items-center gap-4 items-center">
                    <View
                      className={`p-2 rounded-xl border border-phase-border ${isActive ? 'bg-phase-interactive/10' : 'bg-phase-surface'}`}
                    >
                      <GraduationCap size={18} className={isActive ? 'text-phase-interactive' : 'text-phaseText-muted'} />
                    </View>
                    <Text
                      className={`text-sm tracking-tight ${isActive ? 'font-black text-phaseText-primary' : 'font-bold text-phaseText-secondary'}`}
                    >
                      {level.label}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-4">
        <View className="flex-row items-center justify-between items-center">
          <View className="gap-1">
            <Text className="text-lg font-black text-phaseText-primary uppercase tracking-wider">
              Administrative Sections
            </Text>
            <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest">
              Societies, Prefects, Council
            </Text>
          </View>
          <Pressable
            onPress={addSection}
            className="bg-phaseText-primary px-4 py-2 rounded-xl active:opacity-80"
          >
            <View className="flex-row items-center items-center gap-2">
              <Plus size={12} className="text-white" />
              <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                ADD
              </Text>
            </View>
          </Pressable>
        </View>

        {data.sections.length === 0 ? (
          <View className="p-8 items-center justify-center bg-phase-canvas rounded-[32px] border-2 border-dashed border-phase-border">
            <Text className="text-xs font-bold text-phaseText-muted uppercase tracking-widest">
              No divisions established
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {data.sections.map((section, idx) => (
              <View
                key={idx}
                className="p-4 rounded-2xl bg-phase-surface border border-phase-border"
              >
                <View className="flex-row items-center gap-4 items-center">
                  <View className="p-2 bg-phase-canvas rounded-xl border border-phase-border">
                    <School size={16} className="text-phaseText-muted" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-phaseText-primary">
                      {section.name || 'Unnamed Division'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => removeSection(idx)}
                    className="p-2 active:bg-phase-danger/10 rounded-lg"
                  >
                    <X size={16} className="text-phase-danger" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
