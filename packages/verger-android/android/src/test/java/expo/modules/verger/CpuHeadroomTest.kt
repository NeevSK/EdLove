package expo.modules.verger

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CpuHeadroomTest {
  private fun poller() = CpuHeadroomPoller(busyPercent = 10.0, platformMinIntervalMs = 1_000L)

  @Test
  fun readsNoFasterThanThePlatformOrThePollInterval() {
    assertEquals(CpuHeadroomPoller.POLL_MS, poller().intervalMs)
    assertEquals(20_000L, CpuHeadroomPoller(10.0, 20_000L).intervalMs)
  }

  @Test
  fun reportsTheFirstReadingThenOnlyMovesAndCrossings() {
    val p = poller()
    assertTrue(p.read { 50f })
    assertEquals(50.0, p.percent!!, 0.0)
    assertFalse(p.read { 53f })
    assertTrue(p.read { 44f })
    // A small move across the busy line is always reported, so busy is never left stale.
    assertTrue(p.read { 12f })
    assertTrue(p.read { 9f })
    assertFalse(p.read { 8f })
  }

  @Test
  fun nanAndErrorsAreNoReadingNeverTheLastValue() {
    val p = poller()
    assertTrue(p.read { 5f })
    assertTrue(p.read { Float.NaN })
    assertNull(p.percent)
    assertFalse(p.read { Float.NaN })
    assertTrue(p.read { 5f })
    assertTrue(p.read { throw IllegalStateException("binder") })
    assertNull(p.percent)
    assertTrue(p.supported)
  }

  @Test
  fun unsupportedStopsReading() {
    val p = poller()
    assertTrue(p.read { 5f })
    assertTrue(p.read { throw UnsupportedOperationException() })
    assertNull(p.percent)
    assertFalse(p.supported)
    assertFalse(p.read { 50f })
    // Unsupported from the first call: one null report, then nothing.
    val q = poller()
    assertTrue(q.read { throw UnsupportedOperationException() })
    assertFalse(q.read { 50f })
  }

  @Test
  fun outOfRangeValuesAreNoReading() {
    assertNull(CpuHeadroomPoller.usable(-1f))
    assertNull(CpuHeadroomPoller.usable(101f))
    assertEquals(0.0, CpuHeadroomPoller.usable(0f)!!, 0.0)
  }
}
