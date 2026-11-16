import type { FlowDefinition, RiskTier, VisualFrame } from './types.js';
import { validateFlow } from './flowValidator.js';

export interface DynamicRequirementInput {
  journeyId: string;
  domain: string;
  riskTier?: RiskTier;
  title: string;
  primaryActor: string;
  primaryScreen: string;
  primaryTable: string;
  pattern: 'MUTATION_WITH_OFFLINE_SYNC' | 'MULTI_ACTOR_REVIEW' | 'EXPLORATION_READ' | 'DRAG_REORDER';
  reviewerRole?: string;
  acceptanceRules?: string[];
}

export class RequirementCompiler {
  public static compile(input: DynamicRequirementInput): FlowDefinition {
    const riskTier = input.riskTier || 'standard';
    const cleanId = input.journeyId.startsWith('journey:') ? input.journeyId : `journey:${input.journeyId}`;

    if (input.pattern === 'MUTATION_WITH_OFFLINE_SYNC') {
      return this.compileOfflineSyncPattern(cleanId, input, riskTier);
    } else if (input.pattern === 'MULTI_ACTOR_REVIEW') {
      return this.compileReviewerPattern(cleanId, input, riskTier);
    } else {
      return this.compileExplorationPattern(cleanId, input, riskTier);
    }
  }

