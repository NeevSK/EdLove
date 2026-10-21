package expo.modules.runtimesense

import android.app.Activity
import android.app.ActivityManager
import android.content.BroadcastReceiver
import android.content.ComponentCallbacks2
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.res.Configuration
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.PowerManager
import android.os.Process
import android.system.Os
import android.system.OsConstants
import android.view.FrameMetrics
import android.view.Window
import android.view.WindowManager
import java.io.RandomAccessFile
import java.lang.ref.WeakReference

/** Where sensed facts go. The Expo module forwards them to JavaScript; tests can record them. */
interface SenseEmitter {
  fun emit(name: String, body: Map<String, Any?>)
}

/** Settings sent from JavaScript at start; every threshold has one source, the TS config. */
data class SenseConfig(
  val windowMs: Double,
  val classification: FrameClassification,
  val headroomWarm: Double,
)

/**
 * The sensing half of the adaptive runtime. It measures and reports; it never decides. All
 * work runs on one low-priority thread, frames are folded into windows there without
 * allocation, and only changes cross to JavaScript:
 *
 * - frames: FrameMetrics per frame, windowed by [FrameWindowEstimator]; calm repeats dropped.
 * - thermal: the status listener (API 29), plus ADPF headroom (API 30) polled no faster than
 *   the platform allows, and slower while the device is cool.
 * - memory: `onTrimMemory` / `onLowMemory`. From API 34 the system only delivers the
 *   background levels to apps, so on current devices this mostly reports pressure while hidden.
 * - power: the battery-saver broadcast.
 * - threads: CPU time per role (main, JS, render, GC, ...) from procfs at 1 Hz, so stress is
 *   attributed to the thread that causes it, whatever code runs there.
 * - memory: free system memory and the low-memory flag every 10 s, and this process's
 *   resident size, because trims alone are withheld from foreground apps on API 34+.
 *
 * It also carries the hardware levers ([HardwareLevers]): a refresh-rate cap and an ADPF
 * performance-hint session. They act on the whole app, regardless of how components are written.
 *
 * Sensors run only between [start] and [stop], and pause while the activity is in the
 * background, so an idle or hidden app costs one parked thread.
 */
