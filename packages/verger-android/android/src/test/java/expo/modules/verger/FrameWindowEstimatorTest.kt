package expo.modules.verger

import java.io.File
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Holds the Kotlin estimator to the golden vectors produced by the TypeScript reference
 * (`packages/verger-core/src/goldenVectors.test.ts`).
 */
class FrameWindowEstimatorTest {
  private data class Window(
    val startMs: Double,
    val endMs: Double,
    val frames: Int,
    val averageMs: Double,
    val targetMs: Double,
    val worstMs: Double,
    val droppedRatio: Double,
    val state: String,
    val forward: Boolean,
  )

  private fun fixtures(): File {
    System.getProperty("verger.fixtures")?.let { return File(it) }
    var dir: File? = File("").absoluteFile
    while (dir != null) {
      val candidate = File(dir, "packages/verger-core/src/__fixtures__")
      if (candidate.isDirectory) return candidate
      dir = dir.parentFile
    }
    error("verger fixtures not found; set -Dverger.fixtures")
  }

  private fun run(tickEveryMs: Double?): Pair<JSONObject, List<Window>> {
    val dir = fixtures()
    val input = JSONObject(File(dir, "a52-self-idle.json").readText())
    val expected = JSONObject(File(dir, "a52-self-idle.expected.json").readText())
    val config = expected.getJSONObject("config")
    val classification = FrameClassification(
      minSamples = config.getInt("minSamples"),
      stressRatio = config.getDouble("stressRatio"),
      stressDroppedRatio = config.getDouble("stressDroppedRatio"),
      comfortRatio = config.getDouble("comfortRatio"),
      comfortDroppedRatio = config.getDouble("comfortDroppedRatio"),
      jankFrameFactor = config.getDouble("jankFrameFactor"),
    )
    val produced = mutableListOf<Window>()
    val estimator = FrameWindowEstimator(expected.getDouble("windowMs"), classification) { w ->
      produced += Window(w.startMs, w.endMs, w.frames, w.averageMs, w.targetMs, w.worstMs,
        w.droppedRatio, w.state.wire, w.forward)
    }
    estimator.defaultTargetMs = input.getDouble("vsyncAppMedianGapMs")
    val frames = input.getJSONArray("frames")
    var nextTick = tickEveryMs ?: Double.POSITIVE_INFINITY
    for (i in 0 until frames.length()) {
      val f = frames.getJSONObject(i)
      val t = f.getDouble("tMs")
      while (t >= nextTick) {
        estimator.tick(nextTick)
        nextTick += tickEveryMs!!
      }
      val deadline = if (f.has("deadlineMs")) f.getDouble("deadlineMs") else Double.NaN
      estimator.addFrame(t, f.getDouble("durMs"), deadline)
    }
    estimator.close()
    return expected to produced
  }

  private fun assertMatchesGolden(produced: List<Window>, expected: JSONObject) {
    val windows = expected.getJSONArray("windows")
    assertEquals("window count", windows.length(), produced.size)
    for (i in 0 until windows.length()) {
      val e = windows.getJSONObject(i)
      val a = produced[i]
      val at = "window $i"
      assertEquals("$at start", e.getDouble("startMs"), a.startMs, 1e-9)
      assertEquals("$at end", e.getDouble("endMs"), a.endMs, 1e-9)
      assertEquals("$at frames", e.getInt("frames"), a.frames)
      assertEquals("$at average", e.getDouble("averageMs"), a.averageMs, 1e-6)
      assertEquals("$at target", e.getDouble("targetMs"), a.targetMs, 1e-6)
      assertEquals("$at worst", e.getDouble("worstMs"), a.worstMs, 1e-6)
      assertEquals("$at dropped", e.getDouble("droppedRatio"), a.droppedRatio, 1e-6)
      assertEquals("$at state", e.getString("state"), a.state)
      assertEquals("$at forward", e.getBoolean("forward"), a.forward)
    }
  }

