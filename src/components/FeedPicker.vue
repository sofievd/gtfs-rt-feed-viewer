<template>
  <div :aria-busy="isLoading">
    <Teleport to="body">
      <div v-if="isLoading" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
        <div role="status" aria-live="polite" class="flex items-center gap-4 rounded-2xl bg-white px-8 py-6 text-indigo-900 shadow-xl">
          <span aria-hidden="true" class="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-900 motion-reduce:animate-none"></span>
          <span>Loading feed…</span>
        </div>
      </div>
    </Teleport>
    <div class="flex items-center gap-2">
      <input
          type="text"
          v-model="fileUrl"
          placeholder="Enter URL"
          class="flex-1 min-w-0 w-full px-8 py-4 border border-indigo-900 border-2 rounded-3xl"
      />

    </div>
    <div class="text-sm text-indigo-900 text-center">
      {{ statusMessageUrl || (fileUrl ? "Please enter a URL to download the .pb or .pbf file." : "") }}
    </div>

    <div class="text-2xl py-4 text-center">-OR-</div>

    <div
        class="border-2 border-dashed border-indigo-900 rounded-3xl p-8 text-center cursor-pointer transition-colors"
        :class="isDragging ? 'border-blue-500 bg-indigo-50' : 'border-gray-300 bg-gray-50'"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
    >
      <!-- Hidden file input -->
      <input
          ref="fileInput"
          type="file"
          multiple
          :accept="accept"
          class="hidden"
          @change="onFileChange"
      />

      <!-- Instructions -->
      <p class="text-indigo-900 mb-2 text-2xl">
        {{ isDragging ? 'Drop the files here…' : 'Drag & drop files here, or click to browse' }}
      </p>

      <!-- Optional file type hint -->
      <p v-if="accept" class="text-md text-gray-400">
        Accepted types: {{ accept }}
      </p>

      <!-- Show selected files -->
      <div v-if="fileName" class="mt-4 text-lg text-indigo-900 flex justify-center gap-2">
           <DocumentIcon class="text-indigo-900 size-6 float-center"/>
        {{ fileName }}
      </div>
      <div v-else>
        {{ statusMessageFile }}
      </div>
    </div>

    <div class="mt-6 text-center text-sm text-indigo-900">
      <p class="mb-2">Try a sample feed from Helsinki (HSL):</p>
      <div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
        <a v-for="example in examples" :key="example.path"
           :href="exampleBaseUrl + 'hsl-' + example.path + '.pb'"
           :aria-disabled="isLoading"
           class="underline hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-900"
           @click.prevent="loadExample(example.path)">{{ example.label }}</a>
      </div>
    </div>

    <div class="text-center p-8">
      <button @click="downloadFile" :disabled="isLoading"
              class="px-8 py-4  bg-indigo-900 rounded-3xl text-white hover:bg-indigo-800 text-lg">
        Show
      </button>
    </div>


  </div>
</template>

<script>
import { DocumentIcon }  from '@heroicons/vue/24/outline'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";

export default {
  name: "FeedPicker",
  emits: ['file-buffer'],
  components: { DocumentIcon, FontAwesomeIcon},

  data() {
    return {
      fileUrl: "",
      fileName: "",
      statusMessageUrl: "",
      statusMessageFile: "",
      isDragging: false,
      isLoading: false,
      exampleBaseUrl: import.meta.env.BASE_URL + 'examples/',
      accept: ".pb,.pbf",
      examples: [
        { label: 'Vehicle positions', path: 'vehicle-positions' },
        { label: 'Trip updates', path: 'trip-updates' },
        { label: 'Service alerts', path: 'service-alerts' },
      ],
    }
  },
  methods: {
    loadExample(path) {
      if (this.isLoading) return;
      this.fileUrl = new URL(this.exampleBaseUrl + 'hsl-' + path + '.pb', window.location.href).href;
      return this.downloadFile();
    },
    onDragOver() {
      this.isDragging = true
    },
    onDragLeave() {
      this.isDragging = false
    },
    onDrop(e) {
      this.isDragging = false
      this.handleFile(e.dataTransfer.files[0])
    },
    onFileChange(e) {

      this.handleFile(e.target.files[0])
    },
    async handleFile(file) {
      if (this.isLoading) return;

      if (!file) return

      if (!/\.(pb|pbf)$/i.test(file.name)) {
        this.statusMessageFile = "Please upload a valid .pb or .pbf file."
        return
      }

      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        this.$emit('file-buffer', uint8Array, file.name, { source: 'upload' });
      }
      reader.readAsArrayBuffer(file);

    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async downloadFile() {
      if (this.isLoading) return;
      if (!this.fileUrl) {
        this.statusMessageUrl = "Please paste a URL!"
        return;
      }

      try {
        new URL(this.fileUrl); // Will throw if invalid
      } catch (_) {
        this.statusMessageUrl = "Invalid URL format!";
        return;
      }

      try {
        this.isLoading = true;
        this.statusMessageUrl = "Downloading file..."
        const feedUrl = new URL(this.fileUrl);
        const response = await fetch(feedUrl)
        if (!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        this.statusMessageUrl = "File downloaded successfully!"

        const fileName = feedUrl.pathname.split('/').pop() || feedUrl.hostname;
        this.$emit("file-buffer", uint8Array, fileName, { source: 'url', url: feedUrl.href })
      } catch (error) {
        console.log(error);
        this.statusMessageUrl = "Unable to download this feed. Check the URL and whether the server allows browser access (CORS)."
      } finally {
        this.isLoading = false;
      }
    }

  }

}
</script>

<style scoped>

</style>