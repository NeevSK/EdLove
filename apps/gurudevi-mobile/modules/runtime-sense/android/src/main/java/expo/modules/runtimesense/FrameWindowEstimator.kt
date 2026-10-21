package expo.modules.runtimesense

import kotlin.math.floor

/**
 * Frame classification thresholds. Values come from JavaScript (`DEFAULT_GOVERNOR_CONFIG` in
 * `@repo/core/governor`) so the native side never holds its own copy of a tunable.
 */
data class FrameClassification(
  val minSamples: Int,
  val stressRatio: Double,
  val stressDroppedRatio: Double,
  val comfortRatio: Double,
  val comfortDroppedRatio: Double,
)

enum class FrameState(val wire: String) {
  QUIET("quiet"),
  CALM("calm"),
  NEUTRAL("neutral"),
  STRESSED("stressed"),
}

/**
 * One closed window. The estimator reuses a single instance for every emission, so a listener
 * must copy what it keeps; nothing is allocated per frame or per window.
 */
class ClosedWindow {
  var startMs = 0.0
    internal set
  var endMs = 0.0
    internal set
  var frames = 0
    internal set
  var averageMs = 0.0
    internal set
  var targetMs = 0.0
    internal set
  var worstMs = 0.0
    internal set
  var droppedRatio = 0.0
    internal set
  /** Mean stage costs; NaN when no frame in the window reported stages. */
  var uiMs = Double.NaN
    internal set
  var renderMs = Double.NaN
    internal set
  var gpuMs = Double.NaN
    internal set
  var delayMs = Double.NaN
    internal set
  val hasStages: Boolean
    get() = !uiMs.isNaN()
  var state = FrameState.QUIET
    internal set
  /** Whether the window should cross the bridge (see [FrameWindowEstimator.shouldForward]). */
  var forward = false
    internal set
}

fun interface WindowListener {
  fun onWindow(window: ClosedWindow)
}

/**
 * Online windowing of rendered frames, specified by `aggregateFrames`, `classifyFrameWindow` and
 * `shouldForwardWindow` in `packages/core/src/governor/frames.ts`. Both implementations are held
 * to the same golden vectors (`__fixtures__/a52-self-idle.expected.json`).
 *
 * Windows are aligned to multiples of [windowMs] on the sensor's own timeline. Windows without
 * frames are never produced, so an idle screen costs nothing. Not thread safe: feed it from the
 * one thread that receives frame metrics.
 */
