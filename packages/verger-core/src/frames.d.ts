import type { FrameStage, FrameStages, FrameState, FrameWindow, GovernorConfig, LeverTarget } from './types';
/** One rendered frame: when it finished and what it cost. `deadlineMs` defaults to the target. */
export interface FrameSample {
    readonly tMs: number;
    readonly durMs: number;
    readonly deadlineMs?: number;
    readonly stages?: FrameStages;
}
/**
 * Groups frames into fixed windows. Windows with no frames are not produced: an idle screen
 * yields nothing, which is itself the signal that nothing is drawing.
 *
 * This is the reference specification of the native estimator's windowing; the Kotlin
 * implementation must produce the same windows from the same samples (golden vectors).
 */
export declare function aggregateFrames(samples: readonly FrameSample[], windowMs: number, targetMs: number): FrameWindow[];
/** Judges one window. Too few frames says nothing about cost, so it is `quiet`. */
export declare function classifyFrameWindow(window: FrameWindow, config: GovernorConfig): FrameState;
/**
 * Which windows the native sensor forwards to JavaScript. Calm and quiet windows only matter
 * when they end a run of stressed or near-budget ones, so repeats are dropped: an animation
 * running comfortably costs no bridge traffic at all. The governor reaches the same decisions
 * from the filtered stream (see the equivalence test).
 */
export declare function shouldForwardWindow(state: FrameState, previousForwarded: FrameState | null): boolean;
/** Missed vsyncs recovered from a window: droppedRatio = missed / (frames + missed). */
export declare function missedVsyncs(window: FrameWindow): number;
/** Frames per second drawn in a window. */
export declare function frameRate(window: FrameWindow): number;
/** The stage that cost most on average, or null when the window carries no stages. */
export declare function frameBottleneck(window: FrameWindow): FrameStage | null;
/**
 * Which lever targets relieve a bottleneck. GPU-bound frames shed GPU work (blur, glass,
 * shaders); every other stage is CPU time on the main or render thread, or main-thread work
 * delaying the frame. Unknown attribution relieves both.
 */
export declare function bottleneckTargets(stage: FrameStage | null, gpuKnown?: boolean): readonly LeverTarget[];
/** Whether the window's stages include a measured GPU time. */
export declare function gpuMeasured(window: FrameWindow): boolean;
//# sourceMappingURL=frames.d.ts.map