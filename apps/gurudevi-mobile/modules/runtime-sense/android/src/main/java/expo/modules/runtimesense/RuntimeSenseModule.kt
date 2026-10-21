package expo.modules.runtimesense

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Thin Expo binding over [RuntimeSense]. Everything that measures lives there, independent of
 * Expo; this file only maps it to constants, functions and events.
 */
class RuntimeSenseModule : Module() {
  private var sense: RuntimeSense? = null

  private fun sense(): RuntimeSense {
    sense?.let { return it }
    val context = requireNotNull(appContext.reactContext) { "React context is not available" }
    val emitter = object : SenseEmitter {
      override fun emit(name: String, body: Map<String, Any?>) = sendEvent(name, body)
    }
    return RuntimeSense(context, emitter) { appContext.currentActivity }.also { sense = it }
  }

  override fun definition() = ModuleDefinition {
    Name("RuntimeSense")

    Events(*RuntimeSense.EVENTS)

    Constant("capacity") { sense().capacity(appContext.currentActivity) }

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

  private fun parseConfig(options: Map<String, Any?>): SenseConfig {
    fun number(key: String): Double =
      (options[key] as? Number)?.toDouble() ?: throw IllegalArgumentException("start: missing '$key'")
    return SenseConfig(
      windowMs = number("windowMs"),
      classification = FrameClassification(
        minSamples = number("minSamples").toInt(),
        stressRatio = number("stressRatio"),
        stressDroppedRatio = number("stressDroppedRatio"),
        comfortRatio = number("comfortRatio"),
        comfortDroppedRatio = number("comfortDroppedRatio"),
      ),
      headroomWarm = number("headroomWarm"),
    )
  }
}
