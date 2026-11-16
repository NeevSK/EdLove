import type { FlowDefinition } from './types.js';

export const todoReorderSyncFlow: FlowDefinition = {
  metadata: {
    id: 'journey:todo.reorder_sync',
    version: '1.2.0',
    domain: 'classroom.workspace',
    riskTier: 'standard',
    targetEngines: {
      expo: '>=58.0.0',
      react: '>=19.0.0',
    },
    author: 'Naveen & Antigravity',
    lastUpdated: '2026-11-11',
    schemaHash: 'sha256-8a7e6f5c4b3a2d1e0f9a8b7c',
  },

  ingress: {
    supportedVectors: [
      { type: 'in_app', sourceScreen: 'ClassroomWorkspaceFloor' },
      { type: 'deep_link', deepLinkPattern: 'sanctuary://classroom/:classId/todos' },
    ],
    guards: [
      {
        name: 'isAuthenticated',
        predicate: 'session.isValid === true',
        onFailureBounceRoute: 'AuthSheetModal',
      },
      {
        name: 'hasActiveEnrollment',
        predicate: 'enrollments.some(e => e.classId === route.params.classId && e.isActive)',
        onFailureBounceRoute: 'EnrollmentRequiredFloor',
      },
    ],
  },

  states: {
    list_idle: {
      screen: 'TodoListFloor',
      component: '@repo/ui/components/native/ReorderableList',
      keyboardAvoidance: 'none',
      onEvents: {
        LONG_PRESS_ITEM: {
          guard: 'item.isLocked !== true',
          targetState: 'item_dragging',
          motion: {
            type: 'SPRING',
            damping: 15,
            stiffness: 220,
            haptic: 'selection',
          },
        },
        TOGGLE_COMPLETED: {
          guard: 'item != null',
          targetState: 'list_idle',
          motion: {
            type: 'SPRING',
            damping: 20,
            stiffness: 250,
            haptic: 'light',
          },
          dataMutation: {
            type: 'SQLITE_MUTATION',
            table: 'todo_items',
            operation: 'UPDATE_COMPLETION_STATE',
            idempotencyKey: true,
          },
        },
      },
    },

    item_dragging: {
      screen: 'TodoListFloor',
      component: '@repo/ui/components/native/ReorderableItem',
      keyboardAvoidance: 'none',
      onEvents: {
        DROP_ITEM: {
          guard: 'newIndex !== oldIndex',
          targetState: 'sync_reorder',
          motion: {
            type: 'SPRING',
            damping: 18,
            stiffness: 190,
            haptic: 'medium',
          },
        },
        CANCEL_DRAG: {
          targetState: 'list_idle',
          motion: {
            type: 'SPRING',
            damping: 20,
            stiffness: 200,
          },
        },
      },
    },

    sync_reorder: {
      screen: 'TodoListFloor',
      component: '@repo/ui/components/native/ReorderableList',
      keyboardAvoidance: 'none',
      onEvents: {
        SYNC_SUCCESS: {
          targetState: 'terminal_reorder_settled',
          dataMutation: {
            type: 'SQLITE_MUTATION',
            table: 'todo_items',
            operation: 'BATCH_FRACTIONAL_INDEX_UPDATE',
            idempotencyKey: true,
          },
        },
        SYNC_FAIL: {
          targetState: 'terminal_reorder_reverted',
        },
      },
    },
  },

  terminals: {
    terminal_reorder_settled: {
      type: 'success',
      convergence: 'stay_in_screen',
      action: 'COMMIT_FRACTIONAL_INDICES',
      uiBadge: 'synced_check',
      haptic: 'light',
    },
    terminal_reorder_reverted: {
      type: 'failure',
      convergence: 'stay_in_screen',
      action: 'ROLLBACK_OPTIMISTIC_ORDER',
      uiBadge: 'sync_warning',
      haptic: 'error',
      retryEvent: 'DROP_ITEM',
    },
  },

  invariants: {
    rlsPolicy: 'tenant_id = public.get_my_tenant_id() AND student_id = public.get_my_id()',
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
