<template lang="html">
  <div>
    <div class="tab-header">
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
  data() {
    return {
      activeTab: null
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
    if (firstTab) {
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