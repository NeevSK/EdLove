import { Platform } from 'react-native';
import { BarChart3, Clock, Image as ImageIcon, Lock, Mic, Plus, Trash2, Users, X } from '../icons';
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Icon,
  Image,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Spinner,
  Switch,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from '../primitives';
import SanctuaryModal from './SanctuaryModal';

export interface Tag {
  id: string;
  label: string;
}

export interface ComposerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  submitLabel?: string;
  placeholder?: string;

  // State
  content: string;
  isSubmitting: boolean;
  isUploading?: boolean;
  selectedImage: string | null;
  selectedTags: string[];
  tags?: Tag[];

  // Poll State (Optional)
  isPollMode: boolean;
  pollOptions: string[];
  pollIsAnonymous: boolean;
  pollAllowMultiple: boolean;
  pollDurationHours: number | null;
  pollCustomEndsAt: string;
  showCustomDate: boolean;
  durationPresets?: { label: string; hours: number | null }[];

  // Features
  allowPolls?: boolean;
  allowMedia?: boolean;
  allowTags?: boolean;

  // Handlers
  onContentChange: (val: string) => void;
  onToggleTag: (id: string) => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
  onTogglePollMode: () => void;
  onAddPollOption: () => void;
  onUpdatePollOption: (idx: number, val: string) => void;
  onRemovePollOption: (idx: number) => void;
  onSetPollDuration: (hours: number | null) => void;
  onSetShowCustomDate: (show: boolean) => void;
  onSetCustomDate: (val: string) => void;
  onSetPollAnonymous: (val: boolean) => void;
  onSetPollMultiple: (val: boolean) => void;
  onSubmit: () => void;
}

const DEFAULT_PRESETS = [
  { label: 'No end', hours: null },
  { label: '1 h', hours: 1 },
  { label: '24 h', hours: 24 },
  { label: '3 d', hours: 72 },
  { label: '7 d', hours: 168 },
];

