import type { FlowDefinition } from './types.js';

export const chatMessagingFlow: FlowDefinition = {
  metadata: {
    id: 'journey:chat.send_message',
    version: '2.1.0',
    domain: 'sanctuary.chat',
    riskTier: 'critical',
    targetEngines: {
      expo: '>=58.0.0',
      react: '>=19.0.0',
    },
    author: 'Naveen & Antigravity',
    lastUpdated: '2026-11-11',
    schemaHash: 'sha256-4c8f9b2d81a0e1b6f0e4c3a2',
  },

  personas: [
    {
      role: 'Student',
      device: 'Budget Android (2GB RAM, 60Hz)',
      network: 'Rural 2G/Edge (High packet loss)',
      description: 'Learner in Sri Lankan rural school sending questions to the community sanctuary thread.',
    },
    {
      role: 'Teacher',
      device: 'Classroom Tablet (iPad / Samsung Galaxy Tab)',
      network: 'School Wi-Fi (Bandwidth throttled)',
      description: 'Educator reviewing questions and replying with guidance and study attachments.',
    },
  ],

  acceptanceCriteria: [
    {
      id: 'AC-1',
      title: 'Zero Message Loss on Offline Drop',
      rule: 'If connection drops during transmission, message remains safely persisted in SQLite WAL outbox with queued badge.',
      verifiedByScenario: 'offline_recovery',
    },
    {
      id: 'AC-2',
      title: 'Sub-16ms Optimistic UI Echo',
      rule: 'Tapping send immediately renders bubble with clock icon and fires light haptic before server response.',
      verifiedByScenario: 'happy_path',
    },
    {
      id: 'AC-3',
      title: 'Deterministic Idempotency Key',
      rule: 'All outgoing messages include client_message_id = UUIDv8 to prevent duplicate database rows on network replay.',
      verifiedByScenario: 'happy_path',
    },
    {
      id: 'AC-4',
      title: 'Graceful Error Recovery Without Draft Loss',
      rule: 'On server 500 or timeout, red retry badge appears and tap-to-retry re-attempts send without clearing text.',
      verifiedByScenario: 'server_error_retry',
    },
    {
      id: 'AC-5',
      title: 'Tenant-Isolated Row Level Security',
      rule: 'Messages can only be read or created by users belonging to the same school tenant and participating thread.',
      verifiedByScenario: 'happy_path',
    },
  ],

  ingress: {
    supportedVectors: [
      { type: 'cold_boot' },
      { type: 'deep_link', deepLinkPattern: 'sanctuary://chat/:threadId' },
      { type: 'in_app', sourceScreen: 'DrawerNavigation' },
    ],
    guards: [
      {
        name: 'isAuthenticated',
        predicate: 'session.isValid === true',
        onFailureBounceRoute: 'AuthSheetModal',
      },
      {
        name: 'isThreadParticipant',
        predicate: 'thread.participants.includes(currentUser.id)',
        onFailureBounceRoute: 'AccessDeniedFloor',
      },
    ],
  },

  states: {
    empty_thread: {
      screen: 'ChatRoomFloor',
      component: '@repo/community/screens/ChatEmptyState',
      keyboardAvoidance: 'none',
      userContextDescription: 'Thread has zero messages. Shows welcoming illustration and prompt starter chips.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        elements: [
          { id: 'illustration', type: 'avatar', label: 'Sanctuary Icon' },
          { id: 'welcome_text', type: 'text', label: 'Ask a question about photosynthesis or homework!' },
          { id: 'prompt_chip_1', type: 'button', label: 'Explain Calvin cycle in simple terms', state: 'enabled' },
          { id: 'composer_input', type: 'input', label: 'Message...', state: 'enabled' },
        ],
      },
      onEvents: {
        TAP_PROMPT: {
          targetState: 'composer_typing',
          motion: { type: 'SPRING', damping: 20, stiffness: 220, haptic: 'selection' },
        },
        FOCUS_INPUT: {
          targetState: 'composer_typing',
        },
        HISTORY_LOADED: {
          targetState: 'composer_idle',
        },
      },
    },

    loading_history: {
      screen: 'ChatRoomFloor',
      component: '@repo/ui/components/native/WaitingSign',
      keyboardAvoidance: 'none',
      userContextDescription: 'Fetching recent message batch from local SQLite WAL cache and remote stream.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        elements: [
          { id: 'skeleton_1', type: 'skeleton', label: 'Loading message shimmer...' },
          { id: 'skeleton_2', type: 'skeleton', label: 'Loading message shimmer...' },
        ],
      },
      onEvents: {
        CACHE_READY: {
          targetState: 'composer_idle',
        },
      },
    },

    composer_idle: {
      screen: 'ChatRoomFloor',
      component: '@repo/ui/components/native/Composer',
      keyboardAvoidance: 'adjustResize',
      userContextDescription: 'Thread loaded, messages visible, composer idle with empty text.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        elements: [
          { id: 'message_list', type: 'list', label: '14 existing messages' },
          { id: 'composer_input', type: 'input', label: 'Type your message...', state: 'enabled' },
          { id: 'send_button', type: 'button', label: 'Send', state: 'disabled' },
        ],
      },
      onEvents: {
        TYPE_TEXT: {
          guard: 'text.length > 0',
          targetState: 'composer_typing',
        },
        TAP_SEND: {
          guard: 'input.trim().length > 0',
          targetState: 'optimistic_outbox',
          motion: {
            type: 'SPRING',
            damping: 18,
            stiffness: 180,
            mass: 0.8,
            enterTransition: 'scale_fade_vertical',
            haptic: 'light',
          },
          dataMutation: {
            type: 'OPTIMISTIC_SQLITE_INSERT',
            table: 'chat_messages',
            initialStatus: 'queued',
            idempotencyKey: true,
          },
        },
      },
    },

    composer_typing: {
      screen: 'ChatRoomFloor',
      component: '@repo/ui/components/native/Composer',
      keyboardAvoidance: 'adjustResize',
      userContextDescription: 'User is typing text; send button is active, character counter shown.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        keyboardVisible: true,
        elements: [
          { id: 'message_list', type: 'list', label: '14 existing messages' },
          { id: 'composer_input', type: 'input', label: 'Can you clarify homework question 3?', state: 'active' },
          { id: 'send_button', type: 'button', label: 'Send', state: 'enabled' },
          { id: 'char_counter', type: 'text', label: '38 / 2000' },
        ],
      },
      onEvents: {
        CLEAR_TEXT: {
          targetState: 'composer_idle',
        },
        TAP_SEND: {
          guard: 'input.trim().length > 0',
          targetState: 'optimistic_outbox',
          motion: {
            type: 'SPRING',
            damping: 18,
            stiffness: 180,
            mass: 0.8,
            haptic: 'light',
          },
          dataMutation: {
            type: 'OPTIMISTIC_SQLITE_INSERT',
            table: 'chat_messages',
            initialStatus: 'queued',
            idempotencyKey: true,
          },
        },
      },
    },

    optimistic_outbox: {
      screen: 'ChatRoomFloor',
      component: '@repo/community/screens/ChatMessageRow',
      keyboardAvoidance: 'adjustResize',
      userContextDescription: 'Message rendered in thread with clock icon. Dispatched to SQLite outbox and network.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        elements: [
          { id: 'message_bubble_sent', type: 'text', label: 'Can you clarify homework question 3?' },
          { id: 'status_badge', type: 'badge', label: '🕒 Pending Delivery' },
          { id: 'composer_input', type: 'input', label: '', state: 'enabled' },
        ],
      },
      onEvents: {
        NETWORK_DISCONNECT: {
          targetState: 'offline_queued',
          motion: { type: 'TIMING', durationMs: 200 },
        },
        SERVER_ERROR: {
          targetState: 'error_retryable',
          motion: { type: 'TIMING', durationMs: 250, haptic: 'error' },
        },
        STREAM_START: {
          targetState: 'message_streaming',
          motion: { type: 'SPRING', damping: 20, stiffness: 200 },
          dataMutation: {
            type: 'SSE_STREAM',
            table: '/api/v1/chat.stream',
          },
        },
        NETWORK_ACK: {
          targetState: 'terminal_delivered',
        },
      },
    },

    message_streaming: {
      screen: 'ChatRoomFloor',
      component: '@repo/ui/components/native/MessageStream',
      keyboardAvoidance: 'none',
      userContextDescription: 'Receiving chunked response stream from AI mentor or peer; auto-scrolling pinned.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        elements: [
          { id: 'stream_bubble', type: 'text', label: 'Certainly! In Question 3, the Calvin cycle requires ATP and NADPH...' },
          { id: 'pulsing_cursor', type: 'badge', label: '▌ Typing...' },
        ],
      },
      onEvents: {
        STREAM_COMPLETE: {
          targetState: 'terminal_delivered',
          motion: { type: 'SPRING', damping: 20, stiffness: 200 },
        },
        STREAM_FAIL: {
          targetState: 'error_retryable',
          motion: { type: 'TIMING', durationMs: 300, haptic: 'error' },
        },
      },
    },

    offline_queued: {
      screen: 'ChatRoomFloor',
      component: '@repo/community/screens/ChatMessageRow',
      keyboardAvoidance: 'none',
      userContextDescription: 'Network dropped. Message safely preserved in SQLite outbox queue.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        banner: { text: 'You are offline. Message queued and will send automatically when connected.', kind: 'warning' },
        elements: [
          { id: 'message_bubble_offline', type: 'text', label: 'Can you clarify homework question 3?' },
          { id: 'offline_badge', type: 'badge', label: '⏳ Waiting for connection' },
        ],
      },
      errorCopy: {
        en: 'Offline: message queued in outbox.',
        si: 'නොබැඳි: පණිවිඩය සුරැකිණි.',
        ta: 'ஆஃப்லைன்: செய்தி சேமிக்கப்பட்டது.',
      },
      onEvents: {
        NETWORK_RECONNECTED: {
          targetState: 'optimistic_outbox',
          motion: { type: 'SPRING', damping: 18, stiffness: 200, haptic: 'light' },
        },
        DISCARD_MESSAGE: {
          targetState: 'composer_idle',
        },
      },
    },

    error_retryable: {
      screen: 'ChatRoomFloor',
      component: '@repo/ui/components/native/ErrorState',
      keyboardAvoidance: 'none',
      userContextDescription: 'Message delivery failed due to network or server timeout. Tap to retry.',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        banner: { text: 'Delivery failed. Tap the retry icon or message to try again.', kind: 'error' },
        elements: [
          { id: 'failed_bubble', type: 'text', label: 'Can you clarify homework question 3?' },
          { id: 'error_icon', type: 'badge', label: '⚠️ Failed to send' },
          { id: 'retry_button', type: 'button', label: 'Tap to Retry', state: 'enabled' },
        ],
      },
      errorCopy: {
        en: 'Delivery failed. Tap to retry.',
        si: 'යැවීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.',
        ta: 'அனுப்ப முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
      },
      onEvents: {
        TAP_RETRY: {
          targetState: 'optimistic_outbox',
          motion: { type: 'SPRING', damping: 18, stiffness: 220, haptic: 'selection' },
        },
        CANCEL_SEND: {
          targetState: 'composer_idle',
        },
      },
    },
  },

  terminals: {
    terminal_delivered: {
      type: 'success',
      convergence: 'stay_in_screen',
      action: 'UPDATE_SQLITE_STATUS_DELIVERED',
      uiBadge: 'double_checkmark',
      haptic: 'selection',
      visualFrame: {
        screenTitle: 'Class 10 Biology Sanctuary',
        elements: [
          { id: 'delivered_bubble', type: 'text', label: 'Can you clarify homework question 3?' },
          { id: 'delivered_badge', type: 'badge', label: '✓✓ Delivered' },
        ],
      },
    },
    terminal_failed: {
      type: 'failure',
      convergence: 'stay_in_screen',
      action: 'MARK_STATUS_FAILED_IN_SQLITE',
      uiBadge: 'red_exclamation',
      haptic: 'error',
      retryEvent: 'TAP_RETRY',
    },
  },

  scenarios: {
    happy_path: {
      id: 'happy_path',
      title: 'Standard Online Send & Stream Delivery',
      persona: 'Student on Budget Android',
      initialIngress: 'in_app',
      steps: [
        {
          event: 'TYPE_TEXT',
          payload: { text: 'Can you clarify homework question 3?' },
          expectedState: 'composer_typing',
          assertion: 'Send button is enabled and character count is 38',
        },
        {
          event: 'TAP_SEND',
          expectedState: 'optimistic_outbox',
          assertion: 'Message is instantly visible with pending clock badge in SQLite WAL',
        },
        {
          event: 'STREAM_START',
          expectedState: 'message_streaming',
          assertion: 'SSE stream connection established, pulsing cursor active',
        },
        {
          event: 'STREAM_COMPLETE',
          expectedState: 'terminal_delivered',
          assertion: 'Delivered double-checkmark badge displayed with haptic selection',
        },
      ],
      expectedTerminal: 'terminal_delivered',
    },

    offline_recovery: {
      id: 'offline_recovery',
      title: 'Offline Drop & Auto-Recovery Outbox Sync',
      persona: 'Student in Rural Area (2G/Drop)',
      initialIngress: 'in_app',
      steps: [
        {
          event: 'TYPE_TEXT',
          payload: { text: 'Can you clarify homework question 3?' },
          expectedState: 'composer_typing',
          assertion: 'Text input populated',
        },
        {
          event: 'TAP_SEND',
          expectedState: 'optimistic_outbox',
          assertion: 'Local row created in chat_messages with status=queued',
        },
        {
          event: 'NETWORK_DISCONNECT',
          expectedState: 'offline_queued',
          assertion: 'Offline warning banner rendered; draft preserved in SQLite outbox',
        },
        {
          event: 'NETWORK_RECONNECTED',
          expectedState: 'optimistic_outbox',
          assertion: 'Auto-retrying outbox transmission with same idempotencyKey',
        },
        {
          event: 'NETWORK_ACK',
          expectedState: 'terminal_delivered',
          assertion: 'Status transitions to delivered',
        },
      ],
      expectedTerminal: 'terminal_delivered',
    },

    server_error_retry: {
      id: 'server_error_retry',
      title: 'Server 500 Error with Manual Retry',
      persona: 'Teacher on Classroom Tablet',
      initialIngress: 'deep_link',
      steps: [
        {
          event: 'TYPE_TEXT',
          payload: { text: 'Here is the assignment rubric.' },
          expectedState: 'composer_typing',
          assertion: 'Text input populated',
        },
        {
          event: 'TAP_SEND',
          expectedState: 'optimistic_outbox',
          assertion: 'Local echo created',
        },
        {
          event: 'SERVER_ERROR',
          expectedState: 'error_retryable',
          assertion: 'Error banner shown; tap-to-retry button active; text not lost',
        },
        {
          event: 'TAP_RETRY',
          expectedState: 'optimistic_outbox',
          assertion: 'Retrying transmission',
        },
        {
          event: 'NETWORK_ACK',
          expectedState: 'terminal_delivered',
          assertion: 'Delivered successfully after retry',
        },
      ],
      expectedTerminal: 'terminal_delivered',
    },

    empty_state_prompt: {
      id: 'empty_state_prompt',
      title: 'First-Time User Starting Conversation from Suggested Prompt',
      persona: 'New Student',
      initialIngress: 'cold_boot',
      steps: [
        {
          event: 'TAP_PROMPT',
          payload: { prompt: 'Explain Calvin cycle in simple terms' },
          expectedState: 'composer_typing',
          assertion: 'Composer input populated with suggested prompt text',
        },
        {
          event: 'TAP_SEND',
          expectedState: 'optimistic_outbox',
          assertion: 'Optimistic bubble created',
        },
        {
          event: 'NETWORK_ACK',
          expectedState: 'terminal_delivered',
          assertion: 'Message delivered',
        },
      ],
      expectedTerminal: 'terminal_delivered',
    },
  },

  invariants: {
    rlsPolicy:
      'tenant_id = public.get_my_tenant_id() AND EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.thread_id = chat_messages.thread_id AND cp.user_id = public.get_my_id())',
    softDeleteField: 'deleted_at IS NULL',
    forbiddenDialects: [
      'runOnJS',
      'runOnUI',
      'PanGestureHandler',
      'React.forwardRef',
      'useFormState',
      'Alert.alert',
    ],
    tenantIsolationField: 'tenant_id',
  },
};
