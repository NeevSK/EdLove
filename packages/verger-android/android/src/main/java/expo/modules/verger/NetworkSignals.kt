package expo.modules.verger

/**
 * Pure mappings for the network sensor: Android's capability flags and Data Saver status to
 * verger's vocabulary, and the payload that crosses to JavaScript. Kept free of Android imports
 * so it is tested on the desktop JVM, and held to the shared contract fixtures in
 * `packages/verger-android/contract/native-events.json`.
 */
object NetworkSignals {
  /** The transport the network uses, in order of what matters for cost: Wi-Fi, then cellular. */
  @JvmStatic
  fun transport(present: Boolean, wifi: Boolean, cellular: Boolean, ethernet: Boolean): String = when {
    !present -> "none"
    wifi -> "wifi"
    cellular -> "cellular"
    ethernet -> "ethernet"
    else -> "other"
  }

  /**
   * `ConnectivityManager.getRestrictBackgroundStatus` to verger's names. The platform's constants
   * are passed in by the caller, so this file holds no copy of them.
   */
  @JvmStatic
  fun dataSaver(status: Int, disabled: Int, allowlisted: Int, enabled: Int): String? = when (status) {
    disabled -> "disabled"
    allowlisted -> "allowlisted"
    enabled -> "enabled"
    else -> null
  }

  /**
   * The downstream estimate rounded down to a power of two: the platform's estimate moves
   * constantly, and only a change of bucket is worth waking JavaScript. Unknown (0 or less) is null.
   */
  @JvmStatic
  fun bucketKbps(kbps: Int): Int? = if (kbps <= 0) null else Integer.highestOneBit(kbps)

  @JvmStatic
  fun payload(
    transport: String,
    validated: Boolean?,
    metered: Boolean?,
    downKbps: Int?,
    dataSaver: String?,
  ): Map<String, Any?> = mapOf(
    "transport" to transport,
    "validated" to validated,
    "metered" to metered,
    "downKbps" to downKbps,
    "dataSaver" to dataSaver,
  )
}
