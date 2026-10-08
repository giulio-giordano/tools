<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import DocxFileList from './DocxFileList.vue'
import PrivacyNotice from '../../components/PrivacyNotice.vue'
import { convertDocxBatch, createPdfArchive } from './convert-batch'
import { createDocxQueueItems, partitionDocxFiles, type DocxItemError, type DocxItemStatus, type DocxQueueItem } from './docx-files'
import { usePreferencesStore } from '../../stores/preferences'

const preferences = usePreferencesStore()
const files = ref<DocxQueueItem[]>([])
const invalidFileNames = ref<string[]>([])
const isDragging = ref(false)
const isConverting = ref(false)
const archiveUrl = ref('')
const archiveError = ref(false)
const resultCounts = ref<{ successCount: number; failureCount: number } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const invalidMessage = computed(() => invalidFileNames.value.length
  ? preferences.t('invalidDocxFiles', { names: invalidFileNames.value.join(', ') })
  : '')

function clearResult() {
  if (archiveUrl.value) URL.revokeObjectURL(archiveUrl.value)
  archiveUrl.value = ''
  archiveError.value = false
  resultCounts.value = null
}

function addFiles(fileList: FileList | null) {
  if (!fileList?.length || isConverting.value) return

  clearResult()
  const selection = partitionDocxFiles(fileList)
  files.value = [...files.value, ...createDocxQueueItems(selection.accepted)]
  invalidFileNames.value = selection.rejected.map((file) => file.name)
}

function onFileSelection(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  addFiles(input.files)
  input.value = ''
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (!isConverting.value) isDragging.value = true
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  addFiles(event.dataTransfer?.files ?? null)
}

function removeFile(id: string) {
  clearResult()
  files.value = files.value.filter((item) => item.id !== id)
}

function onRename(id: string) {
  clearResult()
  const item = files.value.find((candidate) => candidate.id === id)
  if (item) {
    item.status = 'ready'
    delete item.error
  }
}

function updateFileStatus(id: string, status: DocxItemStatus, error?: DocxItemError) {
  const item = files.value.find((candidate) => candidate.id === id)
  if (!item) return
  item.status = status
  item.error = error
}

async function convertAndArchive() {
  if (isConverting.value || files.value.length === 0) return

  clearResult()
  invalidFileNames.value = []
  isConverting.value = true
  try {
    const result = await convertDocxBatch(files.value, updateFileStatus)
    resultCounts.value = { successCount: result.pdfs.length, failureCount: result.failures.length }
    if (result.pdfs.length > 0) {
      const archive = createPdfArchive(result.pdfs)
      const archiveBuffer = new ArrayBuffer(archive.byteLength)
      new Uint8Array(archiveBuffer).set(archive)
      archiveUrl.value = URL.createObjectURL(new Blob([archiveBuffer], { type: 'application/zip' }))
    }
  } catch {
    archiveError.value = true
  } finally {
    isConverting.value = false
  }
}

onBeforeUnmount(clearResult)
</script>

<template>
  <section class="py-7 sm:py-9 xl:py-10">
    <div class="mb-6">
      <h1 class="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
        {{ preferences.t('docxPdfHeading') }}
      </h1>
      <p class="mt-2 max-w-3xl text-base leading-7 text-neutral-600">
        {{ preferences.t('docxPdfIntroduction') }}
      </p>
    </div>

    <PrivacyNotice />
    <p class="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      {{ preferences.t('docxFidelityNotice') }}
    </p>

    <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <input
        ref="fileInput"
        class="hidden"
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        :disabled="isConverting"
        tabindex="-1"
        aria-hidden="true"
        @change="onFileSelection"
      />
      <div class="grid xl:grid-cols-[minmax(17rem,0.78fr)_minmax(0,1.5fr)]">
        <div class="border-b border-neutral-200 p-5 sm:p-7 xl:border-b-0 xl:border-r">
          <div
            class="flex min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-8 text-center transition"
            :class="isDragging ? 'border-neutral-950 bg-neutral-100' : 'border-neutral-300 bg-neutral-50/70'"
            @dragenter="onDragOver"
            @dragover="onDragOver"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
          >
            <span class="grid size-12 place-items-center rounded-2xl bg-white text-neutral-700 shadow-sm">
              <svg aria-hidden="true" class="size-6" fill="none" viewBox="0 0 24 24">
                <path d="M12 16V4m0 0L8 8m4-4 4 4M5 14v5h14v-5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
              </svg>
            </span>
            <p class="mt-3 text-sm font-semibold text-neutral-900">{{ preferences.t('docxDropzoneTitle') }}</p>
            <p class="mt-1 text-sm text-neutral-500">{{ preferences.t('docxDropzoneHint') }}</p>
            <button
              type="button"
              :disabled="isConverting"
              class="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
              @click="fileInput?.click()"
            >
              <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
                <path d="M4 7.5h6l2 2H20v9H4z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" />
                <path d="M12 12v4m0-4-2 2m2-2 2 2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
              </svg>
              {{ preferences.t('chooseDocxFiles') }}
            </button>
          </div>
        </div>

        <div class="min-w-0 p-5 sm:p-7">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-base font-semibold tracking-tight text-neutral-950">{{ preferences.t('selectedFiles') }}</h2>
            <span class="rounded-full bg-neutral-100 px-3 py-1 font-mono text-xs text-neutral-600" aria-live="polite">
              {{ preferences.t('fileCount', { count: files.length }) }}
            </span>
          </div>

          <p v-if="files.length === 0" class="mt-4 flex min-h-44 items-center justify-center rounded-2xl bg-neutral-50 px-5 text-center text-sm text-neutral-500">
            {{ preferences.t('noFilesSelected') }}
          </p>
          <DocxFileList
            v-else
            class="mt-4"
            :files="files"
            :disabled="isConverting"
            @remove="removeFile"
            @rename="onRename"
          />
          <p v-if="invalidMessage" role="alert" class="mt-4 text-sm text-red-700">{{ invalidMessage }}</p>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              :disabled="files.length === 0 || isConverting"
              class="inline-flex items-center justify-center rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
              @click="convertAndArchive"
            >
              {{ isConverting ? preferences.t('convertingDocxFiles') : preferences.t('convertDocxFiles') }}
            </button>
            <a
              v-if="archiveUrl"
              :href="archiveUrl"
              :download="preferences.t('pdfArchiveFilename')"
              class="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {{ preferences.t('downloadPdfArchive') }}
            </a>
          </div>
          <p v-if="isConverting" role="status" class="mt-4 text-sm text-neutral-600">
            {{ preferences.t('convertingDocxFiles') }}
          </p>
          <p v-else-if="archiveError" role="alert" class="mt-4 text-sm text-red-700">
            {{ preferences.t('archiveCreationFailed') }}
          </p>
          <p v-else-if="resultCounts && resultCounts.successCount > 0" role="status" class="mt-4 text-sm text-emerald-800">
            {{ preferences.t('conversionSuccess', resultCounts) }}
          </p>
          <p v-else-if="resultCounts" role="alert" class="mt-4 text-sm text-red-700">
            {{ preferences.t('conversionNoSuccess') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
