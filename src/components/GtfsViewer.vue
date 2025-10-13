<template>
  <div class="flex flex-col items-center">

    <h2 class="text-7xl pb-4 font-semibold">Gtfs Feed Viewer</h2>

    <feed-picker @file-buffer="handleUint8Array"/>


    <div v-if="feed" class="bg-gray-50 max-w-[600px] min-w-[600px]">

      <div v-for="(entity, index) in feed.entity"
           :key="index"
           class="px-6 py-2"
      >
        <div v-if="entity.vehicle" class="text-gray-800">
            <span class="font-semibold text-indigo-900 text-lg">Vehicle Position:</span>
            <ul v-if="entity.vehicle.position">
              <li>Trip ID: {{ entity.vehicle.trip?.tripId || 'N/A' }}</li>
              <li>Lat: {{ entity.vehicle.position.latitude?.toFixed(5) }}, Lon: {{ entity.vehicle.position.longitude?.toFixed(5) }} </li>
              <li>Speed: {{ entity.vehicle.position.speed || 'N/A' }} m/s</li>
              <li>Bearing: {{ entity.vehicle.position.bearing || 'N/A' }}</li>
            </ul>
            <span v-else>No position data</span>
        </div>

        <div v-if="entity.tripUpdate" class="text-gray-800">
            <span class="font-semibold text-indigo-900">Trip Update:</span>
            <ul>
              <li> Trip ID: {{ entity.tripUpdate.trip?.tripId || 'N/A' }} </li>
              <li> Delay: {{ getAverageDelay(entity) || 'N/A' }} sec</li>
              <li> Stop Seq: {{ entity.tripUpdate.stopTimeUpdate?.[0]?.stopSequence || 'N/A' }}</li>
            </ul>
        </div>

        <div v-if="entity.alert" class="text-gray-800">
            <span class="font-semibold text-indigo-900">Service Alert:</span>
          <ul>
            <li> Trip ID: {{entity.alert.tripId}}</li>
            <li> Cause: {{ formatEnumName(getCauseName(entity.alert.cause)) }}</li>
            <li> Effect: {{ formatEnumName(getEffectName(entity.alert.effect)) }}</li>
            <li> Description: {{ entity.alert.headerText?.translation?.[0]?.text || 'No description' }}</li>
            <li> Severity Level:  {{formatEnumName(getSeverityLevel(entity.alert.severityLevel))}}</li>
          </ul>

        </div>


        <div class="flex items-center cursor-pointer"
             @click="toggleEntity1(entity.id)">
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

        <div v-show="isEntityExpanded(entity.id)" class="mt-2">
          <tree-node :data="entity"/>
        </div>

        <hr
            v-if="index < feed.entity.length - 1"
            class="border-t border-indigo-900 my-2"
        />
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
      expandedEntities: [],
    }
  },
  methods: {
    getEffectName(effectCode) {
      const effectMap = {
        1: "NO_SERVICE",
        2: "REDUCED_SERVICE",
        3: "SIGNIFICANT_DELAYS",
        4: "DETOUR",
        5: "ADDITIONAL_SERVICE",
        6: "MODIFIED_SERVICE",
        7: "OTHER_EFFECT",
        8: "UNKNOWN_EFFECT",
        9: "STOP_MOVED"
      };
      return effectMap[effectCode] || "Unknown effect";
    },
    formatEnumName(value) {
      return value
          ? value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
          : 'Unknown';
    },
    getCauseName(causeCode) {
      const causeMap = {
        1: "UNKNOWN_CAUSE",
        2: "OTHER_CAUSE",
        3: "TECHNICAL_PROBLEM",
        4: "STRIKE",
        5: "DEMONSTRATION",
        6: "ACCIDENT",
        7: "HOLIDAY",
        8: "WEATHER",
        9: "MAINTENANCE",
        10: "CONSTRUCTION",
        11: "POLICE_ACTIVITY",
        12: "MEDICAL_EMERGENCY"
      };
      return causeMap[causeCode] || "Unknown cause";
    },
    getSeverityLevel(severityCode){
      const severityMap ={
        1: "UNKNOWN_SEVERITY",
        2:"INFO",
        3:"WARNING",
        4:"SEVERE"
      };
      return severityMap[severityCode] || "Unknown severity";
    },
    getAverageDelay(entity) {
      const updates = entity.tripUpdate?.stopTimeUpdate || [];
      const delays = updates
          .map(s => s.arrival?.delay ?? s.departure?.delay)
          .filter(d => typeof d === 'number');

      if (!delays.length) return null;

      const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
      return Math.round(avg);
    },
    toggleEntity1(id) {
      const strId = String(id);
      const idx = this.expandedEntities.indexOf(strId);
      if (idx !== -1) {
        this.expandedEntities.splice(idx, 1); // collapse
      } else {
        this.expandedEntities.push(strId); // expand
      }
    },
    isEntityExpanded(id) {
      return this.expandedEntities.includes(String(id));
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
    },
  }
}
</script>

<style scoped>
</style>