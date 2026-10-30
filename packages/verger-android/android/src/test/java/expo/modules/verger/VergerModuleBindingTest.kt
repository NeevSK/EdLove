package expo.modules.verger

import io.github.expo.modules.v2.discoveredExpoModules
import io.github.expo.modules.v2.events.Event
import io.github.expo.modules.v2.modules.ModuleBuilder
import io.github.expo.modules.v2.types.TypeDescriptor
import io.github.expo.modules.v2.types.anyConverter
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test

class VergerModuleBindingTest {
  @Test
  fun compilerDiscoveryIncludesExactlyOneVergerModule() {
    assertEquals(1, discoveredExpoModules().count { it == VergerModule::class.java })
  }

  private fun sensorOf(module: VergerModule): Any? =
    VergerModule::class.java.getDeclaredField("sense").apply { isAccessible = true }.get(module)

  @Test
  fun generatedDefinitionKeepsTheModuleNameAndElevenSynchronousFunctions() {
    val module = VergerModule()
    val builder = ModuleBuilder()
    assertEquals("Verger", module.`define$ExpoModulesV2`(builder))
    val functions = ModuleBuilder::class.java.getDeclaredField("functions")
      .apply { isAccessible = true }.get(builder) as List<*>
    // Nine since the Modules API 2.0 rewrite; the clock probe and trace counters joined 2026-10-29.
    assertEquals(11, functions.size)
    val declarations = functions.map { requireNotNull(it) }
    val arities = mapOf(
      "readCapacity" to 0, "readExits" to 1, "readProcessId" to 0,
      "start" to 1, "stop" to 0, "setSensors" to 1,
      "setRefreshCap" to 1, "setCpuBoost" to 1, "readTotals" to 0,
      "readMonotonicMs" to 0, "traceCounters" to 1,
    )
    assertEquals(arities.keys, declarations.map { it.javaClass.getMethod("getJsName").invoke(it) }.toSet())
    // The SDK keeps descriptor types internal; inspect the compiler's actual output, not annotations.
    for (declaration in declarations) {
      val name = declaration.javaClass.getMethod("getJsName").invoke(declaration) as String
      val args = declaration.javaClass.getMethod("getArgTypes").invoke(declaration) as Array<*>
      assertEquals(arities[name], args.size)
    }
    assertTrue(declarations.all { it.javaClass.getMethod("isAsync").invoke(it) == false })
    VergerModule::class.java.getDeclaredMethod("setRefreshCap", java.lang.Double::class.java)
    assertNull(sensorOf(module))
  }

  @Test
  fun clockProbeAndTraceCountersStartNothing() {
    val module = VergerModule()
    val first = module.readMonotonicMs()
    val second = module.readMonotonicMs()
    assertTrue(second >= first)
    // Below API 29 (the desktop JVM reports 0) counters are skipped, never thrown on.
    module.traceCounters(mapOf("verger.rung" to 2, "verger.thermal" to "hot", "verger.none" to null))
    assertNull(sensorOf(module))
  }

  @Test
  fun compilerBindsEveryEventToItsExactExistingWireName() {
    val module = VergerModule()
    val events = VergerModule::class.java.declaredMethods
      .filter { it.parameterCount == 0 && it.returnType == Event::class.java }
      .map { it.invoke(module) as Event<*> }
    assertEquals(11, events.size)
    assertEquals(VergerSense.EVENTS.toSet(), events.map { it.name }.toSet())
    assertTrue(events.none { it.isObserved })
    assertNull(sensorOf(module))
  }

  @Test
  fun eventConvertersPreserveNestedMapsNullsNumbersAndBooleans() {
    val module = VergerModule()
    val payload: Map<String, Any?> = mapOf(
      "unknown" to null,
      "validated" to false,
      "bandwidth" to 16384,
      "temperature" to 36.5,
      "sensors" to mapOf("frames" to true, "thermal" to false),
      "history" to listOf(mapOf("reason" to "crash", "pid" to 123, "atWallMs" to 1793000000000.0)),
    )
    val descriptor = Event::class.java.getDeclaredField("descriptor")
      .apply { isAccessible = true }.get(module.onNetwork) as TypeDescriptor
    val converter = descriptor.anyConverter
    assertEquals(payload, converter.fromJni(converter.toJni(payload)))
  }

  @Test
  fun stoppingAndDestroyingAnUnusedModuleDoesNotReadContextOrStartSensors() {
    val module = VergerModule()
    repeat(2) { module.stop(); module.onDestroy() }
    assertEquals(emptyMap<String, Any?>(), module.readTotals())
    assertNull(sensorOf(module))
  }

  @Test
  fun invalidConfigurationIsRejectedSynchronouslyBeforeCreatingASensor() {
    val module = VergerModule()
    val missing = assertThrows(IllegalArgumentException::class.java) { module.start(emptyMap()) }
    assertEquals("start: missing 'windowMs'", missing.message)
    for (value in listOf(Double.NaN, Double.POSITIVE_INFINITY, 0.0, -1.0)) {
      val invalid = assertThrows(IllegalArgumentException::class.java) { module.start(mapOf("windowMs" to value)) }
      assertEquals("start: 'windowMs' must be finite and positive", invalid.message)
    }
    assertNull(sensorOf(module))
  }
}
