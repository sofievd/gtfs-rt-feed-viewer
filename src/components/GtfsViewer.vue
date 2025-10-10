<template>
  <div class="flex flex-col items-center">

    <h2 class="text-7xl pb-4 font-semibold">Gtfs Feed Viewer</h2>

    <feed-picker @file-buffer="handleUint8Array"/>


    <div v-if="feed">
      <div v-for="(entity, index) in feed.entity"
           :key="index"
           class="border border-indigo-900 rounded-3xl p-3 mb-3 bg-gray-50"
      >
        <div class="flex items-center cursor-pointer"
             @click="toggleEntity(entity.id)">
      <span class="mr-2 text-lg font-sans text-purple-700">
      <FontAwesomeIcon
          :icon="isEntityExpanded(entity.id) ? 'fa-chevron-down' : 'fa-chevron-right'"
          class="text-indigo-900"
      />
      </span>
          <p class="font-bold text-gray-800 text-xl">
            Entity ID: {{ entity.id || "(no id)" }}
          </p>
        </div>

        <div v-if="isEntityExpanded(entity.id)" class="mt-2">
          <tree-node :data="entity"/>
        </div>
      </div>
    </div>

  </div>


</template>

<script>
import root from "/src/assets/gtfs-realtime.js";
import TreeNode from "@/components/TreeNode.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import FeedPicker from "@/components/FeedPicker.vue";

export default {
  name: "GtfsViewer",
  components: {FontAwesomeIcon, TreeNode, FeedPicker},
  data() {
    return {
      feed: null,
      fileUrl: "",
      fileName: "",
      statusMessage: "",
      expandedEntities: {}
    }
  },

  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.fileName = file.name;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        this.decodeProtobuf(uint8Array);
      }
      reader.readAsArrayBuffer(file);

    },
    async downloadFile() {
      if (!this.fileUrl){
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
        this.decodeProtobuf(uint8Array);

      } catch (error) {
        console.log(error);
        this.statusMessage = "Error downloading file."
      }
    },
    toggleEntity(id) {
      this.expandedEntities = {
        ...this.expandedEntities,
        [id]: !this.expandedEntities[id],
      }
    },
    isEntityExpanded(id) {
      return this.expandedEntities[id]
    },
    decodeProtobuf(arrayBuffer) {
      try {
        const FeedMessage = root.transit_realtime.FeedMessage;
        const decoded = FeedMessage.decode(arrayBuffer);
        this.feed = decoded;

        console.log('Decoded message:', decoded);
      } catch (error) {
        console.log(error);
      }
    },
    handleUint8Array(uint8Array) {
      console.log("received file buffer: ", uint8Array);

      this.decodeProtobuf(uint8Array);
    }
  }
}
</script>

<style scoped>
</style>