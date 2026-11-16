import type { FlowDefinition } from './types.js';

export const libraryResourceFlow: FlowDefinition = {
  metadata: {
    id: 'journey:library.resource_lifecycle',
    version: '2.0.0',
    domain: 'sanctuary.library',
    riskTier: 'sensitive',
    targetEngines: {
      expo: '>=58.0.0',
      react: '>=19.0.0',
    },
    author: 'Naveen & Antigravity',
    lastUpdated: '2026-11-11',
    schemaHash: 'sha256-7f8e9d0c1b2a3f4e5d6c7b8a',
    multiActor: true,
  },

  personas: [
    {
      role: 'Student Scholar',
      device: 'Budget Android (2GB RAM, 60Hz)',
      network: 'Rural 2G/Edge Cellular',
      description: 'Learner browsing biology resources, bookmarking for offline study, and logging view history.',
    },
    {
      role: 'Student Author',
      device: 'Mid-range Android Phone',
      network: 'School Wi-Fi',
      description: 'Learner authoring personal study notes and promoting them into the public school library.',
    },
    {
      role: 'Curator / Teacher Reviewer',
      device: 'Classroom iPad / Web Desktop',
      network: 'Broadband Fiber',
      description: 'Subject-matter teacher reviewing student-submitted notes before approving public library publication.',
    },
  ],

  acceptanceCriteria: [
    {
      id: 'AC-LIB-1',
      title: 'Offline Reading & Progress Retention',
      rule: 'Cached resources must remain fully readable offline, recording scroll position and view history in local SQLite WAL.',
      verifiedByScenario: 'explore_and_read',
    },
    {
      id: 'AC-LIB-2',
      title: 'Sub-16ms Optimistic Bookmarking',
      rule: 'Tapping bookmark in Reader immediately saves resource reference to personal workspace with haptic feedback.',
      verifiedByScenario: 'bookmark_to_personal_workspace',
    },
    {
      id: 'AC-LIB-3',
      title: 'Gated Reviewer Approval Pipeline',
      rule: 'Promoted personal notes cannot appear in public library catalog until a qualified reviewer approves the review ticket.',
      verifiedByScenario: 'promote_note_with_reviewer_loop',
    },
    {
      id: 'AC-LIB-4',
      title: 'Non-Destructive Soft Delete with Undo Window',
      rule: 'Removing a resource sets deleted_at timestamp and provides a 5-second undo toast before final soft-delete commit.',
      verifiedByScenario: 'remove_with_undo_window',
    },
    {
      id: 'AC-LIB-5',
      title: 'Multi-Tenant RLS Resource Isolation',
      rule: 'Published and staged library resources are strictly scoped to public.get_my_tenant_id() to prevent cross-school leaks.',
      verifiedByScenario: 'promote_note_with_reviewer_loop',
    },
  ],

  ingress: {
    supportedVectors: [
      { type: 'cold_boot' },
      { type: 'in_app', sourceScreen: 'PersonalNotesFloor' },
      { type: 'in_app', sourceScreen: 'BottomNavigationTabs' },
      { type: 'deep_link', deepLinkPattern: 'sanctuary://library/resources/:resourceId' },
      { type: 'deep_link', deepLinkPattern: 'sanctuary://library/reviews/:reviewId' },
    ],
    guards: [
      {
        name: 'isAuthenticated',
        predicate: 'session.isValid === true',
        onFailureBounceRoute: 'AuthSheetModal',
      },
      {
        name: 'hasTenantMembership',
        predicate: 'currentUser.tenantId === session.activeTenantId',
        onFailureBounceRoute: 'TenantMismatchFloor',
      },
    ],
  },

  states: {
    explore_catalog: {
      screen: 'LibraryExploreFloor',
      surface: 'library_shared',
      component: '@repo/library/screens/LibraryExploreScreen',
      keyboardAvoidance: 'none',
      userContextDescription: 'User browsing catalog with search bar, subject filters (Biology, Grade 10), and resource cards.',
      visualFrame: {
        screenTitle: 'Knowledge Sanctuary Library',
        elements: [
          { id: 'search_bar', type: 'input', label: 'Search 4,200 verified resources...', state: 'enabled' },
          { id: 'filter_chip_bio', type: 'button', label: 'Biology (Grade 10)', state: 'active' },
          { id: 'filter_chip_lang', type: 'button', label: 'Medium: Sinhala / English', state: 'enabled' },
          { id: 'resource_card_1', type: 'list', label: 'Plant Physiology & Calvin Cycle Notes' },
          { id: 'resource_card_2', type: 'list', label: 'National O/L Model Past Papers' },
        ],
      },
      onEvents: {
        SELECT_RESOURCE: {
          targetState: 'resource_detail',
          motion: { type: 'SPRING', damping: 20, stiffness: 200, haptic: 'selection' },
        },
        OPEN_PERSONAL_NOTES: {
          targetState: 'personal_notes_view',
          motion: { type: 'VIEW_TRANSITION', enterTransition: 'slide_from_left' },
        },
      },
    },

    resource_detail: {
      screen: 'ResourceDetailModal',
      surface: 'modal',
      component: '@repo/library/screens/DocumentViewerScreen',
      keyboardAvoidance: 'none',
      userContextDescription: 'Modal inspecting resource metadata, abstract, peer review stamp, file size, and reading actions.',
      visualFrame: {
        screenTitle: 'Resource: Plant Physiology Notes',
        elements: [
          { id: 'resource_title', type: 'text', label: 'Plant Physiology & Photosynthesis Master Summary' },
          { id: 'curator_badge', type: 'badge', label: '✅ Verified by Teacher Bandara' },
          { id: 'abstract_text', type: 'text', label: 'Complete visual walkthrough of dark and light reactions...' },
          { id: 'read_button', type: 'button', label: 'Open in Reader', state: 'enabled' },
          { id: 'archive_button', type: 'button', label: 'Remove / Archive', state: 'enabled' },
        ],
      },
      onEvents: {
        TAP_READ: {
          targetState: 'reader_active',
          motion: { type: 'SPRING', damping: 18, stiffness: 190 },
          dataMutation: {
            type: 'SQLITE_MUTATION',
            table: 'resource_view_history',
            operation: 'LOG_VIEW_SESSION',
            idempotencyKey: true,
          },
        },
        TAP_REMOVE: {
          targetState: 'removal_pending_undo',
          motion: { type: 'TIMING', durationMs: 200, haptic: 'warning' },
        },
        CLOSE_MODAL: {
          targetState: 'explore_catalog',
        },
      },
    },

    reader_active: {
      screen: 'ReaderFloor',
      surface: 'reader_modal',
      component: '@repo/library/screens/ReaderScreen',
      keyboardAvoidance: 'none',
      userContextDescription: 'Full-screen reader with font size toggles, progress indicator, and bookmark button.',
      visualFrame: {
        screenTitle: 'Reader: Plant Physiology Notes',
        elements: [
          { id: 'reader_content', type: 'text', label: 'Chapter 4: The Light Dependent Phase... (Reading: 42%)' },
          { id: 'bookmark_icon', type: 'button', label: 'Bookmark to Personal Workspace', state: 'enabled' },
          { id: 'share_icon', type: 'button', label: 'Share with Classmate', state: 'enabled' },
        ],
      },
      onEvents: {
        TAP_BOOKMARK: {
          targetState: 'reader_bookmarked',
          motion: { type: 'SPRING', damping: 15, stiffness: 220, haptic: 'selection' },
          dataMutation: {
            type: 'OPTIMISTIC_SQLITE_INSERT',
            table: 'personal_bookmarks',
            initialStatus: 'bookmarked',
            idempotencyKey: true,
          },
        },
        EXIT_READER: {
          targetState: 'explore_catalog',
          motion: { type: 'VIEW_TRANSITION', enterTransition: 'pop' },
        },
      },
    },

    reader_bookmarked: {
      screen: 'ReaderFloor',
      surface: 'reader_modal',
      component: '@repo/library/screens/ReaderScreen',
      keyboardAvoidance: 'none',
      userContextDescription: 'Bookmark active in personal workspace. Haptic feedback delivered.',
      visualFrame: {
        screenTitle: 'Reader: Plant Physiology Notes',
        elements: [
          { id: 'reader_content', type: 'text', label: 'Chapter 4: The Light Dependent Phase... (Reading: 42%)' },
          { id: 'bookmark_icon', type: 'button', label: '★ Bookmarked in Workspace', state: 'active' },
        ],
      },
      onEvents: {
        DISMISS_BOOKMARK_FEEDBACK: {
          targetState: 'terminal_bookmarked',
        },
      },
    },

    personal_notes_view: {
      screen: 'PersonalNotesFloor',
      surface: 'personal_space',
      component: '@repo/library/workspace/useLibraryWorkspaceSurfaces',
      keyboardAvoidance: 'adjustResize',
      userContextDescription: 'Author inspecting their personal notes in personal space, preparing to promote to school library.',
      visualFrame: {
        screenTitle: 'My Personal Notes: Calvin Cycle Guide',
        elements: [
          { id: 'note_title', type: 'text', label: 'Calvin Cycle & Energy Balance (My Personal Synthesis)' },
          { id: 'note_body', type: 'text', label: 'Summary created during revision with 4 diagrams...' },
          { id: 'promote_button', type: 'button', label: 'Promote Note to School Library', state: 'enabled' },
        ],
      },
      onEvents: {
        TAP_PROMOTE: {
          actor: 'author',
          targetState: 'reviewer_staging_sheet',
          motion: { type: 'SPRING', damping: 18, stiffness: 180, haptic: 'light' },
        },
      },
    },

    reviewer_staging_sheet: {
      screen: 'ReviewerSelectionModal',
      surface: 'modal',
      component: '@repo/library/screens/ReviewerSelectionModal',
      keyboardAvoidance: 'adjustResize',
      userContextDescription: 'Modal where author designates a qualified reviewer and attaches submission notes.',
      visualFrame: {
        screenTitle: 'Promote Note: Select Reviewer',
        elements: [
          { id: 'reviewer_picker', type: 'button', label: 'Assigned Reviewer: Teacher Bandara (Biology)', state: 'active' },
          { id: 'submission_note', type: 'input', label: 'Please verify accuracy of Calvin cycle ATP count.', state: 'enabled' },
          { id: 'submit_for_review_btn', type: 'button', label: 'Submit for Peer Review', state: 'enabled' },
        ],
      },
      onEvents: {
        SUBMIT_REVIEW_REQUEST: {
          actor: 'author',
          targetState: 'review_pending_in_desk',
          motion: { type: 'SPRING', damping: 20, stiffness: 200 },
          dataMutation: {
            type: 'BATCH_TRANSACTION',
            table: 'library_resources',
            operation: 'STAGE_RESOURCE_FOR_REVIEW',
            initialStatus: 'pending_review',
            secondaryTables: [
              { table: 'personal_notes', operation: 'FLAG_PROMOTED_PENDING' },
              { table: 'resource_reviews', operation: 'CREATE_ASSIGNED_TICKET', status: 'open' },
            ],
          },
        },
      },
    },

    review_pending_in_desk: {
      screen: 'ReviewerDeskFloor',
      surface: 'reviewer_desk',
      component: '@repo/library/screens/ReviewerDeskFloor',
      keyboardAvoidance: 'none',
      userContextDescription: 'Reviewer inspects submitted note in their review desk, checking scientific accuracy.',
      visualFrame: {
        screenTitle: 'Curator Desk: Review Ticket #402',
        banner: { text: 'Submitted by Student Naveen for Library Publication.', kind: 'info' },
        elements: [
          { id: 'draft_preview', type: 'text', label: 'Note: Calvin Cycle & Energy Balance (4 diagrams attached)' },
          { id: 'student_comment', type: 'text', label: 'Student note: Please verify accuracy of ATP count.' },
          { id: 'approve_button', type: 'button', label: 'Approve & Publish to Library', state: 'enabled' },
          { id: 'request_changes_button', type: 'button', label: 'Request Changes', state: 'enabled' },
        ],
      },
      onEvents: {
        APPROVE_RESOURCE: {
          actor: 'reviewer',
          targetState: 'terminal_published',
          motion: { type: 'SPRING', damping: 15, stiffness: 220, haptic: 'selection' },
          dataMutation: {
            type: 'BATCH_TRANSACTION',
            table: 'library_resources',
            operation: 'PUBLISH_RESOURCE',
            initialStatus: 'published',
            secondaryTables: [
              { table: 'resource_reviews', operation: 'RESOLVE_TICKET', status: 'approved' },
              { table: 'activity_audit_log', operation: 'LOG_CURATOR_APPROVAL' },
            ],
          },
        },
      },
    },

    removal_pending_undo: {
      screen: 'ResourceDetailModal',
      surface: 'modal',
      component: '@repo/library/screens/DocumentViewerScreen',
      keyboardAvoidance: 'none',
      userContextDescription: 'Resource archived with 5-second undo toast window before final soft-delete commit.',
      visualFrame: {
        screenTitle: 'Resource: Plant Physiology Notes',
        banner: { text: 'Resource archived. Tap Undo within 5s to cancel.', kind: 'warning' },
        elements: [
          { id: 'undo_button', type: 'button', label: 'Undo Removal (5s)', state: 'enabled' },
        ],
      },
      onEvents: {
        UNDO_REMOVAL: {
          targetState: 'resource_detail',
          motion: { type: 'SPRING', damping: 18, stiffness: 200, haptic: 'light' },
        },
        TIMEOUT_COMMIT: {
          targetState: 'terminal_archived_with_undo',
          dataMutation: {
            type: 'SQLITE_MUTATION',
            table: 'library_resources',
            operation: 'SOFT_DELETE_RESOURCE',
            idempotencyKey: true,
          },
        },
      },
    },
  },

  terminals: {
    terminal_published: {
      type: 'success',
      convergence: 'celebration_floor',
      action: 'NOTIFY_AUTHOR_RESOURCE_PUBLISHED',
      uiBadge: 'verified_curator_badge',
      haptic: 'selection',
      visualFrame: {
        screenTitle: 'Resource Published to Knowledge Sanctuary',
        banner: { text: 'Congratulations! Your notes are now published in the School Library.', kind: 'success' },
        elements: [
          { id: 'badge', type: 'badge', label: '🏆 Published in Class 10 Biology' },
          { id: 'open_in_catalog', type: 'button', label: 'View in Library Catalog', state: 'enabled' },
        ],
      },
    },

    terminal_bookmarked: {
      type: 'success',
      convergence: 'stay_in_screen',
      action: 'UPDATE_PERSONAL_WORKSPACE_SYNC',
      uiBadge: 'bookmarked_star',
      haptic: 'light',
    },

    terminal_archived_with_undo: {
      type: 'success',
      convergence: 'pop_screen',
      action: 'COMMIT_SOFT_DELETE',
      uiBadge: 'archived_icon',
      haptic: 'light',
    },
  },

  scenarios: {
    explore_and_read: {
      id: 'explore_and_read',
      title: 'Catalog Exploration, Filter Selection & Reader Launch',
      persona: 'Student Scholar on Budget Android',
      initialIngress: 'in_app',
      steps: [
        {
          event: 'SELECT_RESOURCE',
          expectedState: 'resource_detail',
          assertion: 'Resource detail modal opens with metadata and curator badge',
        },
        {
          event: 'TAP_READ',
          expectedState: 'reader_active',
          assertion: 'Full screen Reader launches; view session logged to SQLite history',
        },
        {
          event: 'TAP_BOOKMARK',
          expectedState: 'reader_bookmarked',
          assertion: 'Bookmark icon toggles to active; local SQLite optimistic echo',
        },
        {
          event: 'DISMISS_BOOKMARK_FEEDBACK',
          expectedState: 'terminal_bookmarked',
          assertion: 'Resource bookmarked in personal workspace',
        },
      ],
      expectedTerminal: 'terminal_bookmarked',
    },

    bookmark_to_personal_workspace: {
      id: 'bookmark_to_personal_workspace',
      title: 'Connecting Library Resource to Personal Workspace Bookmarks',
      persona: 'Student Scholar',
      initialIngress: 'deep_link',
      steps: [
        {
          event: 'SELECT_RESOURCE',
          expectedState: 'resource_detail',
          assertion: 'Detail modal loaded',
        },
        {
          event: 'TAP_READ',
          expectedState: 'reader_active',
          assertion: 'Reader open',
        },
        {
          event: 'TAP_BOOKMARK',
          expectedState: 'reader_bookmarked',
          assertion: 'Personal bookmark created in SQLite',
        },
        {
          event: 'DISMISS_BOOKMARK_FEEDBACK',
          expectedState: 'terminal_bookmarked',
          assertion: 'Personal workspace sync triggered',
        },
      ],
      expectedTerminal: 'terminal_bookmarked',
    },

    promote_note_with_reviewer_loop: {
      id: 'promote_note_with_reviewer_loop',
      title: 'Promoting Personal Note to Library via Teacher Reviewer Approval',
      persona: 'Student Author & Teacher Reviewer (Multi-Actor)',
      initialIngress: 'in_app',
      steps: [
        {
          event: 'OPEN_PERSONAL_NOTES',
          expectedState: 'personal_notes_view',
          assertion: 'Student opens personal notes workspace',
        },
        {
          event: 'TAP_PROMOTE',
          expectedState: 'reviewer_staging_sheet',
          assertion: 'Reviewer staging modal opens with teacher picker',
        },
        {
          event: 'SUBMIT_REVIEW_REQUEST',
          expectedState: 'review_pending_in_desk',
          assertion: 'Batch transaction stages resource & creates review ticket',
        },
        {
          event: 'APPROVE_RESOURCE',
          expectedState: 'terminal_published',
          assertion: 'Teacher approves note; resource published to school library with curator badge',
        },
      ],
      expectedTerminal: 'terminal_published',
    },

    remove_with_undo_window: {
      id: 'remove_with_undo_window',
      title: 'Soft-Delete Resource with 5-Second Undo Protection',
      persona: 'Teacher Reviewer',
      initialIngress: 'in_app',
      steps: [
        {
          event: 'SELECT_RESOURCE',
          expectedState: 'resource_detail',
          assertion: 'Detail modal opens',
        },
        {
          event: 'TAP_REMOVE',
          expectedState: 'removal_pending_undo',
          assertion: '5-second undo toast banner displayed',
        },
        {
          event: 'TIMEOUT_COMMIT',
          expectedState: 'terminal_archived_with_undo',
          assertion: 'Soft delete committed to SQLite with deleted_at timestamp',
        },
      ],
      expectedTerminal: 'terminal_archived_with_undo',
    },
  },

  invariants: {
    rlsPolicy:
      'tenant_id = public.get_my_tenant_id() AND (status = \'published\' OR author_id = public.get_my_id() OR reviewer_id = public.get_my_id())',
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
