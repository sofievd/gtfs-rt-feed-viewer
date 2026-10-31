<template lang="html">
  <div>
    <div class="mb-4">
      <slot name="header" ></slot>
    </div>

    <div class="tab-content">
      <slot :name="'tab.' + activeTab"></slot>
    </div>

  </div>
</template>

<script>
export default {
  name: "TabGroup",
  props: {
    initialTab: { type: String, default: null },
  },
  data() {
    return {
      activeTab: this.initialTab
    }
  },
  provide() {
    return {
      setActiveTab: this.setActiveTab,
      activeTabRef: () => this.activeTab,
    };
  },
  mounted() {
   const firstTab = this.$slots.header?.()[0].props?.tag;
    if (!this.activeTab && firstTab) {
      this.activeTab = firstTab
    }
  },
  methods: {
    setActiveTab(tag) {
      this.activeTab = tag;
    }
  }
}
</script>


<style scoped>

</style>