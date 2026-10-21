package expo.modules.verger

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Thin Expo binding over [VergerSense]. Everything that measures lives there, independent of
 * Expo; this file only maps it to constants, functions and events.
 */
class VergerModule : Module() {
  private var sense: VergerSense? = null

  private fun sense(): VergerSense {
    sense?.let { return it }
    val context = requireNotNull(appContext.reactContext) { "React context is not available" }
    val emitter = object : SenseEmitter {
      override fun emit(name: String, body: Map<String, Any?>) = sendEvent(name, body)
    }
    return VergerSense(context, emitter) { appContext.currentActivity }.also { sense = it }
  }

  override fun definition() = ModuleDefinition {
    Name("VergerSense")

    Events(*VergerSense.EVENTS)

    // A function, not a constant: Expo caches constants on first read, and capacity read
    // before the first activity resumes would be wrong for the life of the process.
    Function("readCapacity") { sense().capacity(appContext.currentActivity) }

    Function("start") { options: Map<String, Any?> ->
      sense().start(parseConfig(options), appContext.currentActivity)
    }

    Function("stop") { sense?.stop() }

    Function("setRefreshCap") { hz: Double? -> sense().setRefreshCap(hz) }

    Function("setCpuBoost") { enabled: Boolean -> sense().setCpuBoost(enabled) }

    Function("readTotals") { sense?.totals() ?: emptyMap<String, Any?>() }

    OnActivityEntersForeground { sense?.onForeground(appContext.currentActivity) }

    OnActivityEntersBackground { sense?.onBackground() }

    OnDestroy {
      sense?.destroy()
      sense = null
    }
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
    )
  }
}
