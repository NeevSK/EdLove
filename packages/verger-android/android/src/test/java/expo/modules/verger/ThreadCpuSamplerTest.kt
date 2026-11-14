package expo.modules.verger

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File

class ThreadCpuSamplerTest {
  @Test
  fun parsesStatLinesWithAwkwardNames() {
    val line = "1234 (we (ird) name) S 1 1234 1234 0 -1 4194560 100 0 0 0 250 75 0 0 20 0 30 0 100"
    assertEquals(325L, ProcStat.cpuTicks(line))
    assertEquals("we (ird) name", ProcStat.comm(line))
    assertEquals(-1L, ProcStat.cpuTicks("garbage"))
    assertEquals(-1L, ProcStat.cpuTicks("1 (x) S 1 2"))
  }

  @Test
  fun classifiesReactNativeThreads() {
    assertEquals(ThreadRole.MAIN, ThreadRoles.of(100, 100, "com.example.host"))
    assertEquals(ThreadRole.JS, ThreadRoles.of(101, 100, "mqt_v_js"))
    assertEquals(ThreadRole.JS, ThreadRoles.of(101, 100, "mqt_js"))
    assertEquals(ThreadRole.NATIVE_MODULES, ThreadRoles.of(102, 100, "mqt_v_native"))
    assertEquals(ThreadRole.RENDER, ThreadRoles.of(103, 100, "RenderThread"))
    assertEquals(ThreadRole.GC, ThreadRoles.of(104, 100, "HeapTaskDaemon"))
    assertEquals(ThreadRole.OTHER, ThreadRoles.of(105, 100, "OkHttp Dispatch"))
  }

  /** Runs against the real procfs of this JVM: a busy thread named like RN's JS thread. */
  @Test
  fun attributesRealCpuToTheNamedThread() {
    assumeTrue(File("/proc/self/task").isDirectory)
    val sampler = ThreadCpuSampler()
    val stop = java.util.concurrent.atomic.AtomicBoolean(false)
    val busy = Thread({
      var x = 0L
      while (!stop.get()) x += System.nanoTime() % 7
      if (x == 42L) println(x)
    }, "mqt_v_js")
    busy.start()
    Thread.sleep(100) // let the OS apply the thread name
    val t0 = System.nanoTime() / 1e6
    assertFalse("first sample is the baseline", sampler.sample(t0))
    Thread.sleep(800)
    assertTrue(sampler.sample(System.nanoTime() / 1e6))
    stop.set(true)
    busy.join()
    val js = sampler.load.of(ThreadRole.JS)
    assertTrue("JS role should be near one core, was $js", js in 0.6..1.2)
    assertTrue(sampler.load.processCores >= js)
  }
}