class RuntimeSense(
  context: Context,
  private val emitter: SenseEmitter,
  private val currentActivity: () -> Activity?,
) {
  private val app = context.applicationContext
  private val activityManager = app.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
  private val levers = HardwareLevers(currentActivity)
  private val threads = ThreadCpuSampler(clockTicksPerSecond = clockTicks())
  private val lastThreadCores = DoubleArray(ThreadRole.values().size) { Double.NaN }
  private var lastAvailMb = Double.NaN
  private var lastLowMemory = false
  private var cpuBoostWanted = false
  private val power = app.getSystemService(Context.POWER_SERVICE) as PowerManager
  private val thread = HandlerThread("RuntimeSense", Process.THREAD_PRIORITY_BACKGROUND).apply { start() }
  private val handler = Handler(thread.looper)
  private val originNs = System.nanoTime()

  private var config: SenseConfig? = null
  private var estimator: FrameWindowEstimator? = null
  private var window: WeakReference<Window>? = null
  private var foreground = true
  private var flushPending = false

  private var thermalStatus = -1
  private var headroom: Double? = null
  private var headroomProbed = false

  @Volatile private var totalsFrames = 0L
  @Volatile private var totalsMissed = 0L
  @Volatile private var totalsCostMs = 0.0

  /** Facts that do not change while the process lives. Read once by JavaScript. */
  fun capacity(activity: Activity?): Map<String, Any?> {
    val am = activityManager
    val memory = ActivityManager.MemoryInfo().also { am.getMemoryInfo(it) }
    return mapOf(
      "totalMemoryBytes" to memory.totalMem.toDouble(),
      "isLowRamDevice" to am.isLowRamDevice,
      "memoryClassMb" to am.memoryClass,
      "sdkInt" to Build.VERSION.SDK_INT,
      "cpuCores" to Runtime.getRuntime().availableProcessors(),
      "refreshRateHz" to refreshRate(activity)?.toDouble(),
      "supportsRenderEffect" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S),
      "supportsRuntimeShader" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU),
      "supportsThermalHeadroom" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R),
      "supportsFrameDeadline" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S),
      "supportsGpuDuration" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S),
      "supportsCpuHints" to levers.supportsCpuHints,
      "refreshRatesHz" to levers.displayRates().map { it.toDouble() },
      "largeMemoryClassMb" to am.largeMemoryClass,
    )
  }

  /** Starts sensing (idempotent; a second call replaces the config). */
  fun start(next: SenseConfig, activity: Activity?) {
    handler.post {
      val wasRunning = config != null
      config = next
      estimator?.close()
      estimator = FrameWindowEstimator(next.windowMs, next.classification, ::onWindow).also {
        refreshRate(activity)?.let { hz -> if (hz > 0f) it.defaultTargetMs = 1000.0 / hz }
      }
      if (!wasRunning) {
        app.registerComponentCallbacks(memoryCallbacks)
        val filter = IntentFilter(PowerManager.ACTION_POWER_SAVE_MODE_CHANGED)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          app.registerReceiver(powerReceiver, filter, null, handler, Context.RECEIVER_NOT_EXPORTED)
        } else {
          app.registerReceiver(powerReceiver, filter, null, handler)
        }
        emitPower()
      }
      if (foreground) resume(activity)
    }
  }

  fun stop() {
    handler.post {
      if (config == null) return@post
      pause()
      runCatching { app.unregisterComponentCallbacks(memoryCallbacks) }
      runCatching { app.unregisterReceiver(powerReceiver) }
      config = null
      estimator = null
    }
  }

  fun onForeground(activity: Activity?) {
    handler.post {
      foreground = true
      if (config != null) resume(activity)
    }
  }

  fun onBackground() {
    handler.post {
      foreground = false
      if (config != null) pause()
    }
  }

  fun destroy() {
    stop()
    handler.post { thread.quitSafely() }
  }

  /** Cumulative frame totals since start, for a periodic telemetry summary pulled by JS. */
  fun totals(): Map<String, Any?> = mapOf(
    "frames" to totalsFrames.toDouble(),
    "missedVsyncs" to totalsMissed.toDouble(),
    "costMs" to totalsCostMs,
  )

  // region levers

  /** Caps the display refresh rate; null releases it. Reported back as an `onLever` event. */
  fun setRefreshCap(hz: Double?) {
    handler.post {
      val modeId = levers.setRefreshCap(hz?.toFloat())
      emitter.emit(EVENT_LEVER, mapOf("lever" to "refresh-cap", "requested" to hz, "applied" to (modeId != 0 || hz == null), "modeId" to modeId))
    }
  }

  /** Opens or closes the ADPF hint session for the UI and render threads. */
  fun setCpuBoost(enabled: Boolean) {
    handler.post {
      cpuBoostWanted = enabled
      val open = levers.setCpuBoost(enabled && foreground, estimator?.defaultTargetMs ?: 16.667)
      emitter.emit(EVENT_LEVER, mapOf("lever" to "cpu-boost", "requested" to enabled, "applied" to open))
    }
  }

  // endregion

  // region lifecycle

  private fun resume(activity: Activity?) {
    attachFrames(activity)
    estimator?.resetForwarding()
    attachThermal()
    lastThreadCores.fill(Double.NaN)
    handler.removeCallbacks(sampleThreads)
    handler.postDelayed(sampleThreads, THREAD_SAMPLE_MS)
    handler.removeCallbacks(pollMemory)
    handler.post(pollMemory)
    levers.reapply()
    if (cpuBoostWanted) levers.setCpuBoost(true, estimator?.defaultTargetMs ?: 16.667)
  }

  private fun pause() {
    detachFrames()
    estimator?.close()
    detachThermal()
    handler.removeCallbacks(sampleThreads)
    handler.removeCallbacks(pollMemory)
    levers.closeSession()
  }

  // endregion

  // region frames

  private val frameListener = Window.OnFrameMetricsAvailableListener { _, metrics, _ ->
    // Delivered on [handler]'s thread.
    val est = estimator ?: return@OnFrameMetricsAvailableListener
    if (metrics.getMetric(FrameMetrics.FIRST_DRAW_FRAME) == 1L) return@OnFrameMetricsAvailableListener
    val durMs = metrics.getMetric(FrameMetrics.TOTAL_DURATION) / 1e6
    val tMs = (metrics.getMetric(FrameMetrics.VSYNC_TIMESTAMP) - originNs) / 1e6
    val modern = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
    val deadlineMs = if (modern) metrics.getMetric(FrameMetrics.DEADLINE) / 1e6 else Double.NaN
    val uiMs = (metrics.getMetric(FrameMetrics.INPUT_HANDLING_DURATION) +
      metrics.getMetric(FrameMetrics.ANIMATION_DURATION) +
      metrics.getMetric(FrameMetrics.LAYOUT_MEASURE_DURATION) +
      metrics.getMetric(FrameMetrics.DRAW_DURATION)) / 1e6
    val renderMs = (metrics.getMetric(FrameMetrics.SYNC_DURATION) +
      metrics.getMetric(FrameMetrics.COMMAND_ISSUE_DURATION) +
      metrics.getMetric(FrameMetrics.SWAP_BUFFERS_DURATION)) / 1e6
    val gpuMs = if (modern) metrics.getMetric(FrameMetrics.GPU_DURATION) / 1e6 else 0.0
    val delayMs = metrics.getMetric(FrameMetrics.UNKNOWN_DELAY_DURATION) / 1e6
    est.addFrame(tMs, durMs, deadlineMs, uiMs, renderMs, gpuMs, delayMs)
    levers.reportFrameWork(uiMs + renderMs)
    totalsFrames = est.totalFrames
    totalsMissed = est.totalMissedVsyncs
    totalsCostMs = est.totalCostMs
    scheduleFlush()
  }

  /**
   * Closes the last window before silence. Metrics arrive a frame or two after the frame, so the
   * flush waits a grace period past the window's end.
   */
  private fun scheduleFlush() {
    if (flushPending) return
    val est = estimator ?: return
    val end = est.openWindowEndMs
    if (end.isNaN()) return
    flushPending = true
    val delay = (end + FLUSH_GRACE_MS - nowMs()).toLong().coerceAtLeast(0)
    handler.postDelayed({
      flushPending = false
      estimator?.let {
        it.tick(nowMs() - FLUSH_GRACE_MS)
        scheduleFlush()
      }
    }, delay)
  }

  private fun onWindow(w: ClosedWindow) {
    if (!w.forward) return
    emitter.emit(
      EVENT_FRAME_WINDOW,
      mapOf(
        "startMs" to w.startMs,
        "endMs" to w.endMs,
        "frames" to w.frames,
        "averageMs" to w.averageMs,
        "targetMs" to w.targetMs,
        "worstMs" to w.worstMs,
        "droppedRatio" to w.droppedRatio,
        "state" to w.state.wire,
        "stages" to if (w.hasStages) {
          mapOf("uiMs" to w.uiMs, "renderMs" to w.renderMs, "gpuMs" to w.gpuMs, "delayMs" to w.delayMs)
        } else {
          null
        },
      ),
    )
  }

  private fun attachFrames(activity: Activity?) {
    val target = activity?.window ?: return
    if (window?.get() === target) return
    detachFrames()
    window = WeakReference(target)
    activity.runOnUiThread {
      runCatching { target.addOnFrameMetricsAvailableListener(frameListener, handler) }
    }
  }

  private fun detachFrames() {
    val target = window?.get()
    window = null
    if (target != null) {
      target.decorView.post { runCatching { target.removeOnFrameMetricsAvailableListener(frameListener) } }
    }
  }

  // endregion

  // region thermal

  private val thermalListener = PowerManager.OnThermalStatusChangedListener { status ->
    handler.post {
      if (status == thermalStatus) return@post
      thermalStatus = status
      emitThermal()
      reschedulePoll()
    }
  }

  private val pollHeadroom = object : Runnable {
    override fun run() {
      if (config == null || !foreground) return
      val next = readHeadroom()
      if (Signals.headroomChanged(headroom, next)) {
        headroom = next
        emitThermal()
      }
      handler.postDelayed(this, pollDelay())
    }
  }

  private fun attachThermal() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      runCatching { power.addThermalStatusListener({ it.run() }, thermalListener) }
      thermalStatus = power.currentThermalStatus
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      if (!headroomProbed) {
        // The first call after process start returns NaN; it primes the platform's history.
        runCatching { power.getThermalHeadroom(HEADROOM_FORECAST_S) }
        headroomProbed = true
      }
      reschedulePoll(initialDelayMs = MIN_POLL_MS)
    }
    emitThermal()
  }

  private fun detachThermal() {
    handler.removeCallbacks(pollHeadroom)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      runCatching { power.removeThermalStatusListener(thermalListener) }
    }
  }

  private fun reschedulePoll(initialDelayMs: Long? = null) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return
    handler.removeCallbacks(pollHeadroom)
    handler.postDelayed(pollHeadroom, initialDelayMs ?: pollDelay())
  }

  private fun pollDelay(): Long =
    Signals.headroomPollDelayMs(thermalStatus, headroom, config?.headroomWarm ?: 0.85)

  private fun readHeadroom(): Double? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return null
    return runCatching { Signals.usableHeadroom(power.getThermalHeadroom(HEADROOM_FORECAST_S)) }.getOrNull()
  }

  private fun emitThermal() {
    emitter.emit(
      EVENT_THERMAL,
      mapOf("status" to Signals.thermalStatus(thermalStatus), "headroom" to headroom),
    )
  }

  // endregion

  // region threads and memory

  private val sampleThreads = object : Runnable {
    override fun run() {
      if (config == null || !foreground) return
      if (threads.sample(nowMs())) emitThreadLoadIfChanged()
      handler.postDelayed(this, THREAD_SAMPLE_MS)
    }
  }

  private fun emitThreadLoadIfChanged() {
    val load = threads.load
    var changed = false
    for (role in ThreadRole.values()) {
      val before = lastThreadCores[role.ordinal]
      val now = load.of(role)
      if (before.isNaN() || kotlin.math.abs(now - before) >= THREAD_CHANGE_CORES) changed = true
    }
    if (!changed) return
    for (role in ThreadRole.values()) lastThreadCores[role.ordinal] = load.of(role)
    val roles = HashMap<String, Double>(ThreadRole.values().size)
    for (role in ThreadRole.values()) roles[role.wire] = load.of(role)
    emitter.emit(
      EVENT_THREAD_LOAD,
      mapOf(
        "intervalMs" to load.intervalMs,
        "processCores" to load.processCores,
        "cores" to roles,
        "topOtherName" to load.topOtherName,
        "topOtherCores" to load.topOtherCores,
        "rssMb" to residentMb(),
      ),
    )
  }

  private val pollMemory = object : Runnable {
    override fun run() {
      if (config == null || !foreground) return
      val info = ActivityManager.MemoryInfo().also { activityManager.getMemoryInfo(it) }
      val availMb = info.availMem / MB
      val moved = lastAvailMb.isNaN() || kotlin.math.abs(availMb - lastAvailMb) >= lastAvailMb * 0.05
      if (moved || info.lowMemory != lastLowMemory) {
        lastAvailMb = availMb
        lastLowMemory = info.lowMemory
        emitter.emit(
          EVENT_MEMORY,
          mapOf(
            "availableMb" to availMb,
            "thresholdMb" to info.threshold / MB,
            "lowMemory" to info.lowMemory,
            "rssMb" to residentMb(),
          ),
        )
      }
      handler.postDelayed(this, MEMORY_POLL_MS)
    }
  }

  /** Resident set size of this process from /proc/self/statm (pages), or NaN. */
  private fun residentMb(): Double = runCatching {
    RandomAccessFile("/proc/self/statm", "r").use { raf ->
      val parts = raf.readLine().split(' ')
      parts[1].toLong() * Os.sysconf(OsConstants._SC_PAGESIZE) / MB
    }
  }.getOrDefault(Double.NaN)

  // endregion

  // region memory and power

  private val memoryCallbacks = object : ComponentCallbacks2 {
    override fun onTrimMemory(level: Int) {
      val severity = Signals.trimSeverity(level) ?: return
      handler.post { emitter.emit(EVENT_MEMORY_TRIM, mapOf("severity" to severity, "level" to level)) }
    }

    @Deprecated("Deprecated in Java")
    override fun onLowMemory() {
      handler.post { emitter.emit(EVENT_MEMORY_TRIM, mapOf("severity" to "critical", "level" to -1)) }
    }

    override fun onConfigurationChanged(newConfig: Configuration) = Unit
  }

  private val powerReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) = emitPower()
  }

  private fun emitPower() {
    emitter.emit(EVENT_POWER_SAVER, mapOf("saver" to power.isPowerSaveMode))
  }

  // endregion

  private fun nowMs(): Double = (System.nanoTime() - originNs) / 1e6

  @Suppress("DEPRECATION")
  private fun refreshRate(activity: Activity?): Float? = runCatching {
    // Application.getDisplay() throws on API 30+, so prefer the activity's display.
    val display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && activity != null) {
      activity.display
    } else {
      (app.getSystemService(Context.WINDOW_SERVICE) as WindowManager).defaultDisplay
    }
    display?.refreshRate
  }.getOrNull()

  companion object {
    const val EVENT_FRAME_WINDOW = "onFrameWindow"
    const val EVENT_THERMAL = "onThermal"
    const val EVENT_MEMORY_TRIM = "onMemoryTrim"
    const val EVENT_POWER_SAVER = "onPowerSaver"
    const val EVENT_THREAD_LOAD = "onThreadLoad"
    const val EVENT_MEMORY = "onMemory"
    const val EVENT_LEVER = "onLever"
    val EVENTS = arrayOf(
      EVENT_FRAME_WINDOW, EVENT_THERMAL, EVENT_MEMORY_TRIM, EVENT_POWER_SAVER,
      EVENT_THREAD_LOAD, EVENT_MEMORY, EVENT_LEVER,
    )

    private const val THREAD_SAMPLE_MS = 1_000L
    private const val THREAD_CHANGE_CORES = 0.1
    private const val MEMORY_POLL_MS = 10_000L
    private const val MB = 1024.0 * 1024.0

    private fun clockTicks(): Long =
      runCatching { Os.sysconf(OsConstants._SC_CLK_TCK) }.getOrDefault(100L).takeIf { it > 0 } ?: 100L

    private const val FLUSH_GRACE_MS = 120.0
    private const val MIN_POLL_MS = 10_000L
    private const val HEADROOM_FORECAST_S = 10
  }
}
