<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { createInterstitialAd, preloadRewardVideo } from "@/utils/ad";

onLaunch(() => {
  console.log("App Launch");
  // 预加载插屏广告
  const app = getApp() as any
  if (!app.globalData) app.globalData = {}
  app.globalData.interstitialAd = createInterstitialAd()
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
