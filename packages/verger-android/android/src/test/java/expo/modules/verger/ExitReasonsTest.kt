package expo.modules.verger

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ExitReasonsTest {
  @Test
  fun failuresMapToTheNamesVergerCoreCounts() {
    assertEquals("crash", ExitReasons.name(4))
    assertEquals("crash", ExitReasons.name(7))
    assertEquals("native-crash", ExitReasons.name(5))
    assertEquals("anr", ExitReasons.name(6))
    assertEquals("excessive-resource", ExitReasons.name(9))
  }

  @Test
  fun systemAndUserEndingsAreNotFailures() {
    assertEquals("low-memory", ExitReasons.name(3))
    assertEquals("user", ExitReasons.name(10))
    assertEquals("user", ExitReasons.name(11))
    assertEquals("self", ExitReasons.name(1))
    assertEquals("signaled", ExitReasons.name(2))
    assertEquals("other", ExitReasons.name(0))
    assertEquals("other", ExitReasons.name(16))
    assertEquals("other", ExitReasons.name(99))
  }

  @Test
  fun visibleMeansForegroundOrVisible() {
    assertTrue(ExitReasons.visible(100))
    assertTrue(ExitReasons.visible(200))
    assertFalse(ExitReasons.visible(230))
    assertFalse(ExitReasons.visible(400))
    assertFalse(ExitReasons.visible(0))
  }
}
