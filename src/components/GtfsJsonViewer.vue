<template>
<div>
  <pre>
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