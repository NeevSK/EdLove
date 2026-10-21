package expo.modules.runtimesense

import android.app.Activity
import android.os.Build
import android.os.PerformanceHintManager
import android.os.Process
import android.view.Display
import java.io.File

/**
 * Levers that act on the hardware for the whole app. They are actuators: they do what the
 * JavaScript allocator says and report what they could do, nothing more.
 */
class HardwareLevers(private val activity: () -> Activity?) {
  // region refresh cap

  private var capHz: Float? = null

  /** Display modes at the current resolution, for capacity facts and diagnostics. */
  fun displayRates(): List<Float> {
    val display = currentDisplay() ?: return emptyList()
    return DisplayModes.ratesAtResolution(display.supportedModes.map(::spec), spec(display.mode))
  }

  /**
   * Caps the refresh rate (null releases the cap). Applied on the UI thread through the
   * window's preferred display mode (API 23+). Returns the mode id requested, 0 for none.
   */
  fun setRefreshCap(hz: Float?): Int {
    capHz = hz
    val act = activity() ?: return 0
    val display = currentDisplay() ?: return 0
    val id = DisplayModes.modeIdForCap(display.supportedModes.map(::spec), spec(display.mode), hz)
    act.runOnUiThread {
      val window = act.window ?: return@runOnUiThread
      val attrs = window.attributes
      if (attrs.preferredDisplayModeId != id) {
        attrs.preferredDisplayModeId = id
        window.attributes = attrs
      }
    }
    return id
  }

  /** Re-applies the cap to a new activity (after recreation). */
  fun reapply() {
    capHz?.let { setRefreshCap(it) }
  }

  @Suppress("DEPRECATION")
  private fun currentDisplay(): Display? = runCatching {
    val act = activity() ?: return null
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) act.display else act.windowManager.defaultDisplay
  }.getOrNull()

  private fun spec(mode: Display.Mode) =
    DisplayModeSpec(mode.modeId, mode.physicalWidth, mode.physicalHeight, mode.refreshRate)

  // endregion

  // region CPU boost through ADPF performance hints

  private var session: PerformanceHintManager.Session? = null
  private var targetNs = 0L

  /** Whether the platform offers performance hint sessions (API 31+, and a manager present). */
  val supportsCpuHints: Boolean
    get() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && hintManager() != null

  /**
   * Opens or closes a hint session over the UI thread and the render thread. While open, each
   * frame's measured CPU work is reported against the frame deadline, so the scheduler can
   * raise clocks or move the threads to faster cores before a frame is missed, and lower them
   * when work is light. Returns whether a session is open.
   */
  fun setCpuBoost(enabled: Boolean, frameDeadlineMs: Double): Boolean {
    if (!enabled) {
      closeSession()
      return false
    }
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return false
    val target = (frameDeadlineMs * 1e6).toLong().coerceAtLeast(1_000_000L)
    session?.let {
      if (target != targetNs) {
        runCatching { it.updateTargetWorkDuration(target) }
        targetNs = target
      }
      return true
    }
    val manager = hintManager() ?: return false
    val tids = hintThreads()
    if (tids.isEmpty()) return false
    session = runCatching { manager.createHintSession(tids, target) }.getOrNull()
    targetNs = target
    return session != null
  }

  /** Reports one frame's CPU work (UI and render stages) to the open session, if any. */
  fun reportFrameWork(cpuWorkMs: Double) {
    val s = session ?: return
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || cpuWorkMs.isNaN() || cpuWorkMs <= 0) return
    runCatching { s.reportActualWorkDuration((cpuWorkMs * 1e6).toLong()) }
  }

  fun closeSession() {
    session?.let { runCatching { it.close() } }
    session = null
  }

  private fun hintManager(): PerformanceHintManager? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return null
    val act = activity() ?: return null
    return act.getSystemService(PerformanceHintManager::class.java)
  }

  /** The main thread (tid = pid) and the render thread, found by name in procfs. */
  private fun hintThreads(): IntArray {
    val pid = Process.myPid()
    val tids = mutableListOf(pid)
    File("/proc/self/task").list()?.forEach { name ->
      val tid = name.toIntOrNull() ?: return@forEach
      val comm = runCatching { File("/proc/self/task/$name/comm").readText().trim() }.getOrNull()
      if (comm == "RenderThread") tids += tid
    }
    return tids.toIntArray()
  }

  // endregion
}
