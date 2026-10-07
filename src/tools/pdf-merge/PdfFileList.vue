<script setup lang="ts">
import { ref } from 'vue'
import { usePreferencesStore } from '../../stores/preferences'

const props = defineProps<{
  files: File[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  move: [from: number, to: number]
  remove: [index: number]
}>()

const preferences = usePreferencesStore()
const draggedIndex = ref<number | null>(null)

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function startDrag(index: number, event: DragEvent) {
  if (props.disabled) return
  draggedIndex.value = index
  event.dataTransfer?.setData('text/plain', String(index))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

function dropOn(index: number, event: DragEvent) {
  const source = draggedIndex.value ?? Number(event.dataTransfer?.getData('text/plain'))
  if (Number.isInteger(source) && source >= 0 && source < props.files.length && source !== index) {
    emit('move', source, index)
  }
  draggedIndex.value = null
}
</script>

<template>
  <ol class="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200" :aria-label="preferences.t('selectedFiles')">
    <li
      v-for="(file, index) in files"
      :key="`${file.name}-${file.lastModified}-${index}`"
      class="flex items-center gap-3 px-4 py-3"
      :draggable="!disabled"
      @dragstart="startDrag(index, $event)"
      @dragover.prevent
      @drop.prevent="dropOn(index, $event)"
      @dragend="draggedIndex = null"
    >
      <span aria-hidden="true" class="cursor-grab text-neutral-400">⠿</span>
      <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-[10px] font-bold tracking-wide text-rose-700">
        <svg aria-hidden="true" class="size-5" fill="none" viewBox="0 0 24 24">
          <path d="M6 3.75h8l4.25 4.5v12H6z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" />
          <path d="M14 4v5h4M9 15h6" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
        </svg>
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-neutral-900">{{ file.name }}</span>
        <span class="mt-1 block text-xs text-neutral-500">{{ formatFileSize(file.size) }}</span>
      </span>
      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-30"
          :aria-label="preferences.t('moveUp', { name: file.name })"
          :disabled="disabled || index === 0"
          @click="emit('move', index, index - 1)"
        >
          <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
            <path d="m7 14 5-5 5 5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
          </svg>
        </button>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-30"
          :aria-label="preferences.t('moveDown', { name: file.name })"
          :disabled="disabled || index === files.length - 1"
          @click="emit('move', index, index + 1)"
        >
          <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
            <path d="m7 10 5 5 5-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
          </svg>
        </button>
        <button
          type="button"
          class="grid size-9 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-30"
          :aria-label="preferences.t('removeFile', { name: file.name })"
          :disabled="disabled"
          @click="emit('remove', index)"
        >
          <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
            <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
          </svg>
        </button>
      </div>
    </li>
  </ol>
</template>
