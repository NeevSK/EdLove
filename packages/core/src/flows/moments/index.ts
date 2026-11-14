// Moments: offers that carry the learning loops into work people already do. Pure; the caller
// opens each offer through the flow navigator. See docs/architecture/domains/wellbeing/growth.md.
export { LEARNING_MOMENT_RULES } from './learningMoments';
export {
  type Audience,
  DEFAULT_MOMENTS_POLICY,
  type Decision,
  decideMoment,
  emptyMomentsState,
  type LocalNow,
  type MomentEvent,
  type MomentOffer,
  type MomentRule,
  type MomentSignal,
  type MomentsPolicy,
  type MomentsState,
  type Outcome,
  pruneMoments,
  recordMoment,
  type SkipReason,
  setRuleOff,
} from './moments';