export function ContentComposer(props: ComposerProps) {
  const {
    isOpen,
    onClose,
    title = 'Create Content',
    submitLabel = 'Post',
    placeholder = "What's on your mind?",
    content,
    isSubmitting,
    isUploading,
    selectedImage,
    selectedTags,
    tags = [],
    isPollMode,
    pollOptions,
    pollIsAnonymous,
    pollAllowMultiple,
    pollDurationHours,
    pollCustomEndsAt,
    showCustomDate,
    durationPresets = DEFAULT_PRESETS,
    allowPolls = true,
    allowMedia = true,
    allowTags = true,
    onContentChange,
    onToggleTag,
    onPickImage,
    onRemoveImage,
    onTogglePollMode,
    onAddPollOption,
    onUpdatePollOption,
    onRemovePollOption,
    onSetPollDuration,
    onSetShowCustomDate,
    onSetCustomDate,
    onSetPollAnonymous,
    onSetPollMultiple,
    onSubmit,
  } = props;

  const footer = (
    <Button
      onPress={onSubmit}
      isDisabled={(!content.trim() && !selectedImage) || isSubmitting || isUploading}
      className="w-full bg-phase-interactive h-12 rounded-2xl active:opacity-90"
    >
      <ButtonText className="text-inverted font-bold">
        {isSubmitting ? 'Posting...' : submitLabel}
      </ButtonText>
    </Button>
  );

  return (
    <SanctuaryModal isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <VStack className="gap-4">
        <Textarea className="bg-phase-surface border-border min-h-[160px] rounded-2xl">
          <TextareaInput
            placeholder={isPollMode ? 'Ask your question...' : placeholder}
            className="text-ink text-base"
            value={content}
            onChangeText={onContentChange}
          />
        </Textarea>

        {isPollMode && (
          <VStack className="gap-4">
            <VStack className="gap-2">
              {pollOptions.map((opt, idx) => {
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: indices are stable for poll options within this composer session
                  <HStack key={`poll-option-${idx}`} className="items-center gap-2">
                    <Input className="flex-1 bg-phase-surface border-border h-12 rounded-xl">
                      <InputField
                        placeholder={`Option ${idx + 1}`}
                        value={opt}
                        onChangeText={(val: string) => onUpdatePollOption(idx, val)}
                        className="text-ink text-sm"
                      />
                    </Input>
                    {pollOptions.length > 2 && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => onRemovePollOption(idx)}
                        className="p-2"
                      >
                        <Icon as={X} size="sm" className="text-ink/40" />
                      </Pressable>
                    )}
                  </HStack>
                );
              })}
              {pollOptions.length < 5 && (
                <Pressable
                  accessibilityRole="button"
                  onPress={onAddPollOption}
                  className="flex-row items-center py-2 gap-2"
                >
                  <Icon as={Plus} size="xs" className="text-phase-interactive" />
                  <Text className="text-phase-interactive text-sm font-semibold">Add option</Text>
                </Pressable>
              )}
            </VStack>

            <VStack className="gap-3 bg-phase-surface/50 p-4 border border-border rounded-2xl">
              <HStack className="justify-between items-center">
                <HStack className="items-center gap-2">
                  <Icon as={Lock} size="xs" className="text-ink/60" />
                  <Text className="text-ink text-sm">Anonymous votes</Text>
                </HStack>
                <Switch value={pollIsAnonymous} onValueChange={onSetPollAnonymous} />
              </HStack>

              <HStack className="justify-between items-center">
                <HStack className="items-center gap-2">
                  <Icon as={Users} size="xs" className="text-ink/60" />
                  <Text className="text-ink text-sm">Allow multiple choices</Text>
                </HStack>
                <Switch value={pollAllowMultiple} onValueChange={onSetPollMultiple} />
              </HStack>

              <VStack className="gap-2">
                <HStack className="items-center gap-2">
                  <Icon as={Clock} size="xs" className="text-ink/60" />
                  <Text className="text-ink/60 text-xs font-semibold">Poll closes</Text>
                </HStack>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <HStack className="gap-2">
                    {durationPresets.map((p) => {
                      const isActive = !showCustomDate && pollDurationHours === p.hours;
                      return (
                        <Pressable
                          accessibilityRole="button"
                          key={p.label || 'none'}
                          onPress={() => {
                            onSetShowCustomDate(false);
                            onSetPollDuration(p.hours);
                          }}
                          className={`px-3 py-1.5 rounded-full border ${isActive ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                        >
                          <Text
                            className={`text-xs ${isActive ? 'text-inverted font-semibold' : 'text-ink/60'}`}
                          >
                            {p.label}
                          </Text>
                        </Pressable>
                      );
                    })}

                    {Platform.OS === 'web' && (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          onSetShowCustomDate(true);
                          onSetPollDuration(null);
                        }}
                        className={`px-3 py-1.5 rounded-full border ${showCustomDate ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                      >
                        <Text
                          className={`text-xs ${showCustomDate ? 'text-inverted font-semibold' : 'text-ink/60'}`}
                        >
                          Custom
                        </Text>
                      </Pressable>
                    )}
                  </HStack>
                </ScrollView>

                {Platform.OS === 'web' && showCustomDate && (
                  <input
                    type="datetime-local"
                    value={pollCustomEndsAt}
                    onChange={(e) => onSetCustomDate(e.target.value)}
                    style={{
                      marginTop: 6,
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#0f172a',
                      fontSize: 14,
                      width: '100%',
                      outline: 'none',
                    }}
                  />
                )}
              </VStack>
            </VStack>
          </VStack>
        )}

        {allowTags && tags.length > 0 && (
          <VStack className="gap-2">
            <Text className="text-ink/60 text-xs font-semibold">Tag this post (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack className="gap-2">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={tag.id}
                      onPress={() => onToggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full border ${active ? 'bg-phase-interactive border-phase-interactive' : 'bg-phase-surface border-border'}`}
                    >
                      <Text
                        className={`text-xs ${active ? 'text-inverted font-semibold' : 'text-ink/60'}`}
                      >
                        {tag.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
          </VStack>
        )}

        {selectedImage && (
          <Box className="relative rounded-2xl overflow-hidden h-[200px]">
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full rounded-2xl"
              alt="Selected image"
            />
            <Pressable
              accessibilityRole="button"
              onPress={onRemoveImage}
              className="absolute top-2 right-2 bg-black/40 p-2 rounded-full"
            >
              <Icon as={Trash2} size="sm" className="text-inverted" />
            </Pressable>
            {isUploading && (
              <Box className="absolute inset-0 bg-black/20 justify-center items-center">
                <Spinner />
              </Box>
            )}
          </Box>
        )}

        {/* Toolbar */}
        <HStack className="gap-4">
          {allowMedia && (
            <Pressable
              accessibilityRole="button"
              onPress={onPickImage}
              className={`p-3 rounded-xl ${selectedImage ? 'bg-phase-interactive/10' : 'bg-phase-surface'}`}
            >
              <Icon
                as={ImageIcon}
                size="md"
                className={selectedImage ? 'text-phase-interactive' : 'text-ink/40'}
              />
            </Pressable>
          )}
          <Pressable accessibilityRole="button" className="p-3 bg-phase-surface rounded-xl">
            <Icon as={Mic} size="md" className="text-ink/40" />
          </Pressable>
          {allowPolls && (
            <Pressable
              accessibilityRole="button"
              onPress={onTogglePollMode}
              className={`p-3 rounded-xl ${isPollMode ? 'bg-phase-interactive' : 'bg-phase-surface'}`}
            >
              <Icon
                as={BarChart3}
                size="md"
                className={isPollMode ? 'text-inverted' : 'text-ink/40'}
              />
            </Pressable>
          )}
        </HStack>
      </VStack>
    </SanctuaryModal>
  );
}
