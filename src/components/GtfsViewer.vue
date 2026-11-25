<template>
    <div class="flex flex-col items-center">
      <section class="flex w-full flex-col items-center min-h-[calc(100vh-5rem)] px-4">
      <div class="flex-1"></div>
      <div class="w-full max-w-[800px] text-left text-[#4A4966]">
        <h1 class="mt-8 mb-[12px] text-2xl font-semibold">Get insights in your binary protobuf files</h1>
        <p class="mb-8">Files are handled client-side and do not leave your computer</p>
      </div>
      <FeedPicker class="w-full max-w-[800px]" @file-buffer="handleUint8Array"/>
      <p v-if="decodeError" role="alert" class="mb-4 text-red-700">{{ decodeError }}</p>
      <div class="flex-1"></div>
      </section>

    </div>
</template>

<script>
import FeedPicker from "@/components/FeedPicker.vue";
import { decodeFeed } from '@/utils/feedLoading.js';


export default {
  name: "GtfsViewer",
  emits: ['feed-loaded'],
  components: { FeedPicker },
  data() {
    return { decodeError: '' }
  },
  methods: {
    handleUint8Array(uint8Array, fileName, source = {}) {
      try {
        console.log("here")
        const file = decodeFeed(uint8Array, fileName, source);
        this.decodeError = '';
        this.$emit('feed-loaded', file);
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
