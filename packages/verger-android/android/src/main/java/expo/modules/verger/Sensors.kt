package expo.modules.verger

/**
 * Which native sensors run. JavaScript sends the set from verger's activation; a sensor that is
 * off costs nothing (no listener, no receiver, no polling). Every field defaults to on, so a
 * JavaScript bundle that sends no set keeps the behaviour from before sensors were switchable.
 * Kept free of Android imports so it is tested on the desktop JVM.
 */
data class Sensors(
  val frames: Boolean = true,
  val threads: Boolean = true,
  val memory: Boolean = true,
  val thermal: Boolean = true,
  val power: Boolean = true,
  val network: Boolean = true,
) {
  companion object {
    @JvmField val ALL = Sensors()

    /**
     * Reads the set JavaScript sent. Keys for sensors that live in JavaScript (long tasks) are
     * ignored; a value that is not a boolean is an error, raised on the calling thread.
     */
    @JvmStatic
    fun parse(map: Map<*, *>?): Sensors {
      if (map == null) return ALL
      fun flag(key: String): Boolean {
        val value = map[key] ?: return true
        require(value is Boolean) { "sensors.$key must be a boolean" }
        return value
      }
      return Sensors(
        frames = flag("frames"),
        threads = flag("threads"),
        memory = flag("memory"),
        thermal = flag("thermal"),
        power = flag("power"),
        network = flag("network"),
      )
    }
  }
}
