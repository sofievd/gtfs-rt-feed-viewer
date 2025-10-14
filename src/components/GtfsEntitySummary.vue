<template>
  <div>
    <div v-if="entity.vehicle" class="text-gray-800">
      <span class="font-semibold text-indigo-900 text-lg">Vehicle Position:</span>
      <ul v-if="entity.vehicle.position">
        <li>Trip ID: {{ entity.vehicle.trip?.tripId || 'N/A' }}</li>
        <li>Lat: {{ entity.vehicle.position.latitude?.toFixed(5) }}, Lon:
          {{ entity.vehicle.position.longitude?.toFixed(5) }}
        </li>
        <li>Speed: {{ entity.vehicle.position.speed || 'N/A' }} m/s</li>
        <li>Bearing: {{ entity.vehicle.position.bearing || 'N/A' }}</li>
      </ul>
      <span v-else>No position data</span>
    </div>

    <div v-if="entity.tripUpdate" class="text-gray-800">
      <span class="font-semibold text-indigo-900">Trip {{
          entity.tripUpdate.trip?.tripId || ''
        }} ({{ entity.tripUpdate.stopTimeUpdate.length }} updates, avg delay {{
          getAverageDelay(entity) || ' '
        }}s)</span>
    </div>

    <div v-if="entity.alert" class="text-gray-800">
      <span class="font-semibold text-indigo-900">Service Alert:</span>
      <ul>
        <li> Trip ID: {{ entity.alert.tripId }}</li>
        <li> Cause: {{ formatEnumName(getCauseName(entity.alert.cause)) }}</li>
        <li> Effect: {{ formatEnumName(getEffectName(entity.alert.effect)) }}</li>
        <li> Description: {{ entity.alert.headerText?.translation?.[0]?.text || 'No description' }}</li>
        <li> Severity Level: {{ formatEnumName(getSeverityLevel(entity.alert.severityLevel)) }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "GtfsEntitySummary",
  props: ['entity'],
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
    getSeverityLevel(severityCode) {
      const severityMap = {
        1: "UNKNOWN_SEVERITY",
        2: "INFO",
        3: "WARNING",
        4: "SEVERE"
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
      console.log(Math.round(avg))
      return Math.round(avg);
    }
  }
}
</script>


<style scoped>

</style>