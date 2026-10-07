<script setup lang="ts">
import ToolCard from '../components/ToolCard.vue'
</script>

<template>
  <section class="py-16 sm:py-24">
    <div class="max-w-3xl">
      <p class="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">Strumenti digitali</p>
      <h1 class="mt-5 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-6xl">
        Piccoli strumenti.<br />
        Meno attrito.
      </h1>
      <p class="mt-6 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
        Utilità semplici per attività quotidiane. I tuoi file restano sul tuo dispositivo.
      </p>
    </div>

    <div class="mt-14 flex items-end justify-between border-b border-black pb-3">
      <h2 class="text-sm font-semibold">Strumenti disponibili</h2>
      <span class="font-mono text-xs text-neutral-500">01 / 01</span>
    </div>
    <div class="mt-5 grid max-w-md grid-cols-1 gap-4">
      <ToolCard
        index="01"
        title="Unisci PDF"
        description="Combina più documenti in un unico PDF, nell'ordine che preferisci."
        to="/pdf-merge"
      />
    </div>
  </section>
</template>