class FrameWindowEstimator(
  private val windowMs: Double,
  private val classification: FrameClassification,
  private val listener: WindowListener,
) {
  /** Deadline used when a frame does not report its own (pre Android 12). */
  var defaultTargetMs: Double = 1000.0 / 60.0

  private val out = ClosedWindow()
  private var open = false
  private var start = 0.0
  private var frames = 0
  private var sum = 0.0
  private var deadlineSum = 0.0
  private var worst = 0.0
  private var missed = 0L
  private var stageFrames = 0
  private var ui = 0.0
  private var render = 0.0
  private var gpu = 0.0
  private var delay = 0.0
  private var previousForwarded: FrameState? = null

  /** Running totals since [start]; cheap to read for a periodic heartbeat. */
  var totalFrames = 0L
    private set
  var totalMissedVsyncs = 0L
    private set
  var totalCostMs = 0.0
    private set

  init {
    require(windowMs > 0) { "windowMs must be positive" }
  }

  /** Where the open window ends, or NaN when no window is open. Used to schedule a flush. */
  val openWindowEndMs: Double
    get() = if (open) start + windowMs else Double.NaN

  /**
   * Adds one frame that finished at [tMs] and cost [durMs]. Pass NaN for [deadlineMs] when the
   * platform does not report a per-frame deadline.
   */
  fun addFrame(tMs: Double, durMs: Double, deadlineMs: Double) =
    addFrame(tMs, durMs, deadlineMs, Double.NaN, Double.NaN, Double.NaN, Double.NaN)

  /**
   * Adds a frame with its pipeline stages (see `FrameStages` in the TS reference). Pass NaN for
   * [uiMs] when stages are unknown; [gpuMs] may be 0 where the platform does not report it.
   */
  fun addFrame(
    tMs: Double,
    durMs: Double,
    deadlineMs: Double,
    uiMs: Double,
    renderMs: Double,
    gpuMs: Double,
    delayMs: Double,
  ) {
    if (!open) {
      start = floor(tMs / windowMs) * windowMs
      open = true
    }
    while (tMs >= start + windowMs) {
      emit(start + windowMs)
      start += windowMs
      reset()
    }
    val deadline = if (deadlineMs.isNaN()) defaultTargetMs else deadlineMs
    frames += 1
    sum += durMs
    deadlineSum += deadline
    if (durMs > worst) worst = durMs
    if (deadline > 0 && durMs > deadline) {
      val m = floor((durMs - 1e-9) / deadline).toLong()
      missed += m
      totalMissedVsyncs += m
    }
    if (!uiMs.isNaN()) {
      stageFrames += 1
      ui += uiMs
      render += renderMs
      gpu += gpuMs
      delay += delayMs
    }
    totalFrames += 1
    totalCostMs += durMs
  }

  /**
   * Closes the open window if [nowMs] is past its end. Called from a timer so the last window
   * before silence is reported without waiting for the next frame. Equivalent to the reference:
   * the next frame realigns to the same grid, and empty windows are never produced either way.
   */
  fun tick(nowMs: Double) {
    if (open && nowMs >= start + windowMs) close()
  }

  /** Closes the open window now (on stop or when the app leaves the foreground). */
  fun close() {
    if (!open) return
    emit(start + windowMs)
    reset()
    open = false
  }

  /** Forgets forwarding history, so the next window always crosses the bridge. */
  fun resetForwarding() {
    previousForwarded = null
  }

  private fun reset() {
    frames = 0
    sum = 0.0
    deadlineSum = 0.0
    worst = 0.0
    missed = 0
    stageFrames = 0
    ui = 0.0
    render = 0.0
    gpu = 0.0
    delay = 0.0
  }

  private fun emit(end: Double) {
    if (frames == 0) return
    out.startMs = start
    out.endMs = end
    out.frames = frames
    out.averageMs = sum / frames
    out.targetMs = deadlineSum / frames
    out.worstMs = worst
    out.droppedRatio = missed.toDouble() / (frames + missed).toDouble()
    if (stageFrames > 0) {
      out.uiMs = ui / stageFrames
      out.renderMs = render / stageFrames
      out.gpuMs = gpu / stageFrames
      out.delayMs = delay / stageFrames
    } else {
      out.uiMs = Double.NaN
      out.renderMs = Double.NaN
      out.gpuMs = Double.NaN
      out.delayMs = Double.NaN
    }
    out.state = classify(out.frames, out.averageMs, out.targetMs, out.droppedRatio, classification)
    out.forward = shouldForward(out.state, previousForwarded)
    if (out.forward) previousForwarded = out.state
    listener.onWindow(out)
  }

  companion object {
    @JvmStatic
    fun classify(
      frames: Int,
      averageMs: Double,
      targetMs: Double,
      droppedRatio: Double,
      c: FrameClassification,
    ): FrameState {
      if (frames < c.minSamples || targetMs <= 0) return FrameState.QUIET
      val ratio = averageMs / targetMs
      if (ratio > c.stressRatio || droppedRatio > c.stressDroppedRatio) return FrameState.STRESSED
      if (ratio < c.comfortRatio && droppedRatio < c.comfortDroppedRatio) return FrameState.CALM
      return FrameState.NEUTRAL
    }

    /** Stressed and neutral windows always cross; calm and quiet only when the state changes. */
    @JvmStatic
    fun shouldForward(state: FrameState, previousForwarded: FrameState?): Boolean {
      if (state == FrameState.STRESSED || state == FrameState.NEUTRAL) return true
      return state != previousForwarded
    }
  }
}
