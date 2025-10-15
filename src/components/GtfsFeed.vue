<template>
  <div>
    <h2 class="text-center text-xl font-bold">Feed</h2>
    <div>
      <TabGroup>
        <template v-slot:header>
          <TabTitle tag="json" title="Json view"/>
          <TabTitle tag="tree" title="Tree view"/>
        </template>

        <template v-slot:tab.json>
          <Tab tag="json">
            <GtfsJsonViewer :data="feed"/>
          </Tab>
        </template>

        <template v-slot:tab.tree>
          <Tab tag="tree">

            <div v-for="(entity, index) in feed.entity" :key="index">
                <GtfsFeedEntity :entity="entity" class="px-4"/>
                <hr
                    v-if="index < feed.entity.length - 1"
                    class="border-t border-indigo-900 my-2"
                />
              </div>

          </Tab>
        </template>
      </TabGroup>
    </div>


    <!--
    <GtfsJsonViewer :data="feed" />


    <div v-for="(entity, index) in feed.entity"
         :key="index"
    >
<div>
        <GtfsFeedEntity :entity="entity" class="px-4"/>

        <hr
            v-if="index < feed.entity.length - 1"
            class="border-t border-indigo-900 my-2"
        />
      </div>


    </div> -->
  </div>
</template>

<script>
import GtfsFeedEntity from "@/components/GtfsFeedEntity.vue";
import GtfsJsonViewer from "@/components/GtfsJsonViewer.vue";
import TabGroup from "@/components/TabGroup.vue";
import Tab from "@/components/Tab.vue";
import TabTitle from "@/components/TabTitle.vue";

export default {
  name: "GtfsFeed",
  components: {GtfsFeedEntity, GtfsJsonViewer, TabGroup, Tab, TabTitle},
  props: ['feed']
}
</script>

<style scoped>

</style>