package expo.modules.runtimesense

import org.junit.Assert.assertEquals
import org.junit.Test

class DisplayModesTest {
  private val fhd60 = DisplayModeSpec(1, 1080, 2400, 60f)
  private val fhd90 = DisplayModeSpec(2, 1080, 2400, 90f)
  private val fhd120 = DisplayModeSpec(3, 1080, 2400, 120f)
  private val hd60 = DisplayModeSpec(4, 720, 1600, 60f)
  private val modes = listOf(fhd60, fhd90, fhd120, hd60)

  @Test
  fun capsWithoutChangingResolution() {
    assertEquals(1, DisplayModes.modeIdForCap(modes, fhd120, 60f))
    assertEquals(2, DisplayModes.modeIdForCap(modes, fhd120, 90f))
    assertEquals(2, DisplayModes.modeIdForCap(modes, fhd120, 100f))
  }

  @Test
  fun releasingTheCapLetsTheSystemChoose() {
    assertEquals(0, DisplayModes.modeIdForCap(modes, fhd60, null))
    assertEquals(0, DisplayModes.modeIdForCap(modes, null, 60f))
  }

  @Test
  fun noQualifyingModeFallsBackToTheSystem() {
    assertEquals(0, DisplayModes.modeIdForCap(listOf(fhd90, fhd120), fhd120, 60f))
  }

  @Test
  fun toleratesFractionalRates() {
    val a = DisplayModeSpec(7, 1080, 2400, 59.94f)
    assertEquals(7, DisplayModes.modeIdForCap(listOf(a, fhd90), fhd90, 60f))
    assertEquals(listOf(60f, 90f, 120f), DisplayModes.ratesAtResolution(modes, fhd90))
  }
}
