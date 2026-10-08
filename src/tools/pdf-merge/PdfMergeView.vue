<script setup lang="ts">
import { computed, ref } from 'vue'
import PdfFileList from './PdfFileList.vue'
import PrivacyNotice from '../../components/PrivacyNotice.vue'
import { PdfMergeError, mergePdfFiles, type PdfMergeErrorCode } from './merge-pdfs'
import { usePreferencesStore } from '../../stores/preferences'

const preferences = usePreferencesStore()
const files = ref<File[]>([])
const outputName = ref('merged.pdf')
const isDragging = ref(false)
const isMerging = ref(false)
const errorCode = ref<PdfMergeErrorCode | 'merge-failed' | null>(null)
const errorFileName = ref('')
const isComplete = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const errorMessage = computed(() => {
  switch (errorCode.value) {
    case 'minimum-files':
      return preferences.t('minimumFiles')
    case 'invalid-pdf':
      return preferences.t('invalidPdf')
    case 'unreadable-pdf':
      return preferences.t('unreadablePdf', { name: errorFileName.value })
    case 'merge-failed':
      return preferences.t('mergeFailed')
    default:
      return ''
  }
})

function addFiles(fileList: FileList | null) {
  if (!fileList?.length) return
  files.value = [...files.value, ...Array.from(fileList)]
  errorCode.value = null
  isComplete.value = false
}

function onFileSelection(event: Event) {
  const input = event.currentTarget as HTMLInputElement
  addFiles(input.files)
  input.value = ''
}

function onDragOver(event: DragEvent) {
  event.preventDefault()
  if (!isMerging.value) isDragging.value = true
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  if (isMerging.value) return
  addFiles(event.dataTransfer?.files ?? null)
}

function moveFile(from: number, to: number) {
  if (from < 0 || from >= files.value.length || to < 0 || to >= files.value.length) return
  const nextFiles = [...files.value]
  const [file] = nextFiles.splice(from, 1)
  if (!file) return
  nextFiles.splice(to, 0, file)
  files.value = nextFiles
  errorCode.value = null
  isComplete.value = false
}

function removeFile(index: number) {
  files.value = files.value.filter((_, fileIndex) => fileIndex !== index)
  errorCode.value = null
  isComplete.value = false
}

function outputFileName(): string {
  const name = outputName.value.trim() || 'merged.pdf'
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`
}

async function mergeAndDownload() {
  errorCode.value = null
  isComplete.value = false
  isMerging.value = true

  try {
    const bytes = await mergePdfFiles(files.value)
    const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputFileName()
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    isComplete.value = true
  } catch (error) {
    if (error instanceof PdfMergeError) {
      errorCode.value = error.code
      errorFileName.value = error.fileName ?? ''
    } else {
      errorCode.value = 'merge-failed'
    }
  } finally {
    isMerging.value = false
  }
}
</script>

<template>
  <section class="py-7 sm:py-9 xl:py-10">
    <div class="mb-4">
      <h1 class="text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
        {{ preferences.t('pdfMergeHeading') }}
      </h1>
      <p class="mt-2 max-w-3xl text-base leading-7 text-neutral-600">
        {{ preferences.t('pdfMergeIntroduction') }}
      </p>
    </div>
    <PrivacyNotice />

    <div class="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      <input
        ref="fileInput"
        class="hidden"
        type="file"
        accept=".pdf,application/pdf"
        multiple
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
            <p class="mt-3 text-sm font-semibold text-neutral-900">{{ preferences.t('dropzoneTitle') }}</p>
            <p class="mt-1 text-sm text-neutral-500">{{ preferences.t('dropzoneHint') }}</p>
            <button
              type="button"
              class="mt-4 inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition hover:border-neutral-950 hover:bg-neutral-950 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isMerging"
              @click="fileInput?.click()"
            >
              <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
                <path d="M4 7.5h6l2 2H20v9H4z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5" />
                <path d="M12 12v4m0-4-2 2m2-2 2 2" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
              </svg>
              {{ preferences.t('chooseFiles') }}
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
          <PdfFileList
            v-else
            class="mt-4"
            :files="files"
            :disabled="isMerging"
            @move="moveFile"
            @remove="removeFile"
          />
          <p class="mt-3 text-xs leading-5 text-neutral-500">{{ preferences.t('reorderHint') }}</p>
        </div>
      </div>

      <div class="border-t border-neutral-200 bg-neutral-50/70 p-5 sm:p-7">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="w-full lg:max-w-xl">
            <label for="output-name" class="block text-sm font-semibold text-neutral-900">
              {{ preferences.t('outputName') }}
            </label>
            <input
              id="output-name"
              v-model="outputName"
              class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200"
              type="text"
              maxlength="120"
              :disabled="isMerging"
            />
          </div>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p v-if="files.length < 2" class="max-w-xs text-sm leading-6 text-neutral-500">
              {{ preferences.t('minimumFiles') }}
            </p>
            <button
              type="button"
              class="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:bg-neutral-300 sm:min-w-52"
              :disabled="files.length < 2 || isMerging"
              @click="mergeAndDownload"
            >
              <svg aria-hidden="true" class="size-4" fill="none" viewBox="0 0 24 24">
                <path d="M7 7h10m0 0-3-3m3 3-3 3M17 17H7m0 0 3 3m-3-3 3-3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
              </svg>
              {{ isMerging ? preferences.t('merging') : preferences.t('mergePdfs') }}
            </button>
          </div>
        </div>
        <p v-if="isMerging" role="status" aria-live="polite" class="mt-4 text-sm text-neutral-600">
          {{ preferences.t('merging') }}
        </p>
        <p v-else-if="isComplete" role="status" aria-live="polite" class="mt-4 text-sm text-emerald-800">
          {{ preferences.t('mergeSuccess') }}
        </p>
        <p v-else-if="errorMessage" role="alert" class="mt-4 text-sm text-red-700">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </section>
</template>
