<template>
  <div>
    <div class="flex items-center gap-2">
      <input
          type="text"
          v-model="fileUrl"
          placeholder="Enter URL"
          class="flex-1 px-8 py-4 border border-indigo-900 border-2 min-w-[800px] rounded-3xl"
      />

    </div>
    <div class="text-sm text-indigo-900 text-center">
      {{ statusMessageUrl || (fileUrl ? "Please enter a URL to download the .pb file." : "") }}
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

    <div class="text-center p-8">
      <button @click="downloadFile"
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
  components: { DocumentIcon, FontAwesomeIcon},

  data() {
    return {
      fileUrl: "",
      fileName: "",
      statusMessageUrl: "",
      statusMessageFile: "",
      isDragging: false,
      accept: ".pb",
    }
  },
  methods: {
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

      if (!file) return

      if (!file.name.endsWith(".pb")) {
        this.statusMessageFile = "Please upload a valid .pb file."
        return
      }

      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        this.$emit('file-buffer', uint8Array);
      }
      reader.readAsArrayBuffer(file);

    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    async downloadFile() {
      if (!this.fileUrl) {
        this.statusMessage = "Please paste a URL!"
        return;
      }

      try {
        new URL(this.fileUrl); // Will throw if invalid
      } catch (_) {
        this.statusMessage = "Invalid URL format!";
        return;
      }

      try {
        this.statusMessage = "Downloading file..."
        const response = await fetch(this.fileUrl)
        if (!response.ok) throw new Error("Failed to download file");

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        this.statusMessage = " File downloaded successfully!"

        this.$emit("file-buffer", uint8Array)
      } catch (error) {
        console.log(error);
        this.statusMessage = "Error downloading file."
      }
    }

  }

}
</script>

<style scoped>

</style>