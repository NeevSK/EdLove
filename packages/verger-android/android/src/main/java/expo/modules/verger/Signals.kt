package expo.modules.verger

/**
 * Pure mappings from Android constants to verger's vocabulary. Kept free of Android
 * imports so they are tested on the desktop JVM alongside the estimator.
 */
object Signals {
  // ComponentCallbacks2 levels, inlined so this file needs no android.jar.
  private const val TRIM_MEMORY_RUNNING_MODERATE = 5
  private const val TRIM_MEMORY_RUNNING_LOW = 10
  private const val TRIM_MEMORY_RUNNING_CRITICAL = 15
  private const val TRIM_MEMORY_UI_HIDDEN = 20
  private const val TRIM_MEMORY_BACKGROUND = 40
  private const val TRIM_MEMORY_MODERATE = 60
  private const val TRIM_MEMORY_COMPLETE = 80

  /**
   * `onTrimMemory` level to verger's `TrimSeverity`, or null when the level says nothing
   * about memory (UI_HIDDEN is visibility, reported through app state instead).
   */
  @JvmStatic
  fun trimSeverity(level: Int): String? = when {
    level == TRIM_MEMORY_UI_HIDDEN -> null
    level >= TRIM_MEMORY_COMPLETE -> "critical"
    level >= TRIM_MEMORY_MODERATE -> "low"
    level >= TRIM_MEMORY_BACKGROUND -> "moderate"
    level >= TRIM_MEMORY_RUNNING_CRITICAL -> "critical"
    level >= TRIM_MEMORY_RUNNING_LOW -> "low"
    level >= TRIM_MEMORY_RUNNING_MODERATE -> "moderate"
    else -> null
  }

  /** `PowerManager.THERMAL_STATUS_*` (0..6) to verger's `ThermalStatus`. */
  @JvmStatic
  fun thermalStatus(status: Int): String? = when (status) {
    0 -> "none"
    1 -> "light"
    2 -> "moderate"
    3 -> "severe"
    4 -> "critical"
    5 -> "emergency"
    6 -> "shutdown"
    else -> null
  }

  /**
   * ADPF headroom is only meaningful as a finite value; 0 and NaN mean "not available yet"
   * (the first call after boot returns NaN, and some devices return 0 permanently).
   */
  @JvmStatic
  fun usableHeadroom(value: Float): Double? =
    if (value.isNaN() || value <= 0f || value.isInfinite()) null else value.toDouble()

  /**
   * How long to wait before the next headroom poll. The platform throttles callers that poll
   * faster than once per ten seconds, and on a cool device there is nothing to learn, so polling
   * slows to a minute until status rises or headroom approaches the warm band.
   */
  @JvmStatic
  fun headroomPollDelayMs(status: Int, lastHeadroom: Double?, warmThreshold: Double): Long {
    val engaged = status > 0 || (lastHeadroom != null && lastHeadroom >= warmThreshold - 0.15)
    return if (engaged) 10_000L else 60_000L
  }

  /** Whether a headroom change is worth a bridge event. */
  @JvmStatic
  fun headroomChanged(previous: Double?, next: Double?): Boolean {
    if (previous == null || next == null) return previous != next
    return kotlin.math.abs(previous - next) >= 0.02
  }
}
