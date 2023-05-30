<script setup lang="ts">
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import { onMounted } from 'vue'

onMounted(() => {
  const live = new KeepLiveWS(import.meta.env.VITE_ROOM)
  console.log(live)

  live.runWhenConnected(() => {
    console.log(`正在监听 ${import.meta.env.VITE_ROOM}`)
  })

  live.on('WELCOME_GUARD', (message) => { // 有弹幕会被触发
    console.log(message)
  })

  live.on('WELCOME', (message) => { // 有弹幕会被触发
    console.log(message)
  })

  live.on('SUPER_CHAT_MESSAGE', (message) => { // 有弹幕会被触发
    console.log(message)
  })

  live.on('DANMU_MSG', m => console.log(m))
})
</script>

<template>
  1
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
