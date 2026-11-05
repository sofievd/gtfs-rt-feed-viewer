<template>
    <div class="flex flex-col items-center">
      <section class="flex w-full flex-col items-center min-h-[calc(100vh-5rem)] px-4">
      <div class="flex-1"></div>
      <h1 class="text-4xl my-8 font-semibold text-center">Gtfs-RT Feed Viewer</h1>
      <div class="mb-8 text-center">
        <p> View and inspect your GTFS Realtime (.pb) data. </p>
        <p> To learn more about GTFS and the Realtime data visit: <a href="https://gtfs.org/" target="_blank" class="text-indigo-900">The  Official GTFS documentation</a></p>
        <p> Upload a file from your device or provide a feed URL to see its contents instantly. </p>
      </div>
      <FeedPicker class="w-full max-w-[800px]" @file-buffer="handleUint8Array"/>
      <p v-if="decodeError" role="alert" class="mb-4 text-red-700">{{ decodeError }}</p>
      <div class="flex-1"></div>
      </section>
      <section v-if="feed" id="feed-content" class="min-h-[calc(100vh-8.5rem)] scroll-mt-[136px] w-full"
               :class="{ 'px-4': !fullWidthView, 'py-6': activeView !== 'map' }">
        <GtfsFeed :key="loadedFile.version" :feed="feed" :loaded-file="loadedFile" :active-view="activeView"
                  class="bg-gray-50 w-full px-4"
                  :class="{ 'max-w-[1200px] mx-auto rounded-3xl': !fullWidthView, 'py-4': activeView !== 'map' }"/>
      </section>
    </div>
</template>

<script>
import root from "/src/assets/gtfs-realtime.js";
import FeedPicker from "@/components/FeedPicker.vue";
import GtfsFeed from "@/components/GtfsFeed.vue";

export default {
  name: "GtfsViewer",
  emits: ['feed-loaded'],
  components: { GtfsFeed, FeedPicker },
  props: {
    loadedFile: { type: Object, default: null },
    activeView: { type: String, default: 'json' },
  },
  data() {
    return { decodeError: '' }
  },
  computed: {
    fullWidthView() {
      return ['map', 'table', 'json', 'tree'].includes(this.activeView);
    },
    feed() {
      return this.loadedFile?.feed;
    },
  },
  methods: {
    handleUint8Array(uint8Array, fileName, source = {}) {
      try {
        const feed = root.transit_realtime.FeedMessage.decode(uint8Array);
        this.decodeError = '';
        this.$emit('feed-loaded', {
          feed,
          name: fileName,
          size: uint8Array.byteLength,
          source: source.source || 'upload',
          url: source.url || null,
          loadedAt: Date.now(),
        });
      } catch (error) {
        this.decodeError = 'Unable to decode this file as a GTFS Realtime feed.';
        console.error(error);
      }
    },
  },
}
</script>

<style scoped>
</style>