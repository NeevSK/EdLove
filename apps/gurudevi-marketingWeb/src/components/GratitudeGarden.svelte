<script lang="ts">
/**
 * Thuthimal Gratitude Garden
 * Interactive visual gratitude wall for gurudevi-marketingWeb
 */

interface Tribute {
  id: string;
  flower: string;
  teacherName: string;
  district: string;
  subject: string;
  message: string;
  from: string;
  batch: string;
}

const tributes: Tribute[] = [
  {
    id: '1',
    flower: '🪷',
    teacherName: 'Mrs. Bandara',
    district: 'Kandy',
    subject: 'Biology & Environmental Science',
    message: 'For teaching us that life is not a syllabus to memorise, but a living ecosystem to protect. Your warmth in the laboratory shaped my entire career in ecology.',
    from: 'Pasan',
    batch: 'Batch 2018'
  },
  {
    id: '2',
    flower: '🌸',
    teacherName: 'Mr. Sivalingam',
    district: 'Jaffna',
    subject: 'Pure Mathematics',
    message: 'When I was ready to give up after failing my first term exam, you stayed after school for three weeks just to rebuild my confidence from ground up.',
    from: 'Tharshini',
    batch: 'Batch 2015'
  },
  {
    id: '3',
    flower: '🌼',
    teacherName: 'Miss Jayawardena',
    district: 'Galle',
    subject: 'Sinhala Literature',
    message: 'You taught us the rhythm of language and the dignity of our cultural roots. May you always be surrounded by peace and honor.',
    from: 'Kavindi',
    batch: 'Batch 2021'
  },
  {
    id: '4',
    flower: '🌺',
    teacherName: 'Mr. Fernando',
    district: 'Colombo',
    subject: 'Physics',
    message: 'A teacher who never needed to raise his voice. Your patience and clear demonstrations turned abstract equations into pure wonder.',
    from: 'Minura',
    batch: 'Batch 2019'
  },
  {
    id: '5',
    flower: '🌻',
    teacherName: 'Mrs. Selvarajah',
    district: 'Batticaloa',
    subject: 'English Language',
    message: 'You gave a village child the courage to speak without fear. That gift of confidence has carried me across continents.',
    from: 'Niroshan',
    batch: 'Batch 2016'
  },
  {
    id: '6',
    flower: '🌷',
    teacherName: 'Venerable Dhammarakkhitha Thero',
    district: 'Anuradhapura',
    subject: 'Buddhism & Philosophy',
    message: 'For showing us that true education begins in the stillness of the mind and the gentleness of one’s actions.',
    from: 'Saman',
    batch: 'Batch 2014'
  }
];

let selectedDistrict = $state('All');
let activeTribute = $state<Tribute | null>(tributes[0] ?? null);

const districts = ['All', 'Kandy', 'Jaffna', 'Galle', 'Colombo', 'Batticaloa', 'Anuradhapura'];

let filteredTributes = $derived(
  selectedDistrict === 'All' 
    ? tributes 
    : tributes.filter(t => t.district === selectedDistrict)
);
</script>

<div class="my-16 rounded-3xl bg-temple-stone/40 border border-charcoal-truth/10 p-8 sm:p-12 shadow-sm text-charcoal-truth">
  <div class="text-center max-w-2xl mx-auto mb-10 space-y-3">
    <span class="inline-block text-xs font-mono uppercase tracking-[0.3em] font-bold text-sanctuary-saffron">
      🌸 The Living Wall of Gratitude
    </span>
    <h3 class="text-3xl sm:text-4xl font-display font-bold text-charcoal-truth tracking-tight">
      Thuthimal Garden (තුතිමල් උයන)
    </h3>
    <p class="font-serif text-sm sm:text-base text-charcoal-truth/70 italic leading-relaxed">
      "Every flower represents a token of gratitude and reciprocal patronage from a student, honoring a teacher who changed their life."
    </p>
  </div>

  <!-- District Filter Pills -->
  <div class="flex flex-wrap justify-center gap-2 mb-8">
    {#each districts as district}
      <button
        onclick={() => selectedDistrict = district}
        class="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer {selectedDistrict === district ? 'bg-sanctuary-saffron text-white shadow-sm' : 'bg-white/60 hover:bg-white text-charcoal-truth/70 border border-charcoal-truth/10'}"
      >
        {district}
      </button>
    {/each}
  </div>

  <!-- Main Interactive Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Tribute Tiles Grid -->
    <div class="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {#each filteredTributes as tribute (tribute.id)}
        <button
          onclick={() => activeTribute = tribute}
          class="text-left p-5 rounded-2xl transition-all duration-300 border cursor-pointer group {activeTribute?.id === tribute.id ? 'bg-white border-sanctuary-saffron shadow-md ring-2 ring-sanctuary-saffron/20' : 'bg-white/60 hover:bg-white border-charcoal-truth/10 hover:border-sanctuary-saffron/40'}"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-3xl group-hover:scale-110 transition-transform duration-300">{tribute.flower}</span>
            <span class="text-[10px] font-mono uppercase tracking-wider text-charcoal-truth/50 bg-temple-stone/60 px-2 py-0.5 rounded-full">
              {tribute.district}
            </span>
          </div>
          <h4 class="font-display font-bold text-base text-charcoal-truth group-hover:text-sanctuary-saffron transition-colors">
            {tribute.teacherName}
          </h4>
          <p class="text-xs text-charcoal-truth/60 font-content line-clamp-2 mt-1">
            {tribute.subject}
          </p>
        </button>
      {/each}
    </div>

    <!-- Active Tribute Letter View -->
    <div class="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-charcoal-truth/10 shadow-lg space-y-6 relative overflow-hidden">
      <div class="absolute top-0 right-0 w-24 h-24 bg-sanctuary-saffron/5 rounded-full blur-2xl pointer-events-none"></div>

      {#if activeTribute}
        <div class="flex items-center gap-4 border-b border-charcoal-truth/10 pb-4">
          <span class="text-4xl">{activeTribute.flower}</span>
          <div>
            <h4 class="font-display font-bold text-xl text-charcoal-truth">
              {activeTribute.teacherName}
            </h4>
            <p class="text-xs font-mono text-sanctuary-saffron uppercase tracking-wider">
              {activeTribute.subject} • {activeTribute.district}
            </p>
          </div>
        </div>

        <blockquote class="font-serif text-sm sm:text-base text-charcoal-truth/80 italic leading-relaxed bg-temple-stone/20 p-5 rounded-2xl border-l-2 border-sanctuary-saffron">
          "{activeTribute.message}"
        </blockquote>

        <div class="flex justify-between items-center text-xs font-mono text-charcoal-truth/60 pt-2">
          <span>From: <strong class="text-charcoal-truth font-semibold">{activeTribute.from}</strong></span>
          <span class="text-charcoal-truth/40">{activeTribute.batch}</span>
        </div>
      {:else}
        <p class="text-center text-sm font-serif text-charcoal-truth/50 py-12">
          Select a flower to read the tribute.
        </p>
      {/if}
    </div>
  </div>
</div>
