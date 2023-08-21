<script setup lang="ts">
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import { onMounted, ref } from 'vue'

const danmu = ref<any[]>([])

onMounted(() => {
  fetch(`https://api.live.bilibili.com/room/v1/Room/mobileRoomInit?id=${import.meta.env.VITE_ROOM}`)
    .then(w => w.json())
    .then((data) => {
      console.log(data)
    })

  const live = new KeepLiveWS(import.meta.env.VITE_ROOM)

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

  live.on('DANMU_MSG', (m) => {
    danmu.value.push(m)
  })
})
</script>

<template>
  <div v-for="m in danmu" :key="m">
    {{ JSON.stringify(m.data) }}
  </div>
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