  @Test
  fun matchesTheTypeScriptReference() {
    val (expected, produced) = run(tickEveryMs = null)
    assertMatchesGolden(produced, expected)
  }

  @Test
  fun timerFlushesDoNotChangeTheWindows() {
    // A real sensor closes windows from a timer as well as from the next frame.
    for (tick in listOf(100.0, 250.0, 500.0, 1300.0)) {
      val (expected, produced) = run(tickEveryMs = tick)
      assertMatchesGolden(produced, expected)
    }
  }

  @Test
  fun stageAveragesMatchTheTypeScriptReference() {
    val dir = fixtures()
    val input = JSONObject(File(dir, "synthetic-stages.json").readText()).getJSONArray("frames")
    val expected = JSONObject(File(dir, "synthetic-stages.expected.json").readText())
    val c = expected.getJSONObject("config")
    val classification = FrameClassification(c.getInt("minSamples"), c.getDouble("stressRatio"),
      c.getDouble("stressDroppedRatio"), c.getDouble("comfortRatio"), c.getDouble("comfortDroppedRatio"),
      c.getDouble("jankFrameFactor"))
    val produced = mutableListOf<DoubleArray>()
    val states = mutableListOf<String>()
    val estimator = FrameWindowEstimator(expected.getDouble("windowMs"), classification) { w ->
      produced += doubleArrayOf(w.startMs, w.frames.toDouble(), w.averageMs, w.droppedRatio,
        w.uiMs, w.renderMs, w.gpuMs, w.delayMs)
      states += "${w.state.wire}/${w.forward}"
    }
    estimator.defaultTargetMs = expected.getDouble("defaultTargetMs")
    for (i in 0 until input.length()) {
      val f = input.getJSONObject(i)
      val s = f.getJSONObject("stages")
      estimator.addFrame(f.getDouble("tMs"), f.getDouble("durMs"), f.getDouble("deadlineMs"),
        s.getDouble("uiMs"), s.getDouble("renderMs"), s.getDouble("gpuMs"), s.getDouble("delayMs"))
    }
    estimator.close()
    val windows = expected.getJSONArray("windows")
    assertEquals(windows.length(), produced.size)
    val keys = listOf("startMs", "frames", "averageMs", "droppedRatio", "uiMs", "renderMs", "gpuMs", "delayMs")
    for (i in 0 until windows.length()) {
      val e = windows.getJSONObject(i)
      keys.forEachIndexed { k, key -> assertEquals("window $i $key", e.getDouble(key), produced[i][k], 1e-6) }
      assertEquals("window $i state", "${e.getString("state")}/${e.getBoolean("forward")}", states[i])
    }
  }

  @Test
  fun anIdleScreenProducesNothing() {
    val c = FrameClassification(4, 1.25, 0.1, 0.8, 0.02)
    var count = 0
    val estimator = FrameWindowEstimator(500.0, c) { count++ }
    estimator.tick(10_000.0)
    estimator.close()
    assertEquals(0, count)
    assertTrue(estimator.openWindowEndMs.isNaN())
  }

  @Test
  fun calmRepeatsAreSuppressedButStressAlwaysCrosses() {
    val c = FrameClassification(4, 1.25, 0.1, 0.8, 0.02)
    val forwarded = mutableListOf<String>()
    val estimator = FrameWindowEstimator(500.0, c) { if (it.forward) forwarded += it.state.wire }
    estimator.defaultTargetMs = 16.667
    val costs = doubleArrayOf(6.0, 6.0, 25.0, 25.0, 6.0, 6.0, 15.0, 15.0, 6.0)
    costs.forEachIndexed { w, cost ->
      for (f in 0 until 30) estimator.addFrame(w * 500.0 + f * 16.0, cost, Double.NaN)
    }
    estimator.close()
    assertEquals(listOf("calm", "stressed", "stressed", "calm", "neutral", "neutral", "calm"), forwarded)
  }

