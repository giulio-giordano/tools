<template>
  <header class="border-b border-black/10 bg-white">
    <div class="mx-auto flex min-h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
      <RouterLink class="inline-flex items-center gap-3 text-black no-underline" :to="{ name: 'home' }">
        <span class="grid size-9 place-items-center bg-black text-sm font-bold text-white">T</span>
        <span class="text-sm font-semibold tracking-tight">Toolbox</span>
      </RouterLink>

      <nav aria-label="Navigazione principale" class="flex items-center gap-5 text-sm">
        <RouterLink
          class="text-neutral-500 transition hover:text-black"
          active-class="!text-black"
          :to="{ name: 'home' }"
        >
          Strumenti
        </RouterLink>
        <RouterLink
          class="text-neutral-500 transition hover:text-black"
          active-class="!text-black"
          :to="{ name: 'pdf-merge' }"
        >
          Unisci PDF
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
