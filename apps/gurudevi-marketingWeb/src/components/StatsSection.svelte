<script lang="ts">
const statDefs = [
  {
    key: 'teachers_count' as const,
    label: 'Teachers',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  },
  {
    key: 'students_count' as const,
    label: 'Students',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 8 16 8 13.01 9.34 13.01 11s1.33 3 2.99 3zM9 11c1.66 0 2.99-1.34 2.99-3S10.66 8 9 8 6.01 9.34 6.01 11s1.33 3 2.99 3zm7 3c-2.33 0-7 1.17-7 3.5V19h14v-1.5c0-2.33-4.67-3.5-7-3.5zm-7 0c-2.33 0-7 1.17-7 3.5V19h5v-1.5c0-1.07.36-2.02.93-2.82C9.57 14.25 9.3 14 9 14z"/></svg>`,
  },
  {
    key: 'schools_count' as const,
    label: 'Schools',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
  },
  {
    key: 'lessons_shared_count' as const,
    label: 'Lessons Shared',
    icon: `<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z"/></svg>`,
  },
];

const stats = {
  teachers_count: 0,
  students_count: 0,
  schools_count: 0,
  lessons_shared_count: 0,
};

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
</script>

<div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
  {#each statDefs as stat}
    {@const value = stats[stat.key]}
    <div class="text-center space-y-2 p-6 group">
      <div
        class="w-16 h-16 mx-auto bg-sage-green/10 rounded-2xl flex items-center justify-center text-sage-green group-hover:bg-sage-green group-hover:text-white transition-all duration-300 transform group-hover:rotate-6"
      >
        {@html stat.icon}
      </div>
      <div class="text-4xl font-bold text-charcoal-truth">
        {formatCount(value)}
      </div>
      <div class="text-sm text-mud-brown/60 uppercase tracking-widest font-semibold">
        {stat.label}
      </div>
    </div>
  {/each}
</div>
