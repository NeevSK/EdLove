package expo.modules.verger

import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test

class SensorsTest {
  @Test
  fun noSetMeansEverySensorAsBefore() {
    assertEquals(Sensors.ALL, Sensors.parse(null))
    assertEquals(Sensors.ALL, Sensors.parse(emptyMap<String, Any?>()))
  }

  @Test
  fun eachSensorSwitchesAlone() {
    val set = Sensors.parse(mapOf("thermal" to false, "threads" to false))
    assertEquals(Sensors(threads = false, thermal = false), set)
  }

  @Test
  fun javascriptOnlySensorsAreIgnored() {
    assertEquals(Sensors.ALL, Sensors.parse(mapOf("longTasks" to false)))
  }

  @Test
  fun aNonBooleanIsRejectedNotGuessed() {
    assertThrows(IllegalArgumentException::class.java) { Sensors.parse(mapOf("frames" to "no")) }
    assertThrows(IllegalArgumentException::class.java) { Sensors.parse(mapOf("memory" to 0)) }
  }
}
