<template>
  <section class="py-12 sm:py-20">
    <RouterLink
      class="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-black"
      :to="{ name: 'home' }"
    >
      <span aria-hidden="true">←</span>
      Tutti gli strumenti
    </RouterLink>

    <div class="mt-10 max-w-3xl">
      <p class="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">Strumento 01</p>
      <h1 class="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
        Unisci file PDF
      </h1>
      <p class="mt-5 max-w-2xl text-base leading-7 text-neutral-600">
        Combina i tuoi documenti in un unico file. I PDF verranno elaborati localmente nel browser.
      </p>
    </div>

    <div class="mt-10 border border-dashed border-neutral-300 bg-white p-8 text-center sm:p-14">
      <p class="text-sm text-neutral-600">Aggiungerai qui i file da unire.</p>
    </div>
  </section>
</template>
