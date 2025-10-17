<template>
  <!--  <pre>
    {{JSON.stringify(feed, undefined, 2)}}
  </pre>
 -->

  <div class="flex justify-center">
    <table class="border border-indigo-900 text-center" v-if="hasTripUpdates">
      <thead>
      <tr class="border broder-indigo-900 p-2">
        <th class="p-2 border">Trip Id</th>
        <th class="p-2 border">Start date</th>
        <th class="p-2 border"> Sequence number</th>
        <th class="p-2 border">Arrival Delay</th>
        <th class="p-2 border">Departure Delay</th>
        <th class="p-2 border">Schedule</th>
      </tr>
      </thead>

      <tbody>
      <template v-for="entity in feed.entity" :key="entity.id">

        <tr v-for="stop in entity.tripUpdate.stopTimeUpdate" :key="stop.stopSequence">

          <td class="border"> {{ entity.tripUpdate.trip.tripId }}</td>
          <td class="border px-2"> {{ formatDate(entity.tripUpdate.trip.startDate) }}</td>
          <td class="border px-2">{{ stop.stopSequence }}</td>
          <td class="border px-2">{{ stop.arrival.delay }}</td>
          <td class="border px-2">{{ stop.departure.delay }}</td>
          <td class="border px-2"> {{
              formatEnumName(getScheduleName(entity.tripUpdate.trip.scheduleRelationship))
            }}
          </td>
        </tr>
      </template>
      </tbody>
    </table>

    <table class="border border-indigo-900 text-center" v-if="hasAlerts">
      <thead>
      <tr class="border broder-indigo-900 p-2">
        <th class="p-2 border"> Alert ID</th>
        <th class="p-2 border">Start Time</th>
        <th class="p-2 border">End Time</th>
        <th class="p-2 border">Header Text</th>
        <th class="p-2 border">Cause</th>
        <th class="p-2 border"> Effect</th>
        <th class="p-2 border">Informed Entity</th>
      </tr>
      </thead>

      <tbody>
      <template v-for="entity in feed.entity" :key="entity.id">

        <tr v-for="(entityInfo,index) in entity.alert.informedEntity"
            :key="index">
          <td class="border px-2"> {{ entity.id }}</td>
          <td class="border px-2">{{ getDate(entity.alert.activePeriod?.[0]?.start) }}</td>
          <td class="border px-2">{{ getDate(entity.alert.activePeriod?.[0]?.end) }}</td>
          <td class="border px-2">{{ entity.alert.headerText?.translation?.[0]?.text ?? '-' }}</td>
          <td class="border px-2">{{ formatEnumName(getCauseName(entity.alert.cause)) }}</td>
          <td class="border px-2">{{ formatEnumName(getEffectName(entity.alert.effect)) }}</td>
          <td class="border px-2">
            <p>Agency ID : {{entityInfo.agencyId ?? '-'}} </p>
            <p>RouteID: {{entityInfo.routeId ?? '-'}} </p>
            <p>Route type: {{getRouteType(entityInfo.routeType) ??  '-'}} </p>
            <p>Direction ID: {{entityInfo.directionId ?? '-'}} </p>
            <p>Trip: {{entityInfo.trip ?? '-'}} </p>
            <p>Stop ID : {{entityInfo.stopId ?? '-'}} </p>
          </td>
        </tr>
      </template>
      </tbody>
    </table>
  </div>


</template>

<script>
export default {
  name: "GtfsTableView",
  props: ["feed"],
  computed: {
    hasTripUpdates() {
      return this.feed.entity.some(e => e.tripUpdate)
    },
    hasAlerts() {
      return Array.isArray(this.feed.entity) &&
          this.feed.entity.some(entity => entity.alert !== undefined)
    }

  },
  methods: {
    getAverageDelay(entity) {
      const updates = entity.tripUpdate?.stopTimeUpdate || [];
      const delays = updates
          .map(s => s.arrival?.delay ?? s.departure?.delay)
          .filter(d => typeof d === 'number');

      if (!delays.length) return null;

      const avg = delays.reduce((a, b) => a + b, 0) / delays.length;
      console.log(Math.round(avg))
      return Math.round(avg);
    },
    getScheduleName(scheduleCode) {
      const scheduleMap = {
        0: "SCHEDULED",
        1: "SKIPPED",
        2: "NO_DATA",
        3: "UNSCHEDULED",
      };
      return scheduleMap[scheduleCode];
    },
    formatEnumName(value) {
      return value
          ? value.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
          : 'Unknown';
    },
    formatDate(dateString) {

      if (!dateString || dateString.length !== 8) {
        return '-'
      }
      const cleanedDateString = dateString.trim()
      return `${cleanedDateString.substring(0, 4)}-${cleanedDateString.substring(4, 6)}-${cleanedDateString.substring(6, 8)}`;
    },
    getDate(time) {
      const date = new Date(time * 1000)
      return date.toLocaleString();
    },
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
      return causeMap[causeCode] ;
    },
    getRouteType(routeCode) {
      const routeMap = {
        0: "Tram, Streetcar, Light rail",
        1 : "Subway, Metro",
        2 : "Rail",
        3 : "Bus",
        4 : "Ferry",
        5 : "Cable tram",
        6 : "Aerial lift, suspended cable car (e.g., gondola lift, aerial tramway)",
        7 : "Funicular",
        11 : "Trolleybus",
        12 : "Monorail"
      }
      return routeMap[routeCode];
    }
  }
}
</script>

<style scoped>

</style>