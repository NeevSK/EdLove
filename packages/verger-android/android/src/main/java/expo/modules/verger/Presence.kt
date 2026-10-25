package expo.modules.verger

/**
 * Whether the app is in front, from activity lifecycle callbacks, without Expo (so the module
 * keeps no Expo-only lifecycle hook and ports to Expo Modules 2.0 mechanically). Pure: the
 * adapter feeds it starts, resumes and stops; it answers what the sensors should do.
 *
 * Visible while any activity is started (the platform's own definition of a foreground app);
 * every resume while visible rebinds the frame sensor to the resumed activity's window.
 */
class Presence(startedAlready: Boolean) {
  enum class Action { FOREGROUND, BACKGROUND, REBIND, NONE }

  private var started = if (startedAlready) 1 else 0

  val visible: Boolean get() = started > 0

  fun onStarted(): Action {
    started += 1
    return if (started == 1) Action.FOREGROUND else Action.NONE
  }

  /** A resume rebinds the window; it never changes visibility on its own. */
  fun onResumed(): Action = if (visible) Action.REBIND else Action.NONE

  fun onStopped(): Action {
    // A stop without a start we saw (the tracker began mid-life) cannot go below zero.
    if (started == 0) return Action.NONE
    started -= 1
    return if (started == 0) Action.BACKGROUND else Action.NONE
  }
}
