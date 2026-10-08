<script setup lang="ts">
import type { DocxQueueItem } from './docx-files'
import { usePreferencesStore } from '../../stores/preferences'

const props = defineProps<{
  files: DocxQueueItem[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  remove: [id: string]
  rename: [id: string, name: string]
}>()

const preferences = usePreferencesStore()

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function statusLabel(item: DocxQueueItem): string {
  if (item.status === 'converting') return preferences.t('fileStatusConverting')
  if (item.status === 'converted') return preferences.t('fileStatusConverted')
  if (item.status === 'failed') return preferences.t('fileStatusFailed')
  return preferences.t('fileStatusReady')
}

function updateName(item: DocxQueueItem, event: Event) {
  const input = event.currentTarget as HTMLInputElement
  item.pdfName = input.value
  item.status = 'ready'
  delete item.error
  emit('rename', item.id, item.pdfName)
}
</script>

<template>
  <ol class="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200" :aria-label="preferences.t('selectedFiles')">
    <li v-for="item in props.files" :key="item.id" class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-[10px] font-bold tracking-wide text-sky-800">
        DOCX
      </span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-medium text-neutral-900">{{ item.file.name }}</span>
        <span class="mt-1 block text-xs text-neutral-500">{{ formatFileSize(item.file.size) }} · {{ statusLabel(item) }}</span>
      </span>
      <div class="flex min-w-0 flex-1 items-end gap-2">
        <div class="min-w-0 flex-1">
          <label :for="`pdf-name-${item.id}`" class="block text-xs font-medium text-neutral-600">
            {{ preferences.t('outputPdfNameFor', { name: item.file.name }) }}
          </label>
          <input
            :id="`pdf-name-${item.id}`"
            :value="item.pdfName"
            class="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 disabled:bg-neutral-100"
            type="text"
            maxlength="120"
            :disabled="props.disabled"
            @input="updateName(item, $event)"
          />
          <p v-if="item.error" role="alert" class="mt-1 text-xs text-red-700">
            {{ item.error === 'invalid-name' ? preferences.t('invalidPdfName') : preferences.t('fileConversionFailed') }}
          </p>
        </div>
        <button
          type="button"
          class="grid size-10 shrink-0 place-items-center rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-30"
          :aria-label="preferences.t('removeFile', { name: item.file.name })"
          :disabled="props.disabled"
          @click="emit('remove', item.id)"
        >
          <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
            <path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-linecap="round" stroke-width="1.5" />
          </svg>
        </button>
      </div>
    </li>
  </ol>
</template>
