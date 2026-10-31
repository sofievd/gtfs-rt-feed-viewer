<template>
    <div class="flex flex-col items-center">
      <section class="flex flex-col items-center min-h-[calc(100vh-5rem)]">
      <div class="flex-1"></div>
      <h1 class="text-4xl my-8 font-semibold">Gtfs-RT Feed Viewer</h1>
      <div class="mb-8 text-center">
        <p> View and inspect your GTFS Realtime (.pb) data. </p>
        <p> To learn more about GTFS and the Realtime data visit: <a href="https://gtfs.org/" target="_blank" class="text-indigo-900">The  Official GTFS documentation</a></p>
        <p> Upload a file from your device or provide a feed URL to see its contents instantly. </p>
      </div>
      <FeedPicker @file-buffer="handleUint8Array"/>
      <div class="flex-1"></div>
      </section>
      <section v-if="feed" ref="feedContent" class="min-h-[calc(100vh-5rem)] scroll-mt-20 w-full py-6">
        <GtfsFeed :feed="feed" class="bg-gray-50 w-full max-w-[800px] mx-auto py-4 px-4 rounded-3xl"/>
      </section>
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
  emits: ['feed-loaded'],
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
    decodeProtobuf(arrayBuffer, fileName) {
      try {
        const FeedMessage = root.transit_realtime.FeedMessage;
        const decoded = FeedMessage.decode(arrayBuffer);
        this.feed = decoded;
        this.$emit('feed-loaded', fileName);
        this.$nextTick(() => {
          this.$refs.feedContent?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
            block: 'start',
          });
        });

        console.log('Decoded message:', decoded);
      } catch (error) {
        console.log(error);
      }
    },
    handleUint8Array(uint8Array, fileName) {
      console.log("received file buffer: ", uint8Array);

      this.decodeProtobuf(uint8Array, fileName);
    },
  }
}
</script>

<style scoped>
</style>