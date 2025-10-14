<template>
    <div class="flex flex-col items-center h-screen">
      <div class="flex-1"></div>
      <h1 class="text-4xl my-8 font-semibold">Gtfs-RT Feed Viewer</h1>
      <div class="mb-6 text-center">
        <p> View and inspect your GTFS Realtime (.pb) data. </p>
        <p> Upload a file from your device or provide a feed URL to see its contents instantly. </p>
      </div>
      <FeedPicker @file-buffer="handleUint8Array"/>
      <GtfsFeed v-if="feed" :feed="feed" class="bg-gray-50 w-[800px] py-4 px-4 rounded-3xl"/>
      <div class="flex-1"></div>
    </div>
</template>

<script>
import root from "/src/assets/gtfs-realtime.js";
import TreeNode from "@/components/TreeNode.vue";
import {FontAwesomeIcon} from "@fortawesome/vue-fontawesome";
import FeedPicker from "@/components/FeedPicker.vue";
import TreeView from "@/components/GtfsTreeView.vue";
import GtfsFeedEntity from "@/components/GtfsFeedEntity.vue";
import GtfsFeed from "@/components/GtfsFeed.vue";

export default {
  name: "GtfsViewer",
  components: {GtfsFeed, GtfsFeedEntity, TreeView, FontAwesomeIcon, TreeNode, FeedPicker},
  data() {
    return {
      feed: null,
      fileUrl: "",
      fileName: "",
      statusMessage: "",
      expandedEntities: [],
    }
  },
  methods: {
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
    },
  }
}
</script>

<style scoped>
</style>