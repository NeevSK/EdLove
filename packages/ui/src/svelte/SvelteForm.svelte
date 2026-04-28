<script lang="ts">
import { type FormConfig, FormManager, type FormState } from '@repo/core';
import { onDestroy } from 'svelte';

let { config }: { config: FormConfig<any> } = $props();

const manager = new FormManager(config);
let _state: FormState<any> = $state(manager.getState());

const unsubscribe = manager.subscribe((s) => {
  _state = s;
});

onDestroy(unsubscribe);

async function _handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  await manager.submit();
}
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#each Object.entries(config.fields) as [key, field]}
      <div class={field.type === 'textarea' ? 'md:col-span-2' : ''}>
        <label class="block space-y-2">
          <span class="text-sm font-semibold text-mud-brown/80">{field.label}{field.required ? '*' : ''}</span>
          
          {#if field.type === 'textarea'}
            <textarea
              class="w-full min-h-32 rounded-2xl border border-mud-brown/20 bg-temple-stone/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40"
              bind:value={state.values[key]}
              placeholder={field.placeholder}
              onblur={() => manager.validateField(key)}
            ></textarea>
          {:else if field.type === 'select'}
            <select
              class="w-full rounded-xl border border-mud-brown/20 bg-temple-stone/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40"
              bind:value={state.values[key]}
              onchange={() => manager.validateField(key)}
            >
              {#if field.options}
                {#each field.options as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              {/if}
            </select>
          {:else}
            <input
              type={field.type}
              class="w-full rounded-xl border border-mud-brown/20 bg-temple-stone/20 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanctuary-saffron/40"
              bind:value={state.values[key]}
              placeholder={field.placeholder}
              onblur={() => manager.validateField(key)}
            />
          {/if}

          {#if state.errors[key]}
            <p class="text-xs text-ember-red mt-1">{state.errors[key]}</p>
          {/if}
        </label>
      </div>
    {/each}
  </div>

  <div class="flex items-center justify-between gap-4 pt-4">
    <button
      type="submit"
      class="px-8 py-3 bg-void-indigo text-sacred-white rounded-full font-bold shadow-lg hover:bg-peacock-blue transition-all disabled:opacity-50"
      disabled={state.isSubmitting}
    >
      {state.isSubmitting ? 'Sending...' : 'Submit'}
    </button>

    {#if state.submitSuccess}
      <p class="text-sm text-sage-green font-medium">Successfully sent!</p>
    {/if}
    
    {#if state.submitError}
      <p class="text-sm text-ember-red font-medium">{state.submitError}</p>
    {/if}
  </div>
</form>

<style>
  /* Base styles for the form */
  .text-mud-brown { color: #5D4037; }
  .text-ember-red { color: #D32F2F; }
  .text-sage-green { color: #388E3C; }
  .bg-void-indigo { background-color: #1A237E; }
  .bg-temple-stone\/20 { background-color: rgba(224, 224, 224, 0.2); }
</style>
