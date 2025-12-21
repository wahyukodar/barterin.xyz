<script lang="ts">
  export let icon: string;
  export let title: string;
  export let desc: string;
</script>

<div class="p-6 rounded-2xl bg-white shadow">
  <div class="text-3xl mb-3">{icon}</div>
  <div class="font-bold text-lg mb-1">{title}</div>
  <div class="text-slate-500">{desc}</div>
</div>
