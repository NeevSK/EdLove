package expo.modules.verger

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/**
 * The native half of the network contract: every case in `contract/native-events.json` must be
 * built, from its inputs, into exactly its payload. The TypeScript half (`mapping.test.ts`) maps
 * the same payloads, so neither side can drift alone.
 */
class NetworkContractTest {
  private val contract: JSONObject by lazy {
    val path = System.getProperty("verger.contract")
      ?: error("system property verger.contract must point at contract/native-events.json")
    JSONObject(File(path).readText())
  }

  // Stand-ins for ConnectivityManager's constants: the mapping takes them as arguments.
  private val disabled = 1
  private val allowlisted = 2
  private val enabled = 3
  private val statusOf = mapOf("disabled" to disabled, "allowlisted" to allowlisted, "enabled" to enabled)

  // Not `optBoolean`: org.json has a member of that name, which wins and reads null as false.
  private fun JSONObject.booleanOrNull(key: String): Boolean? = if (isNull(key)) null else getBoolean(key)

  @Test
  fun everyCaseBuildsExactlyItsPayload() {
    val cases = contract.getJSONArray("network")
    assertTrue("the contract must hold network cases", cases.length() > 0)
    for (i in 0 until cases.length()) {
      val case = cases.getJSONObject(i)
      val inputs = case.getJSONObject("inputs")
      val built = NetworkSignals.payload(
        transport = NetworkSignals.transport(
          inputs.getBoolean("present"),
          inputs.getBoolean("wifi"),
          inputs.getBoolean("cellular"),
          inputs.getBoolean("ethernet"),
        ),
        validated = inputs.booleanOrNull("validated"),
        metered = inputs.booleanOrNull("metered"),
        downKbps = NetworkSignals.bucketKbps(inputs.getInt("kbps")),
        dataSaver = NetworkSignals.dataSaver(
          statusOf.getValue(inputs.getString("dataSaverStatus")), disabled, allowlisted, enabled,
        ),
      )
      val expected = case.getJSONObject("payload")
      val keys = expected.keys().asSequence().toSet()
      assertEquals(case.getString("case"), keys, built.keys)
      for (key in keys) {
        val want = if (expected.isNull(key)) null else expected.get(key)
        assertEquals("${case.getString("case")}: $key", want, built[key])
      }
    }
  }

  @Test
  fun unknownBandwidthAndUnknownStatusAreNullNotZero() {
    assertNull(NetworkSignals.bucketKbps(0))
    assertNull(NetworkSignals.bucketKbps(-1))
    assertNull(NetworkSignals.dataSaver(99, disabled, allowlisted, enabled))
  }

  @Test
  fun bandwidthMovesOnlyBetweenBuckets() {
    assertEquals(NetworkSignals.bucketKbps(1100), NetworkSignals.bucketKbps(2000))
    assertTrue(NetworkSignals.bucketKbps(2100) != NetworkSignals.bucketKbps(2000))
  }
}
