package expo.modules.verger

/**
 * Pure mapping of Android's exit records to verger-core's names. The values are the public
 * `ApplicationExitInfo.REASON_*` and `RunningAppProcessInfo.IMPORTANCE_*` constants (stable
 * API since 30), written out so the mapping is testable on the JVM.
 */
object ExitReasons {
  private const val EXIT_SELF = 1
  private const val SIGNALED = 2
  private const val LOW_MEMORY = 3
  private const val CRASH = 4
  private const val CRASH_NATIVE = 5
  private const val ANR = 6
  private const val INITIALIZATION_FAILURE = 7
  private const val EXCESSIVE_RESOURCE_USAGE = 9
  private const val USER_REQUESTED = 10
  private const val USER_STOPPED = 11
  private const val IMPORTANCE_VISIBLE = 200

  fun name(reason: Int): String = when (reason) {
    CRASH, INITIALIZATION_FAILURE -> "crash"
    CRASH_NATIVE -> "native-crash"
    ANR -> "anr"
    EXCESSIVE_RESOURCE_USAGE -> "excessive-resource"
    LOW_MEMORY -> "low-memory"
    USER_REQUESTED, USER_STOPPED -> "user"
    EXIT_SELF -> "self"
    SIGNALED -> "signaled"
    else -> "other"
  }

  /** Visible or more important when it ended (foreground, or visible behind a dialog). */
  fun visible(importance: Int): Boolean = importance in 1..IMPORTANCE_VISIBLE
}
