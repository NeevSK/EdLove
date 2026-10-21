package expo.modules.verger

import android.app.Activity
import android.content.Context
import android.hardware.display.DisplayManager
import android.os.Build
import android.os.PerformanceHintManager
import android.os.Process
import android.view.Display
import java.io.File

/**
 * Levers that act on the hardware for the whole app. They are actuators: they do what the
 * JavaScript allocator says and report what they could do, nothing more. Every platform call
 * is guarded: an actuator that fails must never take the app down.
 *
 * Threading: the hint session is touched only from the sensor's handler thread; window
 * attributes only on the UI thread.
 */
class HardwareLevers(context: Context, private val activity: () -> Activity?) {
  private val app = context.applicationContext
  private val displays = app.getSystemService(Context.DISPLAY_SERVICE) as DisplayManager

  // region refresh cap

  private var capHz: Float? = null

  /** The default display, readable without an activity (unlike `Activity.getDisplay`). */
  private fun defaultDisplay(): Display? = runCatching { displays.getDisplay(Display.DEFAULT_DISPLAY) }.getOrNull()

  /** Refresh rates offered at the current resolution, ascending. */
  fun displayRates(): List<Float> {
    val display = defaultDisplay() ?: return emptyList()
    return runCatching { DisplayModes.ratesAtResolution(display.supportedModes.map(::spec), spec(display.mode)) }
      .getOrDefault(emptyList())
  }

  /** The rate the display runs at now (changes with the cap and with OEM adaptive refresh). */
  fun currentRefreshHz(): Float? = runCatching { defaultDisplay()?.refreshRate }.getOrNull()?.takeIf { it > 0f }

  /**
   * Caps the refresh rate (null releases it) through the window's preferred display mode
   * (API 23+), on the UI thread. Returns the mode id requested, 0 for none. The OS and the
   * vendor may still override the request (power saving, thermal, the user's peak-rate
   * setting); `currentRefreshHz` tells what actually happened.
   */
  fun setRefreshCap(hz: Float?): Int {
    capHz = hz
    val display = defaultDisplay()
    val id = if (display == null) {
      0
    } else {
      runCatching { DisplayModes.modeIdForCap(display.supportedModes.map(::spec), spec(display.mode), hz) }.getOrDefault(0)
    }
    applyModeId(id)
    return id
  }

  /** Re-applies the cap to a new activity (after recreation). */
  fun reapply() {
    capHz?.let { setRefreshCap(it) }
  }

  /** Hands the display back to the system: on stop, destroy and JS reload. */
  fun releaseRefresh() {
    capHz = null
    applyModeId(0)
  }

  private fun applyModeId(id: Int) {
    val act = activity() ?: return
    act.runOnUiThread {
      runCatching {
        val window = act.window ?: return@runCatching
        val attrs = window.attributes
        if (attrs.preferredDisplayModeId != id) {
          attrs.preferredDisplayModeId = id
          window.attributes = attrs
        }
      }
    }
  }

  private fun spec(mode: Display.Mode) =
    DisplayModeSpec(mode.modeId, mode.physicalWidth, mode.physicalHeight, mode.refreshRate)

  // endregion

  // region CPU boost through ADPF performance hints

  private var session: PerformanceHintManager.Session? = null
  private var targetNs = 0L
  private var boosting = false

  /**
   * Whether hint sessions work here: API 31+, a manager, and a supported update rate (the
   * platform reports -1 when hints are unsupported).
   */
  val supportsCpuHints: Boolean
    get() {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return false
      val manager = hintManager() ?: return false
      return runCatching { manager.preferredUpdateRateNanos > 0 }.getOrDefault(false)
    }

  /**
   * Turns the boost on or off. One session is kept for the process: creating one costs a
   * binder call and a procfs scan, so on/off only starts and stops reporting (and, on API 35+,
   * tells the scheduler to prefer efficiency while off). Returns whether boosting is on.
   */
  fun setCpuBoost(enabled: Boolean, frameDeadlineMs: Double): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return false
    if (!enabled) {
      boosting = false
      session?.let { s -> preferEfficiency(s, true) }
      return false
    }
    val target = (frameDeadlineMs * 1e6).toLong().coerceAtLeast(1_000_000L)
    val s = session ?: openSession(target) ?: return false
    if (target != targetNs) {
      runCatching { s.updateTargetWorkDuration(target) }
      targetNs = target
    }
    preferEfficiency(s, false)
    boosting = true
    return true
  }

  /**
   * Reports one frame's CPU work. The UI and render threads run in a pipeline, so a frame's
   * critical path is the longer of the two stages, not their sum; reporting the sum would
   * read as overload and over-boost a weak phone.
   */
  fun reportFrameWork(uiMs: Double, renderMs: Double) {
    val s = session ?: return
    if (!boosting || Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    val workMs = maxOf(uiMs, renderMs)
    if (!workMs.isFinite() || workMs <= 0) return
    runCatching { s.reportActualWorkDuration((workMs * 1e6).toLong()) }
  }

  fun closeSession() {
    boosting = false
    session?.let { runCatching { it.close() } }
    session = null
  }

  private fun openSession(target: Long): PerformanceHintManager.Session? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return null
    val manager = hintManager() ?: return null
    val tids = hintThreads()
    if (tids.isEmpty()) return null
    session = runCatching { manager.createHintSession(tids, target) }.getOrNull()
    targetNs = target
    return session
  }

  private fun preferEfficiency(s: PerformanceHintManager.Session, prefer: Boolean) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.VANILLA_ICE_CREAM) {
      runCatching { s.setPreferPowerEfficiency(prefer) }
    }
  }

  private fun hintManager(): PerformanceHintManager? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return null
    return runCatching { app.getSystemService(PerformanceHintManager::class.java) }.getOrNull()
  }

  /** The main thread (tid = pid) and the render thread, found by name in procfs. */
  private fun hintThreads(): IntArray {
    val pid = Process.myPid()
    val tids = mutableListOf(pid)
    runCatching {
      File("/proc/self/task").list()?.forEach { name ->
        val tid = name.toIntOrNull() ?: return@forEach
        val comm = runCatching { File("/proc/self/task/$name/comm").readText().trim() }.getOrNull()
        if (comm == "RenderThread") tids += tid
      }
    }
    return tids.toIntArray()
  }

  // endregion
}
