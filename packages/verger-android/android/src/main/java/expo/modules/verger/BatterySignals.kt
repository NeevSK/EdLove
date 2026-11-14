package expo.modules.verger

/**
 * Pure mappings for the battery, from the `ACTION_BATTERY_CHANGED` broadcast's extras to the
 * payload that crosses to JavaScript. Kept free of Android imports so it is tested on the desktop
 * JVM, and held to the shared contract fixtures in `packages/verger-android/contract/native-events.json`.
 */
object BatterySignals {
  /** Whole percent from the broadcast's level and scale; null when either is missing or invalid. */
  @JvmStatic
  fun levelPercent(level: Int, scale: Int): Int? =
    if (level < 0 || scale <= 0 || level > scale) null else (level * 100) / scale

  /** On external power: any non-zero `EXTRA_PLUGGED`. Null when the extra is missing (negative). */
  @JvmStatic
  fun pluggedIn(plugged: Int): Boolean? = if (plugged < 0) null else plugged > 0

  /**
   * Battery temperature in degrees Celsius. ASSUMPTION to verify on a phone: `EXTRA_TEMPERATURE`
   * is in tenths of a degree (the common convention; not confirmed in this session). Rounded to
   * half a degree so only a real change crosses to JavaScript. `Int.MIN_VALUE` means missing.
   */
  @JvmStatic
  fun temperatureC(tenths: Int): Double? =
    if (tenths == Int.MIN_VALUE) null else Math.floor(tenths / 10.0 * 2.0) / 2.0

  @JvmStatic
  fun payload(levelPercent: Int?, pluggedIn: Boolean?, temperatureC: Double?): Map<String, Any?> = mapOf(
    "levelPercent" to levelPercent,
    "pluggedIn" to pluggedIn,
    "temperatureC" to temperatureC,
  )
}
