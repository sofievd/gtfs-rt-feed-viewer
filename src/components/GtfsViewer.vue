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
        <p >Entity ID: {{ entity.id }}</p>

        <div v-if="entity.tripUpdate">
          <p>TripUpdate</p>
          <p>Trip ID: {{ entity.tripUpdate.trip?.tripId }}</p>
          <ul>
            <li
                v-for="(st, j) in entity.tripUpdate.stopTimeUpdate"
                :key="j"
            >
              Stop Seq: {{ st.stopSequence }},
              Arrival: {{ st.arrival?.time ? new Date(st.arrival.time * 1000).toLocaleTimeString() : '—' }}
            </li>
          </ul>
        </div>

        <div v-if="entity.vehicle" class="border border-gray-600 p-2 mb-2">
          <p>VehiclePosition</p>
          <div v-for="(value, key) in entity.vehicle" :key="key">
            <p>
              <span> {{key}} :</span>
              <span> {{value}} </span>

            </p>

          </div>
        </div>

        <div v-if="entity.alert">
          <p>Alert</p>
          <p>
            {{ entity.alert.headerText?.translation?.[0]?.text ||
          entity.alert.descriptionText?.translation?.[0]?.text ||
          'No text' }}
          </p>
        </div>
      </div>
    </div>

    <p>{{feed}}</p>
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

      try{
        const response = await fetch("/src/assets/VehiclePositions.pb");
        if(!response.ok) throw new Error("Failed to fetch .pb file");

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const FeedMessage = root.transit_realtime.FeedMessage;


        const decoded = FeedMessage.decode(uint8Array);
        this.feed = decoded;

        console.log('Decoded message:', decoded);
      } catch (error){
        console.log(error);
      }
    },

  }
}
</script>

<style scoped>
</style>