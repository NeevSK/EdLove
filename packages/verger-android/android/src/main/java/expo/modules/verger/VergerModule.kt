package expo.modules.verger

import android.os.Build
import android.os.Trace
import io.github.expo.modules.v2.Event
import io.github.expo.modules.v2.ExpoModule
import io.github.expo.modules.v2.JS
import io.github.expo.modules.v2.Module
import io.github.expo.modules.v2.react.androidContext
import io.github.expo.modules.v2.react.currentActivity
import io.github.expo.modules.v2.react.reactContext

/** Only the Expo boundary; sensing, cadence and hardware ownership remain in VergerSense. */
@ExpoModule("Verger")
class VergerModule : Module() {
  private var sense: VergerSense? = null

  // Explicit names preserve the existing JS wire contract; v2 otherwise strips the `on` prefix.
  @Event(name = "onFrameWindow")
  val onFrameWindow = event<Map<String, Any?>>()
  @Event(name = "onThermal")
  val onThermal = event<Map<String, Any?>>()
  @Event(name = "onMemoryTrim")
  val onMemoryTrim = event<Map<String, Any?>>()
  @Event(name = "onPowerSaver")
  val onPowerSaver = event<Map<String, Any?>>()
  @Event(name = "onThreadLoad")
  val onThreadLoad = event<Map<String, Any?>>()
  @Event(name = "onMemory")
  val onMemory = event<Map<String, Any?>>()
  @Event(name = "onNetwork")
  val onNetwork = event<Map<String, Any?>>()
  @Event(name = "onBattery")
  val onBattery = event<Map<String, Any?>>()
  @Event(name = "onCpuHeadroom")
  val onCpuHeadroom = event<Map<String, Any?>>()
  @Event(name = "onDataUsage")
  val onDataUsage = event<Map<String, Any?>>()
  @Event(name = "onLever")
  val onLever = event<Map<String, Any?>>()

  private fun sense(): VergerSense {
    sense?.let { return it }
    val react = reactContext
    val emitter = object : SenseEmitter {
      override fun emit(name: String, body: Map<String, Any?>) {
        when (name) {
          VergerSense.EVENT_FRAME_WINDOW -> onFrameWindow.emit(body)
          VergerSense.EVENT_THERMAL -> onThermal.emit(body)
          VergerSense.EVENT_MEMORY_TRIM -> onMemoryTrim.emit(body)
          VergerSense.EVENT_POWER_SAVER -> onPowerSaver.emit(body)
          VergerSense.EVENT_THREAD_LOAD -> onThreadLoad.emit(body)
          VergerSense.EVENT_MEMORY -> onMemory.emit(body)
          VergerSense.EVENT_NETWORK -> onNetwork.emit(body)
          VergerSense.EVENT_BATTERY -> onBattery.emit(body)
          VergerSense.EVENT_CPU_HEADROOM -> onCpuHeadroom.emit(body)
          VergerSense.EVENT_DATA_USAGE -> onDataUsage.emit(body)
          VergerSense.EVENT_LEVER -> onLever.emit(body)
          else -> error("Unknown Verger event: $name")
        }
      }
    }
    // Teardown is queued: resolve the activity live without depending on an open ExpoContext.
    return VergerSense(react.applicationContext, emitter) { react.currentActivity }.also { sense = it }
  }

  // Remain methods: capacity and exits must not be cached or create the sensor.
  @JS
  fun readCapacity(): Map<String, Any?> = DeviceFacts.capacity(androidContext)

  @JS
  fun readExits(sinceWallMs: Double): List<Map<String, Any?>>? = DeviceFacts.exits(androidContext, sinceWallMs)

  @JS
  fun readProcessId(): Int = android.os.Process.myPid()

  @JS
  fun start(options: Map<String, Any?>) {
    val config = parseConfig(options)
    sense().start(config, currentActivity)
  }

  @JS
  fun stop() { sense?.stop() }

  @JS
  fun setSensors(sensors: Map<String, Any?>) { sense?.setSensors(Sensors.parse(sensors)) }

  @JS
  fun setRefreshCap(hz: Double?) { sense().setRefreshCap(hz) }

  @JS
  fun setCpuBoost(enabled: Boolean) { sense().setCpuBoost(enabled) }

  @JS
  fun readTotals(): Map<String, Any?> = sense?.totals() ?: emptyMap()

  /**
   * CLOCK_MONOTONIC in milliseconds, the clock of every native payload's `sensedAtMs` and frame
   * window. Read beside JavaScript's `performance.now()` in one tick to prove the two are one
   * clock on a phone before joins are trusted as exact. Starts nothing.
   */
  @JS
  fun readMonotonicMs(): Double = System.nanoTime() / 1e6

  /**
   * Verger's decisions as Perfetto counter tracks (`android.os.Trace.setCounter`, API 29+), so a
   * system trace shows lever levels, rung and heat on the same timeline as the scheduler and the
   * frames. Written only while a trace is recording; values that are not numbers are skipped.
   * Starts nothing.
   */
  @JS
  fun traceCounters(counters: Map<String, Any?>) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || !Trace.isEnabled()) return
    for ((name, value) in counters) {
      if (value is Number) Trace.setCounter(name, value.toLong())
    }
  }

  override fun onDestroy() {
    sense?.destroy()
    sense = null
    super.onDestroy()
  }

  /**
   * Validates synchronously, on the calling (JS) thread, so a bad config is a JS exception
   * rather than a throw on the sensor thread, which would crash the app.
   */
  private fun parseConfig(options: Map<String, Any?>): SenseConfig {
    fun number(key: String): Double {
      val value = (options[key] as? Number)?.toDouble() ?: throw IllegalArgumentException("start: missing '$key'")
      require(value.isFinite() && value > 0) { "start: '$key' must be finite and positive" }
      return value
    }
    return SenseConfig(
      windowMs = number("windowMs"),
      classification = FrameClassification(
        minSamples = number("minSamples").toInt(),
        stressRatio = number("stressRatio"),
        stressDroppedRatio = number("stressDroppedRatio"),
        comfortRatio = number("comfortRatio"),
        comfortDroppedRatio = number("comfortDroppedRatio"),
        jankFrameFactor = number("jankFrameFactor"),
      ),
      headroomWarm = number("headroomWarm"),
      saturationCores = number("saturationCores"),
      cpuHeadroomBusyPercent = number("cpuHeadroomBusyPercent"),
      sensors = Sensors.parse(options["sensors"] as? Map<*, *>),
    )
  }
}
