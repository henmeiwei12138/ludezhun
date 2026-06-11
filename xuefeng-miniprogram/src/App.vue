<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { initCloud } from "@/api/cloud";
import { createInterstitialAd, preloadRewardVideo, setInterstitialInstance } from "@/utils/ad";

onLaunch(() => {
  console.log("App Launch");
  // 初始化云开发（必须在所有云 API 调用之前）
  initCloud()
  // 预加载插屏广告
  setInterstitialInstance(createInterstitialAd())
  // 预加载激励视频广告
  preloadRewardVideo()
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>
<style></style>
