import { usePermissions } from '@repo/core/logic';
import { ContentComposer } from '@repo/ui/components/ContentComposer';
import { useComposerLogic } from '../hooks/useComposerLogic';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  onSuccess?: () => void;
}

const EDUCATION_TAGS = [
  { id: 'lesson', label: '\uD83D\uDCDA Lesson' },
  { id: 'assignment', label: '\uD83D\uDCDD Assignment' },
  { id: 'tip', label: '\uD83D\uDCA1 Tip' },
  { id: 'resource', label: '\uD83D\uDD17 Resource' },
  { id: 'celebration', label: '\uD83C\uDF89 Celebration' },
  { id: 'question', label: '\u2753 Question' },
  { id: 'announcement', label: '\uD83D\uDCE2 Announcement' },
  { id: 'wellbeing', label: '\uD83C\uDF31 Wellbeing' },
];

export default function CreatePostModal({
  isOpen,
  onClose,
  groupId = 'general',
  onSuccess,
}: CreatePostModalProps) {
  const { flags } = usePermissions();
  const { state, actions } = useComposerLogic(groupId, onClose);

  return (
    <ContentComposer
      isOpen={isOpen}
      onClose={onClose}
      title="Share with the Circle"
      submitLabel="Post Resonance"
      placeholder="What's on your mind?"
      // State
      content={state.content}
      isSubmitting={state.isSubmitting}
      isUploading={state.isUploading}
      selectedImage={state.selectedImage}
      selectedTags={state.selectedTags}
      tags={EDUCATION_TAGS}
      // Poll State
      isPollMode={state.isPollMode}
      pollOptions={state.pollOptions}
      pollIsAnonymous={state.pollIsAnonymous}
      pollAllowMultiple={state.pollAllowMultiple}
      pollDurationHours={state.pollDurationHours}
      pollCustomEndsAt={state.pollCustomEndsAt}
      showCustomDate={state.showCustomDate}
      // Features
      allowPolls={flags.isCommunityEnabled}
      allowMedia={true}
      allowTags={true}
      // Handlers
      onContentChange={actions.setContent}
      onToggleTag={actions.toggleTag}
      onPickImage={actions.pickImage}
      onRemoveImage={() => actions.setSelectedImage(null)}
      onTogglePollMode={() => actions.setIsPollMode(!state.isPollMode)}
      onAddPollOption={actions.addPollOption}
      onUpdatePollOption={actions.updatePollOption}
      onRemovePollOption={actions.removePollOption}
      onSetPollDuration={actions.setPollDurationHours}
      onSetShowCustomDate={actions.setShowCustomDate}
      onSetCustomDate={actions.setPollCustomEndsAt}
      onSetPollAnonymous={actions.setPollIsAnonymous}
      onSetPollMultiple={actions.setPollAllowMultiple}
      onSubmit={async () => {
        await actions.handleSubmit();
        onSuccess?.();
      }}
    />
  );
}