  @Test
  fun missedVsyncsCountWholeIntervals() {
    val c = FrameClassification(1, 1.25, 0.1, 0.8, 0.02)
    var dropped = -1.0
    val estimator = FrameWindowEstimator(500.0, c) { dropped = it.droppedRatio }
    estimator.addFrame(1.0, 50.0, 16.0) // three whole intervals missed
    estimator.addFrame(2.0, 16.0, 16.0) // exactly on budget: none
    estimator.close()
    assertEquals(3.0 / 5.0, dropped, 1e-12)
    assertEquals(3L, estimator.totalMissedVsyncs)
  }

  @Test
  fun signalMappings() {
    assertEquals("moderate", Signals.trimSeverity(5))
    assertEquals("low", Signals.trimSeverity(10))
    assertEquals("critical", Signals.trimSeverity(15))
    assertNull(Signals.trimSeverity(20))
    assertEquals("moderate", Signals.trimSeverity(40))
    assertEquals("low", Signals.trimSeverity(60))
    assertEquals("critical", Signals.trimSeverity(80))
    assertEquals("severe", Signals.thermalStatus(3))
    assertNull(Signals.thermalStatus(9))
    assertNull(Signals.usableHeadroom(Float.NaN))
    assertNull(Signals.usableHeadroom(0f))
    assertEquals(0.5, Signals.usableHeadroom(0.5f)!!, 1e-6)
    assertEquals(60_000L, Signals.headroomPollDelayMs(0, 0.3, 0.85))
    assertEquals(10_000L, Signals.headroomPollDelayMs(0, 0.75, 0.85))
    assertEquals(10_000L, Signals.headroomPollDelayMs(1, null, 0.85))
    assertTrue(Signals.headroomChanged(null, 0.4))
    assertFalse(Signals.headroomChanged(0.40, 0.41))
    assertTrue(Signals.headroomChanged(0.40, 0.43))
  }

  @Test
  fun aLateFrameNeverReopensAClosedWindow() {
    val c = FrameClassification(4, 1.25, 0.1, 0.8, 0.02)
    val starts = mutableListOf<Double>()
    val estimator = FrameWindowEstimator(500.0, c) { starts += it.startMs }
    estimator.defaultTargetMs = 16.667
    for (i in 0 until 20) estimator.addFrame(i * 16.0, 8.0, Double.NaN)
    estimator.tick(620.0) // the flush timer closes [0, 500)
    estimator.addFrame(450.0, 400.0, Double.NaN) // a 400 ms frame whose metrics arrive late
    estimator.addFrame(1010.0, 8.0, Double.NaN)
    estimator.close()
    assertEquals(listOf(0.0, 500.0, 1000.0), starts)
  }

  @Test
  fun fewButVeryLongFramesAreStressNotQuiet() {
    val c = FrameClassification(4, 1.25, 0.1, 0.8, 0.02)
    var state = FrameState.QUIET
    val estimator = FrameWindowEstimator(500.0, c) { state = it.state }
    estimator.addFrame(10.0, 160.0, 16.0)
    estimator.addFrame(200.0, 160.0, 16.0)
    estimator.close()
    assertEquals(FrameState.STRESSED, state)
  }

  @Test
  fun droppedReportsCountAsMissedFrames() {
    val c = FrameClassification(1, 1.25, 0.1, 0.8, 0.02)
    var dropped = -1.0
    val estimator = FrameWindowEstimator(500.0, c) { dropped = it.droppedRatio }
    estimator.addFrame(1.0, 8.0, 16.0)
    estimator.addDroppedReports(3)
    estimator.close()
    assertEquals(3.0 / 4.0, dropped, 1e-12)
  }

  @Test(expected = IllegalArgumentException::class)
  fun rejectsANonFiniteWindow() {
    FrameWindowEstimator(Double.NaN, FrameClassification(4, 1.25, 0.1, 0.8, 0.02)) { }
  }
}
