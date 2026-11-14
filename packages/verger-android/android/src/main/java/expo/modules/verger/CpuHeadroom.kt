package expo.modules.verger

/**
 * The device's CPU headroom (API 36, `SystemHealthManager.getCpuHeadroom`; R11) as contention
 * evidence: how much CPU the system could still grant, 0 to 100. Pure: the adapter hands it a
 * reader; this decides what to report.
 *
 * Per the platform source (android16-release): the call is a binder transaction of a millisecond
 * or more, so it runs on the sense thread, never a critical one; it returns NaN while unavailable
 * ("server error or not enough user CPU workload"), cached values when called faster than
 * `getCpuHeadroomMinIntervalMillis`, and throws `UnsupportedOperationException` where the device
 * has no headroom support.
 *
 * NaN and errors are reported as no reading (null), never as the last value: a stale "busy" must
 * not outlive its evidence. Unsupported stops reading for the session.
 */
class CpuHeadroomPoller(private val busyPercent: Double, platformMinIntervalMs: Long) {
  /** How often to read: never faster than the platform's own minimum, nor than [POLL_MS]. */
  val intervalMs: Long = maxOf(platformMinIntervalMs, POLL_MS)

  var supported = true
    private set

  /** The last reported headroom, null while there is no reading. */
  var percent: Double? = null
    private set
  private var reported = false

  /** Reads once; true when the reading should be reported (first, null-ness, a move, a crossing). */
  fun read(reader: () -> Float): Boolean {
    if (!supported) return false
    val next: Double? = try {
      usable(reader())
    } catch (e: UnsupportedOperationException) {
      supported = false
      null
    } catch (e: RuntimeException) {
      null
    }
    val before = percent
    val changed = when {
      !reported -> next != null || !supported
      (next == null) != (before == null) -> true
      next == null || before == null -> false
      else -> kotlin.math.abs(next - before) >= CHANGE_PERCENT || (next < busyPercent) != (before < busyPercent)
    }
    if (!changed) return false
    percent = next
    reported = true
    return true
  }

  companion object {
    const val POLL_MS = 5_000L
    /** Moves smaller than this are not reported, unless they cross [busyPercent]. */
    const val CHANGE_PERCENT = 5.0

    fun usable(raw: Float): Double? =
      if (raw.isNaN() || raw < 0f || raw > 100f) null else raw.toDouble()
  }
}
