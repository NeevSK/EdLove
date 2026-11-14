package expo.modules.verger

import expo.modules.verger.Presence.Action
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PresenceTest {
  @Test
  fun firstStartIsForegroundLastStopIsBackground() {
    val p = Presence(startedAlready = false)
    assertFalse(p.visible)
    assertEquals(Action.FOREGROUND, p.onStarted())
    assertEquals(Action.REBIND, p.onResumed())
    assertEquals(Action.BACKGROUND, p.onStopped())
    assertFalse(p.visible)
  }

  @Test
  fun movingBetweenActivitiesStaysVisible() {
    // B starts before A stops: the app never left the front.
    val p = Presence(startedAlready = false)
    p.onStarted()
    p.onResumed()
    assertEquals(Action.NONE, p.onStarted())
    assertEquals(Action.REBIND, p.onResumed())
    assertEquals(Action.NONE, p.onStopped())
    assertTrue(p.visible)
  }

  @Test
  fun aResumeWhileHiddenDoesNothing() {
    assertEquals(Action.NONE, Presence(startedAlready = false).onResumed())
  }

  @Test
  fun aTrackerBegunWhileVisibleSeesTheLastStopAndNoMore() {
    val p = Presence(startedAlready = true)
    assertTrue(p.visible)
    assertEquals(Action.BACKGROUND, p.onStopped())
    assertEquals(Action.NONE, p.onStopped())
    assertFalse(p.visible)
  }
}
