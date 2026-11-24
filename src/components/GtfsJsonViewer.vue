<template>
<div>
  <pre class="w-full overflow-x-auto text-[#4A4966]">
    {{JSON.stringify(data, undefined, 2)}}
  </pre>

</div>
</template>

<script>
export default {
  name: "GtfsJsonViewer",
  props: ["data"]
}
</script>

<style scoped>

</style>