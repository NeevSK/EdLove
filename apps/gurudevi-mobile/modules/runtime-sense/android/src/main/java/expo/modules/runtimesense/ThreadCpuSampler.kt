package expo.modules.runtimesense

import java.io.File
import java.io.RandomAccessFile

/**
 * The roles the runtime attributes CPU time to. Each is matched by the kernel thread name
 * (`comm`, at most 15 characters). React Native names its JS thread `mqt_v_js` (bridgeless) or
 * `mqt_js`; the names are matched by prefix and confirmed on device in the diagnostics view,
 * which also lists the busiest unmatched threads so a new name is found, not guessed.
 */
enum class ThreadRole(val wire: String) {
  MAIN("main"),
  JS("js"),
  NATIVE_MODULES("nativeModules"),
  RENDER("render"),
  GC("gc"),
  IMAGE("image"),
  OTHER("other"),
}

object ThreadRoles {
  @JvmStatic
  fun of(tid: Int, pid: Int, comm: String): ThreadRole = when {
    tid == pid -> ThreadRole.MAIN
    comm.startsWith("mqt_v_js") || comm == "mqt_js" -> ThreadRole.JS
    comm.startsWith("mqt_v_native") || comm == "mqt_native" || comm.startsWith("mqt_native") -> ThreadRole.NATIVE_MODULES
    comm == "RenderThread" || comm.startsWith("hwuiTask") -> ThreadRole.RENDER
    comm == "HeapTaskDaemon" || comm.startsWith("hades") || comm.startsWith("FinalizerDaemon") -> ThreadRole.GC
    comm.startsWith("glide") || comm.startsWith("Glide") || comm.startsWith("expo-image") -> ThreadRole.IMAGE
    else -> ThreadRole.OTHER
  }
}

/**
 * Parses one `/proc/<pid>/task/<tid>/stat` line. The thread name sits in parentheses and may
 * itself contain spaces or parentheses, so fields are counted from the last ')'.
 * Returns utime + stime in clock ticks, or -1 when the line is malformed.
 */
object ProcStat {
  @JvmStatic
  fun cpuTicks(line: CharSequence): Long {
    val close = lastIndexOf(line, ')')
    if (close < 0) return -1
    // After ") " come: state(3) ppid(4) ... utime(14) stime(15). Field 3 is index 0 here.
    var field = 0
    var i = close + 2
    var utime = -1L
    while (i < line.length) {
      val start = i
      while (i < line.length && line[i] != ' ') i++
      if (field == 11) utime = parseLong(line, start, i)
      if (field == 12) {
        val stime = parseLong(line, start, i)
        return if (utime < 0 || stime < 0) -1 else utime + stime
      }
      field++
      i++
    }
    return -1
  }

  @JvmStatic
  fun comm(line: CharSequence): String {
    val open = indexOf(line, '(')
    val close = lastIndexOf(line, ')')
    return if (open < 0 || close <= open) "" else line.subSequence(open + 1, close).toString()
  }

  private fun parseLong(s: CharSequence, from: Int, to: Int): Long {
    if (from >= to) return -1
    var v = 0L
    for (k in from until to) {
      val d = s[k] - '0'
      if (d < 0 || d > 9) return -1
      v = v * 10 + d
    }
    return v
  }

  private fun indexOf(s: CharSequence, c: Char): Int {
    for (k in s.indices) if (s[k] == c) return k
    return -1
  }

  private fun lastIndexOf(s: CharSequence, c: Char): Int {
    for (k in s.length - 1 downTo 0) if (s[k] == c) return k
    return -1
  }
}

/** CPU load per role over one sampling interval. Utilisation is cores used: 1.0 = one core. */
class ThreadLoad(roles: Int) {
  val cores = DoubleArray(roles)
  var processCores = 0.0
    internal set
  var intervalMs = 0.0
    internal set
  /** Busiest thread not matched to a role, for discovering names on new devices. */
  var topOtherName: String = ""
    internal set
  var topOtherCores = 0.0
    internal set

  fun of(role: ThreadRole): Double = cores[role.ordinal]
}

/**
 * Samples per-thread CPU time of this process from procfs. Reading `/proc/self/task` needs no
 * permission: a process may always read its own tasks. One sample costs one directory listing
 * and one small read per thread, so it runs at about 1 Hz and only while the app is visible.
 */
class ThreadCpuSampler(
  private val procSelf: File = File("/proc/self"),
  private val clockTicksPerSecond: Long = 100,
  /** On Android pass `Process.myPid()`; the default reads it from procfs (JVM tests). */
  private val pid: Int = readPid(procSelf),
) {
  private val roles = ThreadRole.values()
  private val previous = HashMap<Int, Long>(64)
  private val current = HashMap<Int, Long>(64)
  private val names = HashMap<Int, String>(64)
  private val buffer = ByteArray(512)
  private var line: String = ""
  private var lastSampleMs = Double.NaN
  val load = ThreadLoad(roles.size)

  /**
   * Takes a sample at [nowMs] (monotonic). Returns false for the first sample, which only
   * establishes the baseline, and when the interval is too short to measure.
   */
  fun sample(nowMs: Double): Boolean {
    val tasks = File(procSelf, "task").list() ?: return false
    current.clear()
    for (name in tasks) {
      val tid = name.toIntOrNull() ?: continue
      if (!readLine(File(procSelf, "task/$name/stat"))) continue
      val ticks = ProcStat.cpuTicks(line)
      if (ticks < 0) continue
      current[tid] = ticks
      // Re-read the name when a tid is new or its counter went backwards (the tid was reused).
      val before = previous[tid]
      if (!names.containsKey(tid) || (before != null && ticks < before)) names[tid] = ProcStat.comm(line)
    }
    val interval = nowMs - lastSampleMs
    val measurable = !lastSampleMs.isNaN() && interval >= MIN_INTERVAL_MS
    if (measurable) {
      load.cores.fill(0.0)
      load.topOtherCores = 0.0
      load.topOtherName = ""
      var total = 0.0
      val msPerTick = 1000.0 / clockTicksPerSecond
      for ((tid, ticks) in current) {
        val before = previous[tid] ?: continue // a thread born mid-interval is counted next time
        val cores = ((ticks - before).coerceAtLeast(0) * msPerTick) / interval
        val name = names[tid] ?: ""
        val role = ThreadRoles.of(tid, pid, name)
        load.cores[role.ordinal] += cores
        total += cores
        if (role == ThreadRole.OTHER && cores > load.topOtherCores) {
          load.topOtherCores = cores
          load.topOtherName = name
        }
      }
      load.processCores = total
      load.intervalMs = interval
    }
    // Forget threads that have exited.
    names.keys.retainAll(current.keys)
    previous.clear()
    previous.putAll(current)
    lastSampleMs = nowMs
    return measurable
  }

  private fun readLine(file: File): Boolean {
    return try {
      RandomAccessFile(file, "r").use { raf ->
        val n = raf.read(buffer)
        if (n <= 0) return false
        var end = 0
        while (end < n && buffer[end] != '\n'.code.toByte()) end++
        // Thread names are UTF-8; decoding byte by byte would mangle them.
        line = String(buffer, 0, end, Charsets.UTF_8)
        true
      }
    } catch (_: Exception) {
      false // the thread exited between listing and reading
    }
  }

  companion object {
    private const val MIN_INTERVAL_MS = 200.0

    private fun readPid(procSelf: File): Int =
      runCatching { procSelf.canonicalFile.name.toInt() }.getOrDefault(-1)
  }
}
