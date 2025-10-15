<template lang="html">
<div v-show="isActive">
  <slot></slot>
</div>
</template>

<script>
export default {
  name: "Tab",
  props: {
    tag :{type: String, required: true},
  },
  inject: ["activeTabRef"],
  computed: {
    isActive() {
      return this.activeTabRef() === this.tag;
    },
  },
}
</script>



<style scoped>

</style>