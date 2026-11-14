package expo.modules.verger

import android.app.ActivityManager
import android.content.Context
import android.os.Build

/**
 * Read-only facts about the device and about how earlier processes ended. Nothing here starts
 * a thread, registers a listener or holds state, so the launcher can read these to judge the
 * last session without bringing up any sensing.
 */
object DeviceFacts {
  /** Facts that do not change while the process lives. */
  fun capacity(context: Context): Map<String, Any?> {
    val app = context.applicationContext
    val am = app.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    val levers = HardwareLevers(app) { null }
    val memory = ActivityManager.MemoryInfo().also { info -> runCatching { am.getMemoryInfo(info) } }
    return mapOf(
      "totalMemoryBytes" to memory.totalMem.toDouble(),
      "isLowRamDevice" to runCatching { am.isLowRamDevice }.getOrNull(),
      "memoryClassMb" to runCatching { am.memoryClass }.getOrNull(),
      "sdkInt" to Build.VERSION.SDK_INT,
      "cpuCores" to Runtime.getRuntime().availableProcessors(),
      "refreshRateHz" to levers.currentRefreshHz()?.toDouble(),
      "supportsRenderEffect" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S),
      "supportsRuntimeShader" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU),
      "supportsThermalHeadroom" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R),
      "supportsFrameDeadline" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S),
      "supportsGpuDuration" to (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S),
      "supportsCpuHints" to levers.supportsCpuHints,
      "refreshRatesHz" to levers.displayRates().map { it.toDouble() },
      "largeMemoryClassMb" to runCatching { am.largeMemoryClass }.getOrNull(),
      // Stays on the device: the launcher hashes it to notice a system update.
      "buildFingerprint" to runCatching { Build.FINGERPRINT }.getOrNull(),
    )
  }

  /**
   * How this app's earlier processes ended (API 30+), since a wall time, oldest first. Only
   * the reason, the time and whether the process was visible cross to JavaScript; the
   * platform's free-text description and traces never do. Null below API 30, where the
   * platform keeps no record.
   */
  fun exits(context: Context, sinceWallMs: Double, max: Int = 16): List<Map<String, Any?>>? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return null
    val app = context.applicationContext
    val am = app.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
    val infos = runCatching { am.getHistoricalProcessExitReasons(app.packageName, 0, max) }.getOrNull() ?: return null
    return infos
      .filter { it.timestamp.toDouble() >= sinceWallMs }
      .sortedBy { it.timestamp }
      .map { info ->
        mapOf(
          "reason" to ExitReasons.name(info.reason),
          "atWallMs" to info.timestamp.toDouble(),
          "foreground" to ExitReasons.visible(info.importance),
          "pid" to info.pid,
        )
      }
  }
}
