package app.gurudevi.runtimepressure

import android.content.ComponentCallbacks2
import android.content.Context
import android.content.res.Configuration
import android.os.Build
import android.os.PowerManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.concurrent.Executor

class RuntimePressureModule : Module() {
  private var memoryPressure = "unknown"
  private var thermalPressure = "unknown"
  private var callbacks: ComponentCallbacks2? = null
  private var thermalListener: PowerManager.OnThermalStatusChangedListener? = null

  override fun definition() = ModuleDefinition {
    Name("GurudeviRuntimePressure")
    Events("pressureChanged")

    OnCreate {
      registerMemoryCallbacks()
      registerThermalListener()
    }

    OnDestroy {
      unregisterCallbacks()
    }

    AsyncFunction("getSnapshotAsync") {
      snapshot()
    }
  }

  private fun registerMemoryCallbacks() {
    val app = appContext.reactContext?.applicationContext ?: return
    val listener = object : ComponentCallbacks2 {
      override fun onTrimMemory(level: Int) {
        if (Build.VERSION.SDK_INT >= 34) return
        memoryPressure = when {
          level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_CRITICAL -> "severe"
          level >= ComponentCallbacks2.TRIM_MEMORY_RUNNING_MODERATE -> "constrained"
          else -> "unknown"
        }
        emitSnapshot()
      }

      override fun onConfigurationChanged(newConfig: Configuration) = Unit
      override fun onLowMemory() {
        if (Build.VERSION.SDK_INT >= 34) return
        memoryPressure = "severe"
        emitSnapshot()
      }
    }
    callbacks = listener
    app.registerComponentCallbacks(listener)
  }

  private fun registerThermalListener() {
    if (Build.VERSION.SDK_INT < 29) return
    val app = appContext.reactContext?.applicationContext ?: return
    val manager = app.getSystemService(Context.POWER_SERVICE) as? PowerManager ?: return
    thermalPressure = mapThermalStatus(manager.currentThermalStatus)
    val listener = PowerManager.OnThermalStatusChangedListener { status ->
      thermalPressure = mapThermalStatus(status)
      emitSnapshot()
    }
    thermalListener = listener
    manager.addThermalStatusListener(app.mainExecutor, listener)
  }

  private fun mapThermalStatus(status: Int): String = when (status) {
    PowerManager.THERMAL_STATUS_NONE,
    PowerManager.THERMAL_STATUS_LIGHT -> "normal"
    PowerManager.THERMAL_STATUS_MODERATE,
    PowerManager.THERMAL_STATUS_SEVERE -> "constrained"
    PowerManager.THERMAL_STATUS_CRITICAL,
    PowerManager.THERMAL_STATUS_EMERGENCY,
    PowerManager.THERMAL_STATUS_SHUTDOWN -> "severe"
    else -> "unknown"
  }

  private fun snapshot(): Map<String, String> = mapOf(
    "memory" to memoryPressure,
    "thermal" to thermalPressure
  )

  private fun emitSnapshot() {
    sendEvent("pressureChanged", snapshot())
  }

  private fun unregisterCallbacks() {
    val app = appContext.reactContext?.applicationContext ?: return
    callbacks?.let(app::unregisterComponentCallbacks)
    callbacks = null
    if (Build.VERSION.SDK_INT >= 29) {
      val manager = app.getSystemService(Context.POWER_SERVICE) as? PowerManager
      thermalListener?.let { manager?.removeThermalStatusListener(it) }
    }
    thermalListener = null
  }
}
