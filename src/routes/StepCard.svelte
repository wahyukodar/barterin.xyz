<script lang="ts">
  export let idx: number;
  export let img: string;
  export let title: string;
  export let desc: string;
</script>

<div class="flex items-start gap-4">
  <img src="{img}" class="w-14 h-14 rounded-lg bg-white/60 p-2" alt="step-{idx}" />
  <div>
    <div class="font-semibold">{title}</div>
    {#if desc}
      <div class="text-slate-500 text-sm mt-1">{desc}</div>
    {/if}
  </div>
</div>