  private static compileOfflineSyncPattern(
    cleanId: string,
    input: DynamicRequirementInput,
    riskTier: RiskTier,
  ): FlowDefinition {
    const states: FlowDefinition['states'] = {
      idle_state: {
        screen: input.primaryScreen,
        component: `@repo/ui/components/native/${input.primaryScreen}View`,
        keyboardAvoidance: 'none',
        userContextDescription: `Initial screen for ${input.title}. Ready for actor input.`,
        visualFrame: {
          screenTitle: input.title,
          elements: [
            { id: 'primary_action_btn', type: 'button', label: `Submit ${input.title}`, state: 'enabled' },
          ],
        },
        onEvents: {
          TRIGGER_ACTION: {
            targetState: 'optimistic_pending',
            motion: { type: 'SPRING', damping: 18, stiffness: 180, haptic: 'light' },
            dataMutation: {
              type: 'OPTIMISTIC_SQLITE_INSERT',
              table: input.primaryTable,
              initialStatus: 'queued',
              idempotencyKey: true,
            },
          },
        },
      },

      optimistic_pending: {
        screen: input.primaryScreen,
        component: `@repo/ui/components/native/${input.primaryScreen}View`,
        keyboardAvoidance: 'none',
        userContextDescription: 'Optimistic local echo rendered with pending indicator.',
        visualFrame: {
          screenTitle: input.title,
          elements: [
            { id: 'pending_badge', type: 'badge', label: '🕒 Pending Delivery' },
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
          NETWORK_ACK: {
            targetState: 'terminal_success',
          },
        },
      },

      offline_queued: {
        screen: input.primaryScreen,
        component: `@repo/ui/components/native/${input.primaryScreen}View`,
        keyboardAvoidance: 'none',
        userContextDescription: 'Network dropped; mutation queued in SQLite WAL outbox.',
        visualFrame: {
          screenTitle: input.title,
          banner: { text: 'You are offline. Queued for auto-sync.', kind: 'warning' },
          elements: [
            { id: 'offline_indicator', type: 'badge', label: '⏳ Waiting for connection' },
          ],
        },
        onEvents: {
          NETWORK_RECONNECTED: {
            targetState: 'optimistic_pending',
            motion: { type: 'SPRING', damping: 18, stiffness: 200, haptic: 'light' },
          },
        },
      },

      error_retryable: {
        screen: input.primaryScreen,
        component: `@repo/ui/components/native/${input.primaryScreen}View`,
        keyboardAvoidance: 'none',
        userContextDescription: 'Server rejected mutation. User can retry.',
        visualFrame: {
          screenTitle: input.title,
          banner: { text: 'Transmission failed. Tap to retry.', kind: 'error' },
          elements: [
            { id: 'retry_btn', type: 'button', label: 'Retry', state: 'enabled' },
          ],
        },
        onEvents: {
          TAP_RETRY: {
            targetState: 'optimistic_pending',
            motion: { type: 'SPRING', damping: 18, stiffness: 220, haptic: 'selection' },
          },
        },
      },
    };

    const flow: FlowDefinition = {
      metadata: {
        id: cleanId,
        version: '1.0.0',
        domain: input.domain,
        riskTier,
        targetEngines: { expo: '>=58.0.0', react: '>=19.0.0' },
        author: 'RequirementCompiler (Dynamic)',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      personas: [
        {
          role: input.primaryActor,
          device: 'Standard Mobile Device',
          network: 'Cellular / Wi-Fi',
          description: `User performing ${input.title} under field conditions.`,
        },
      ],
      acceptanceCriteria: [
        {
          id: 'AC-DYN-1',
          title: 'Offline WAL Persistence',
          rule: `Mutations to ${input.primaryTable} must survive network interruptions in local SQLite.`,
          verifiedByScenario: 'offline_recovery',
        },
        {
          id: 'AC-DYN-2',
          title: 'Optimistic UI Echo',
          rule: 'Local echo rendered before server network acknowledgement.',
          verifiedByScenario: 'happy_path',
        },
      ],
      ingress: {
        supportedVectors: [
          { type: 'in_app' },
          { type: 'deep_link', deepLinkPattern: `sanctuary://${input.domain.replace('.', '/')}` },
        ],
        guards: [
          { name: 'isAuthenticated', predicate: 'session.isValid === true', onFailureBounceRoute: 'AuthSheetModal' },
        ],
      },
      states,
      terminals: {
        terminal_success: {
          type: 'success',
          convergence: 'stay_in_screen',
          action: `COMMIT_${input.primaryTable.toUpperCase()}_MUTATION`,
          uiBadge: 'synced_checkmark',
          haptic: 'light',
        },
      },
      scenarios: {
        happy_path: {
          id: 'happy_path',
          title: `Standard ${input.title} Execution`,
          persona: input.primaryActor,
          initialIngress: 'in_app',
          steps: [
            { event: 'TRIGGER_ACTION', expectedState: 'optimistic_pending', assertion: 'Optimistic echo created' },
            { event: 'NETWORK_ACK', expectedState: 'terminal_success', assertion: 'Successfully synced with server' },
          ],
          expectedTerminal: 'terminal_success',
        },
        offline_recovery: {
          id: 'offline_recovery',
          title: `Offline Interruption during ${input.title}`,
          persona: input.primaryActor,
          initialIngress: 'in_app',
          steps: [
            { event: 'TRIGGER_ACTION', expectedState: 'optimistic_pending', assertion: 'Optimistic echo created' },
            { event: 'NETWORK_DISCONNECT', expectedState: 'offline_queued', assertion: 'Offline banner shown' },
            { event: 'NETWORK_RECONNECTED', expectedState: 'optimistic_pending', assertion: 'Auto-retrying sync' },
            { event: 'NETWORK_ACK', expectedState: 'terminal_success', assertion: 'Recovered successfully' },
          ],
          expectedTerminal: 'terminal_success',
        },
      },
      invariants: {
        rlsPolicy: `tenant_id = public.get_my_tenant_id()`,
        softDeleteField: 'deleted_at IS NULL',
        forbiddenDialects: ['runOnJS', 'runOnUI', 'PanGestureHandler', 'React.forwardRef', 'useFormState', 'Alert.alert'],
        tenantIsolationField: 'tenant_id',
      },
    };

    const validation = validateFlow(flow);
    if (!validation.valid) {
      throw new Error(`Compiler generated an invalid flow: ${validation.errors.join('; ')}`);
    }

    return flow;
  }

  private static compileReviewerPattern(cleanId: string, input: DynamicRequirementInput, riskTier: RiskTier): FlowDefinition {
    // Multi-actor review pattern compiler
    const flow: FlowDefinition = {
      metadata: {
        id: cleanId,
        version: '1.0.0',
        domain: input.domain,
        riskTier,
        targetEngines: { expo: '>=58.0.0', react: '>=19.0.0' },
        author: 'RequirementCompiler (Dynamic)',
        lastUpdated: new Date().toISOString().split('T')[0],
        multiActor: true,
      },
      personas: [
        { role: input.primaryActor, device: 'Mobile', network: 'Wi-Fi', description: 'Submitter' },
        { role: input.reviewerRole || 'Reviewer', device: 'Desktop', network: 'Fiber', description: 'Reviewer' },
      ],
      ingress: {
        supportedVectors: [{ type: 'in_app' }],
        guards: [{ name: 'isAuthenticated', predicate: 'session.isValid === true', onFailureBounceRoute: 'AuthSheetModal' }],
      },
      states: {
        draft_view: {
          screen: input.primaryScreen,
          component: `@repo/ui/components/native/${input.primaryScreen}`,
          surface: 'personal_space',
          onEvents: {
            SUBMIT_REVIEW: {
              actor: 'author',
              targetState: 'under_review',
              dataMutation: {
                type: 'BATCH_TRANSACTION',
                table: input.primaryTable,
                operation: 'SUBMIT_FOR_REVIEW',
                initialStatus: 'pending_review',
              },
            },
          },
        },
        under_review: {
          screen: 'ReviewDeskFloor',
          component: '@repo/ui/components/native/ReviewDeskFloor',
          surface: 'reviewer_desk',
          onEvents: {
            APPROVE: {
              actor: 'reviewer',
              targetState: 'terminal_approved',
              dataMutation: {
                type: 'BATCH_TRANSACTION',
                table: input.primaryTable,
                operation: 'APPROVE_SUBMISSION',
                initialStatus: 'approved',
              },
            },
          },
        },
      },
      terminals: {
        terminal_approved: {
          type: 'success',
          convergence: 'celebration_floor',
          action: 'NOTIFY_AUTHOR_APPROVED',
        },
      },
      scenarios: {
        happy_path: {
          id: 'happy_path',
          title: 'Review Submission & Approval',
          persona: 'Multi-Actor',
          initialIngress: 'in_app',
          steps: [
            { event: 'SUBMIT_REVIEW', expectedState: 'under_review', assertion: 'Submitted to review desk' },
            { event: 'APPROVE', expectedState: 'terminal_approved', assertion: 'Reviewer approved submission' },
          ],
          expectedTerminal: 'terminal_approved',
        },
      },
      invariants: {
        rlsPolicy: 'tenant_id = public.get_my_tenant_id()',
        softDeleteField: 'deleted_at IS NULL',
        forbiddenDialects: ['runOnJS', 'runOnUI', 'PanGestureHandler', 'React.forwardRef', 'useFormState'],
        tenantIsolationField: 'tenant_id',
      },
    };

    const validation = validateFlow(flow);
    if (!validation.valid) throw new Error(`Compiler generated an invalid flow: ${validation.errors.join('; ')}`);
    return flow;
  }

  private static compileExplorationPattern(cleanId: string, input: DynamicRequirementInput, riskTier: RiskTier): FlowDefinition {
    // Exploration / Reader pattern
    const flow: FlowDefinition = {
      metadata: {
        id: cleanId,
        version: '1.0.0',
        domain: input.domain,
        riskTier,
        targetEngines: { expo: '>=58.0.0', react: '>=19.0.0' },
        author: 'RequirementCompiler (Dynamic)',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      ingress: {
        supportedVectors: [{ type: 'in_app' }],
        guards: [{ name: 'isAuthenticated', predicate: 'session.isValid === true', onFailureBounceRoute: 'AuthSheetModal' }],
      },
      states: {
        catalog_view: {
          screen: input.primaryScreen,
          component: `@repo/ui/components/native/${input.primaryScreen}`,
          onEvents: {
            SELECT_ITEM: { targetState: 'terminal_viewed' },
          },
        },
      },
      terminals: {
        terminal_viewed: { type: 'success', convergence: 'stay_in_screen' },
      },
      invariants: {
        rlsPolicy: 'tenant_id = public.get_my_tenant_id()',
        softDeleteField: 'deleted_at IS NULL',
        forbiddenDialects: ['runOnJS', 'runOnUI', 'PanGestureHandler', 'React.forwardRef', 'useFormState'],
        tenantIsolationField: 'tenant_id',
      },
    };
    return flow;
  }
}
