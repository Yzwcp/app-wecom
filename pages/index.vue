<template>
  <view class="page"></view>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { onLoad, onLaunch } from "@dcloudio/uni-app";
import { useGlobalStore } from "../../store/global";
import { storeToRefs } from "pinia";
import { getDeliveryList } from "@/api/index.js";
const global = useGlobalStore();
const { systemInfo, configInfo, userInfo } = storeToRefs(global);
const query = ref({});
const params = ref({});
const allList = ref([]);
const allData = ref({});

onLoad(() => {
  query.value = uni.$router.query || {};
  params.value = uni.$router.params || {};
  init();
});
</script>

<style scoped lang="scss">
:deep(.wd-tabbar) {
  background: transparent !important;
}
.page {
  width: 100%;
  min-height: 100vh;
}
</style>
