<template>
  <button
      class="cursor-pointer border-indigo-900 border p-2 mx-2 rounded-3xl"
      :class="[isActive ? 'bg-indigo-900 text-white' : 'bg-white text-black' ]"
      @click="selectTab(tag)">
    {{ title }}
  </button>
</template>

<script>
export default {
  name: "TabTitle",
  props: {
    tag: { type: String,  required: true},
    title: {type: String, required: true},
  },
  inject: ["setActiveTab", "activeTabRef"],
  data(){
    return {
      activeTab: null
    }
  },
  computed: {
    isActive(){
      return this.activeTabRef() === this.tag;
    }
  },
  methods: {
    selectTab(tag) {
      console.log(tag)
      this.setActiveTab(tag);
    }

  }
}
</script>

<style scoped>

</style>