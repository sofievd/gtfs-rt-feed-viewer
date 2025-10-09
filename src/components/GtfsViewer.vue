<template>
  <div>
    <h2 class="text-4xl">Gtfs Feed Viewer</h2>
    <button @click="loadPbFile">Upload</button>


    <div v-if="feed">
      <h3 class="text-2xl">Feed Header</h3>
      <p class="text-">Version: {{ feed.header.gtfsRealtimeVersion }}</p>
      <p>Timestamp: {{ new Date(feed.header.timestamp * 1000).toLocaleString() }}</p>

      <h3 class="text-2xl">Entities ({{ feed.entity.length }})</h3>

      <div
          v-for="(entity, i) in feed.entity"
          :key="i"
        >
        <p>Entity ID: {{ entity.id || "(no id)" }}</p>

        <template v-for="(value , key) in entity" :key="key" >
          <div v-if="key !== entity.id">
            <span> {{key}}</span>
            <template v-if="isObject(value)">
              <div>
                <template v-for="(subValue, subKey) in value" :key="subKey" >
                  <span class="font-semibold">{{ subKey }}:</span>
                  <template v-if="isObject(subValue)">
                    <div class="ml-4">
                      <template v-for="(innerValue, innerKey) in subValue" :key="innerKey">
                        <div>
                          <span class="font-semibold">{{ innerKey }}:</span> {{ innerValue }}
                        </div>
                      </template>
                    </div>
                  </template>
                  <template v-else>
                    {{ subValue }}
                  </template>
                </template>
              </div>
            </template>
          </div>

        </template>

<!--        <div v-if="entity.vehicle" class="border border-gray-600 p-2 mb-2">
          <p class="font-bold">VehiclePosition</p>
          <div class="ml-2">
            <template v-for="(value, key) in entity.vehicle" :key="key">
              <div>
                <span class="font-semibold">{{ key }}:</span>
                <template v-if="isObject(value)">
                  <div class="ml-4">
                    <template v-for="(subValue, subKey) in value" :key="subKey">
                      <div>
                        <span class="font-semibold">{{ subKey }}:</span> {{ subValue }}
                      </div>
                    </template>
                  </div>
                </template>
                <template v-else>
                  {{ value }}
                </template>
              </div>
            </template>
          </div>
        </div>-->

      </div>
    </div>

  </div>

</template>

<script>
import root from "/src/assets/gtfs-realtime.js";

export default {
  name: "GtfsViewer",
  data() {
    return {
      feed: null
    }
  },

  methods: {
    async loadPbFile() {

      try {
        const response = await fetch("/src/assets/VehiclePositions.pb");
        if (!response.ok) throw new Error("Failed to fetch .pb file");

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const FeedMessage = root.transit_realtime.FeedMessage;


        const decoded = FeedMessage.decode(uint8Array);
        this.feed = decoded;

        console.log('Decoded message:', decoded);
      } catch (error) {
        console.log(error);
      }
    },
    isObject(val) {
      return val && typeof val === "object" && !Array.isArray(val);
    }

  }
}
</script>

<style scoped>
</style>