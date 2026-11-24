<script lang="ts">
  export interface VoiceSlide {
    id: string;
    quote: string;
    attribution: string;
    role: string;
    place: string;
    imageSrc: string;
    imageAlt: string;
    credit?: string;
    isPlaceholderQuote?: boolean;
  }

  let {
    slides,
    label = 'Voices from the field',
  }: {
    slides: VoiceSlide[];
    label?: string;
  } = $props();

  let track: HTMLDivElement | undefined = $state();
  let activeIndex = $state(0);

  function scrollToSlide(index: number) {
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    const child = track.children[clamped] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      activeIndex = clamped;
    }
  }

  function handleScroll() {
    if (!track) return;
    const width = track.clientWidth;
    if (width <= 0) return;
    const idx = Math.round(track.scrollLeft / width);
    activeIndex = Math.max(0, Math.min(idx, slides.length - 1));
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToSlide(activeIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToSlide(activeIndex - 1);
    }
  }
</script>

<div
  class="relative overflow-hidden"
  role="region"
  aria-roledescription="carousel"
  aria-label={label}
  onkeydown={handleKeydown}
>
  <div
    bind:this={track}
    onscroll={handleScroll}
    class="flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-0 pb-2 no-scrollbar"
    style="scrollbar-width: none;"
    tabindex="0"
  >
    {#each slides as slide, i (slide.id)}
      <article
        class="w-full min-w-full shrink-0 snap-start grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center"
        aria-roledescription="slide"
        aria-label={`${i + 1} of ${slides.length}`}
      >
        <div class="lg:col-span-6">
          <div class="overflow-hidden aspect-[4/3] bg-[#ede9e0]">
            <img
              src={slide.imageSrc}
              alt={slide.imageAlt}
              loading="lazy"
              decoding="async"
              class="w-full h-full object-cover"
            />
          </div>
          {#if slide.credit}
            <p class="mt-2.5 text-[11px] font-ui text-[var(--color-mutedInk)]/75">
              {slide.credit}
            </p>
          {/if}
        </div>

        <div class="lg:col-span-6 space-y-6 lg:pr-12">
          <div class="inline-flex items-center gap-3 text-xs font-ui font-semibold uppercase tracking-widest text-[var(--color-gold)]">
            <span>{slide.place}</span>
            {#if slide.isPlaceholderQuote}
              <span class="text-[var(--color-mutedInk)]/70 normal-case tracking-normal font-normal">
                &middot; Field illustration
              </span>
            {/if}
          </div>

          <blockquote class="font-text text-2xl sm:text-3xl md:text-[32px] leading-[1.4] text-[var(--color-primaryInk)] italic">
            &ldquo;{slide.quote}&rdquo;
          </blockquote>

          <footer class="pt-5 border-t border-[var(--color-primaryInk)]/12 flex items-center justify-between gap-4">
            <div>
              <div class="font-ui text-sm font-semibold text-[var(--color-primaryInk)]">
                {slide.attribution}
              </div>
              <div class="font-ui text-xs text-[var(--color-mutedInk)]">
                {slide.role}
              </div>
            </div>
            <div class="font-ui text-xs text-[var(--color-mutedInk)] tabular-nums">
              {i + 1} / {slides.length}
            </div>
          </footer>
        </div>
      </article>
    {/each}
  </div>

  <!-- Minimal Editorial Controls -->
  <div class="mt-8 pt-6 border-t border-[var(--color-primaryInk)]/12 flex items-center justify-between gap-4">
    <div class="flex items-center gap-2.5" role="tablist" aria-label="Slide indicators">
      {#each slides as slide, i (slide.id)}
        <button
          type="button"
          role="tab"
          aria-selected={activeIndex === i}
          aria-label={`Go to slide ${i + 1}`}
          onclick={() => scrollToSlide(i)}
          class={`h-[3px] transition-all duration-300 cursor-pointer focus-ring ${
            activeIndex === i
              ? 'w-10 bg-[var(--color-primaryInk)]'
              : 'w-4 bg-[var(--color-primaryInk)]/25 hover:bg-[var(--color-primaryInk)]/50'
          }`}
        ></button>
      {/each}
    </div>

    <div class="flex items-center gap-4">
      <button
        type="button"
        onclick={() => scrollToSlide(activeIndex - 1)}
        disabled={activeIndex === 0}
        aria-label="Previous slide"
        class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border-b border-[var(--color-primaryInk)]/30 text-[var(--color-primaryInk)] hover:border-[var(--color-primaryInk)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-ring cursor-pointer font-ui text-sm"
      >
        &larr; Prev
      </button>
      <button
        type="button"
        onclick={() => scrollToSlide(activeIndex + 1)}
        disabled={activeIndex === slides.length - 1}
        aria-label="Next slide"
        class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center border-b border-[var(--color-primaryInk)]/30 text-[var(--color-primaryInk)] hover:border-[var(--color-primaryInk)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-ring cursor-pointer font-ui text-sm"
      >
        Next &rarr;
      </button>
    </div>
  </div>
</div>
