<script lang="ts">
/**
 * Sri Lanka Dual-System Diagnostic Simulator
 * Interactive policy & economic model for edlove-web
 */

// Initial state variables (Svelte 5 Runes)
let provincialFundingPerStudent = $state(5000); // LKR
let nationalFundingPerStudent = 10000; // Fixed baseline for elite Tier 1A
let teacherBaseMonthlySalary = $state(55000); // LKR
let householdTuitionSpendPercent = $state(48); // %

// Derived values
let fundingDisparityRatio = $derived(
  (nationalFundingPerStudent / provincialFundingPerStudent).toFixed(1)
);

let estimatedMoonlightingNecessity = $derived(
  Math.max(0, Math.min(100, Math.round(((90000 - teacherBaseMonthlySalary) / 50000) * 80)))
);

let estimatedStudentDayHours = $derived(
  (6 + (householdTuitionSpendPercent / 100) * 8).toFixed(1)
);

let annualShadowMarketCapBn = $derived(
  Math.round((householdTuitionSpendPercent / 48) * 210)
);

function resetDefaults() {
  provincialFundingPerStudent = 5000;
  teacherBaseMonthlySalary = 55000;
  householdTuitionSpendPercent = 48;
}
</script>

<div class="my-16 rounded-3xl bg-slate-900 border-2 border-slate-700 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden font-mono">
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
    <div>
      <div class="inline-flex items-center gap-2 px-3 py-1 bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/30 text-[10px] font-bold tracking-widest uppercase mb-2">
        <span>⚡ Interactive Diagnostic Engine</span>
      </div>
      <h3 class="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight uppercase">
        Systemic Discrepancy Simulator
      </h3>
      <p class="text-xs text-slate-400 mt-1">
        // Adjust structural parameters to simulate the cascade across teacher salaries, shadow markets, and student burden.
      </p>
    </div>
    <button
      onclick={resetDefaults}
      class="self-start sm:self-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer"
    >
      Reset Baseline
    </button>
  </div>

  <!-- Interactive Sliders Grid -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
    <!-- Slider 1: Provincial Funding -->
    <div class="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
      <div class="flex justify-between text-xs">
        <span class="text-slate-400">Provincial Student Fund</span>
        <span class="text-blue-400 font-bold">Rs. {provincialFundingPerStudent.toLocaleString()}/yr</span>
      </div>
      <input
        type="range"
        min="3000"
        max="12000"
        step="500"
        bind:value={provincialFundingPerStudent}
        class="w-full accent-blue-500 cursor-pointer"
      />
      <div class="flex justify-between text-[10px] text-slate-500">
        <span>Rs. 3k (Severely Underfunded)</span>
        <span>Rs. 12k (Parity+)</span>
      </div>
    </div>

    <!-- Slider 2: Teacher Base Monthly Salary -->
    <div class="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
      <div class="flex justify-between text-xs">
        <span class="text-slate-400">Teacher Base Salary</span>
        <span class="text-[var(--color-gold)] font-bold">Rs. {teacherBaseMonthlySalary.toLocaleString()}/mo</span>
      </div>
      <input
        type="range"
        min="40000"
        max="120000"
        step="2500"
        bind:value={teacherBaseMonthlySalary}
        class="w-full accent-amber-400 cursor-pointer"
      />
      <div class="flex justify-between text-[10px] text-slate-500">
        <span>Rs. 40k (Crisis)</span>
        <span>Rs. 120k (Living Wage)</span>
      </div>
    </div>

    <!-- Slider 3: Household Tuition Spend -->
    <div class="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
      <div class="flex justify-between text-xs">
        <span class="text-slate-400">Household Tuition Spend</span>
        <span class="text-red-400 font-bold">{householdTuitionSpendPercent}% of total</span>
      </div>
      <input
        type="range"
        min="10"
        max="70"
        step="1"
        bind:value={householdTuitionSpendPercent}
        class="w-full accent-red-500 cursor-pointer"
      />
      <div class="flex justify-between text-[10px] text-slate-500">
        <span>10% (Targeted help)</span>
        <span>70% (Extreme drain)</span>
      </div>
    </div>
  </div>

  <!-- Simulated Output Metrics Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
    <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
      <span class="text-2xl sm:text-3xl font-bold block mb-1 text-blue-400">
        {fundingDisparityRatio}x
      </span>
      <span class="text-[10px] uppercase tracking-wider text-slate-400">
        National vs. Provincial Gap
      </span>
      <span class="text-[9px] block text-slate-500 mt-1">
        {provincialFundingPerStudent >= 10000 ? '✅ Parity Reached' : '⚠️ Systemic inequity'}
      </span>
    </div>

    <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
      <span class="text-2xl sm:text-3xl font-bold block mb-1 text-[var(--color-gold)]">
        {estimatedMoonlightingNecessity}%
      </span>
      <span class="text-[10px] uppercase tracking-wider text-slate-400">
        Moonlighting Necessity
      </span>
      <span class="text-[9px] block text-slate-500 mt-1">
        {teacherBaseMonthlySalary >= 90000 ? '✅ Living wage threshold' : '⚠️ Forcing dual employment'}
      </span>
    </div>

    <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
      <span class="text-2xl sm:text-3xl font-bold block mb-1 text-red-400">
        {estimatedStudentDayHours} hrs
      </span>
      <span class="text-[10px] uppercase tracking-wider text-slate-400">
        Avg Daily Study Burden
      </span>
      <span class="text-[9px] block text-slate-500 mt-1">
        {parseFloat(estimatedStudentDayHours) > 10 ? '🚨 Severe child burnout' : 'Moderate schedule'}
      </span>
    </div>

    <div class="p-4 bg-slate-950/80 rounded-2xl border border-slate-800">
      <span class="text-2xl sm:text-3xl font-bold block mb-1 text-purple-400">
        Rs. {annualShadowMarketCapBn}Bn
      </span>
      <span class="text-[10px] uppercase tracking-wider text-slate-400">
        Shadow Economy Cap
      </span>
      <span class="text-[9px] block text-slate-500 mt-1">
        Extracted from families annually
      </span>
    </div>
  </div>

  <div class="mt-8 p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3">
    <span class="text-base text-[var(--color-gold)]">💡</span>
    <p class="leading-relaxed">
      <strong>Policy Synthesis:</strong> When teachers earn a living wage (&gt;Rs. 90,000) and provincial school funding reaches parity with national schools, the economic necessity for the Rs. 210Bn shadow tuition machine naturally declines, reducing student study days from 14 hours back to human proportions.
    </p>
  </div>
</div>
