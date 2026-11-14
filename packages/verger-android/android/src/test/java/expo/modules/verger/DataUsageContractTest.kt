package expo.modules.verger

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

/** The native half of the data-usage contract (B3.1), and when a sample is sent. */
class DataUsageContractTest {
  private val cases by lazy {
    val path = System.getProperty("verger.contract")
      ?: error("system property verger.contract must point at contract/native-events.json")
    JSONObject(File(path).readText()).getJSONArray("dataUsage")
  }

  @Test
  fun everyCaseBuildsExactlyItsPayload() {
    assertTrue("the contract must hold data usage cases", cases.length() > 0)
    for (i in 0 until cases.length()) {
      val case = cases.getJSONObject(i)
      val inputs = case.getJSONObject("inputs")
      val built = DataUsageSignals.payload(DataUsageSignals.totalBytes(inputs.getLong("rx"), inputs.getLong("tx")))
      val expected = case.getJSONObject("payload")
      assertEquals(case.getString("case"), expected.keys().asSequence().toSet(), built.keys)
      assertEquals(case.getString("case"), expected.getDouble("totalBytes"), built["totalBytes"] as Double, 0.0)
    }
  }

  @Test
  fun sendsOnBucketCrossingsAndTheHeartbeatOnly() {
    val r = DataUsageReporter(bucketBytes = 1_000, heartbeatMs = 60_000.0)
    assertTrue(r.shouldSend(500, 0.0))
    assertFalse(r.shouldSend(900, 1_000.0))
    assertTrue(r.shouldSend(1_100, 2_000.0))
    assertFalse(r.shouldSend(1_200, 30_000.0))
    // No traffic for a minute: sent anyway, so the day can turn over in JavaScript.
    assertTrue(r.shouldSend(1_200, 62_000.0))
    // A reboot: the total falls into another bucket.
    assertTrue(r.shouldSend(10, 63_000.0))
  }

  @Test
  fun anUnsupportedCounterIsNeverSent() {
    val r = DataUsageReporter(DataUsageReporter.BUCKET_BYTES, DataUsageReporter.HEARTBEAT_MS)
    assertEquals(DataUsageSignals.UNSUPPORTED, DataUsageSignals.totalBytes(-1, 5))
    assertFalse(r.shouldSend(DataUsageSignals.UNSUPPORTED, 0.0))
  }
}
