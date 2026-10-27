package expo.modules.verger

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/** The native half of the battery contract: each case's inputs build exactly its payload. */
class BatteryContractTest {
  private val cases by lazy {
    val path = System.getProperty("verger.contract")
      ?: error("system property verger.contract must point at contract/native-events.json")
    JSONObject(File(path).readText()).getJSONArray("battery")
  }

  @Test
  fun everyCaseBuildsExactlyItsPayload() {
    assertTrue("the contract must hold battery cases", cases.length() > 0)
    for (i in 0 until cases.length()) {
      val case = cases.getJSONObject(i)
      val inputs = case.getJSONObject("inputs")
      val built = BatterySignals.payload(
        BatterySignals.levelPercent(inputs.getInt("level"), inputs.getInt("scale")),
        BatterySignals.pluggedIn(inputs.getInt("plugged")),
        BatterySignals.temperatureC(inputs.getInt("tenths")),
      )
      val expected = case.getJSONObject("payload")
      val keys = expected.keys().asSequence().toSet()
      assertEquals(case.getString("case"), keys, built.keys)
      for (key in keys) {
        val want: Any? = if (expected.isNull(key)) null else expected.get(key)
        // JSON has one number type: compare numbers by value.
        val got = built[key]
        if (want is Number && got is Number) {
          assertEquals("${case.getString("case")}: $key", want.toDouble(), got.toDouble(), 0.0)
        } else {
          assertEquals("${case.getString("case")}: $key", want, got)
        }
      }
    }
  }

  @Test
  fun aLevelAboveItsScaleIsNotTrusted() {
    assertNull(BatterySignals.levelPercent(120, 100))
  }
}
