package expo.modules.runtimesense

/** One display mode as `android.view.Display.Mode` reports it. */
data class DisplayModeSpec(val id: Int, val width: Int, val height: Int, val refreshHz: Float)

/**
 * Chooses the display mode for a refresh-rate cap. This is the one lever that limits rendering
 * work for the whole app regardless of how any component is written: at 60 Hz instead of 90 or
 * 120 every frame gets 16.7 ms instead of 11.1 or 8.3, and the GPU and display draw less.
 */
object DisplayModes {
  /**
   * The mode with the current resolution and the highest refresh rate not above [capHz].
   * Returns 0 (let the system choose) when [capHz] is null or no mode qualifies. Resolution is
   * never changed: a resolution switch blanks the screen on many devices.
   */
  @JvmStatic
  fun modeIdForCap(modes: List<DisplayModeSpec>, current: DisplayModeSpec?, capHz: Float?): Int {
    if (capHz == null || current == null) return 0
    var best: DisplayModeSpec? = null
    for (mode in modes) {
      if (mode.width != current.width || mode.height != current.height) continue
      if (mode.refreshHz > capHz + 0.5f) continue
      if (best == null || mode.refreshHz > best.refreshHz) best = mode
    }
    return best?.id ?: 0
  }

  /** The distinct refresh rates available at the current resolution, ascending. */
  @JvmStatic
  fun ratesAtResolution(modes: List<DisplayModeSpec>, current: DisplayModeSpec?): List<Float> {
    if (current == null) return emptyList()
    return modes.filter { it.width == current.width && it.height == current.height }
      .map { it.refreshHz }
      .distinctBy { Math.round(it) }
      .sorted()
  }
}
