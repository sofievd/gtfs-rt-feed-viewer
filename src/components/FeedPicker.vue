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
          aria-label="File URL"
          aria-describedby="feed-url-status"
          placeholder="Enter file URL"
          enterkeyhint="go"
          @keydown.enter.prevent="downloadFile"
          class="flex-1 min-w-0 w-full px-8 py-4 border-2 border-black/24 bg-[#E3E1F5] rounded-lg text-left text-[#4A4966] placeholder:text-[#4A4966] text-l"
      />

    </div>
    <div id="feed-url-status" class="text-sm text-[#4A4966] text-center">
      {{ statusMessageUrl }}
    </div>

    <div
        class="mt-6 border-2 border-dashed border-black/24 rounded-lg p-4 text-left text-[#4A4966] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-900"
        :class="isDragging ? 'bg-indigo-100' : 'bg-[#E3E1F5]'"
        role="button"
        tabindex="0"
        @keydown.enter.prevent="triggerFileInput"
        @keydown.space.prevent="triggerFileInput"
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
      <p class="text-l">
        {{ isDragging ? 'Drop the files here…' : 'Click or drop a protobuf file to load a local file' }}
      </p>

      <!-- Show selected files -->
      <div v-if="fileName" class="mt-4 text-lg flex gap-2">
           <DocumentIcon class="size-6"/>
        {{ fileName }}
      </div>
      <div v-else>
        {{ statusMessageFile }}
      </div>
    </div>

    <div class="mt-6 text-left text-sm text-[#4A4966]">
      <span>Try a sample feed from Helsinki (HSL): </span>
        <template v-for="(example, index) in examples" :key="example.path"><span v-if="index">, </span><a
           :href="exampleBaseUrl + 'hsl-' + example.path + '.pb'"
           :aria-disabled="isLoading"
           class="underline hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-900"
           @click.prevent="loadExample(example.path)">{{ example.label }}</a></template>
    </div>

  </div>
</template>

<script>
import { DocumentIcon }  from '@heroicons/vue/24/outline'
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import { downloadFeed } from '@/utils/feedLoading.js';

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
        const uint8Array = await downloadFeed(feedUrl);
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
