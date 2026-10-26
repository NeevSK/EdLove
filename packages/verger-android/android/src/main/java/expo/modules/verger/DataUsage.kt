package expo.modules.verger

/**
 * This app's bytes for the data budget (B3.1). `TrafficStats.getUidRxBytes` and `getUidTxBytes`
 * for the app's own UID count every interface (Wi-Fi too) and increase monotonically since boot;
 * either may be `TrafficStats.UNSUPPORTED` (-1). Pure, so it is tested on the desktop JVM and held
 * to `contract/native-events.json`. The day's ledger, reboots and the allowance are JavaScript's
 * (`foldDataSample` in verger-core); this only decides when a sample is worth sending.
 */
object DataUsageSignals {
  const val UNSUPPORTED = -1L

  /** Received plus sent, or [UNSUPPORTED] when the platform does not count either. */
  @JvmStatic
  fun totalBytes(rxBytes: Long, txBytes: Long): Long =
    if (rxBytes < 0 || txBytes < 0) UNSUPPORTED else rxBytes + txBytes

  // JavaScript has one number type; a Double holds byte counts exactly up to 2^53.
  @JvmStatic
  fun payload(totalBytes: Long): Map<String, Any?> = mapOf("totalBytes" to totalBytes.toDouble())
}

/**
 * Sends a sample when the total crosses a [bucketBytes] boundary since the last one sent, and at
 * least every [heartbeatMs] while counting, so a new local day is noticed without new traffic.
 * An unsupported counter is never sent.
 */
class DataUsageReporter(private val bucketBytes: Long, private val heartbeatMs: Double) {
  private var lastBucket = Long.MIN_VALUE
  private var lastSentMs = Double.NEGATIVE_INFINITY

  fun shouldSend(totalBytes: Long, nowMs: Double): Boolean {
    if (totalBytes < 0) return false
    val bucket = totalBytes / bucketBytes
    // A reboot lowers the total: a different bucket either way, so it is sent.
    if (bucket == lastBucket && nowMs - lastSentMs < heartbeatMs) return false
    lastBucket = bucket
    lastSentMs = nowMs
    return true
  }

  companion object {
    const val BUCKET_BYTES = 512L * 1024L
    const val HEARTBEAT_MS = 5.0 * 60_000.0
  }
}
