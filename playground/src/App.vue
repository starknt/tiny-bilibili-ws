<script setup lang="ts">
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import { onMounted, ref } from 'vue'

const danmu = ref<any[]>([])

function randomElement<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

onMounted(async () => {
  const room = await fetch(`/api/room/v1/Room/mobileRoomInit?id=${import.meta.env.VITE_ROOM}`)
    .then(res => res.json())
  const conf = await fetch(`/api/room/v1/Danmu/getConf?room_id=${room.data.room_id}&platform=pc&player=web`)
    .then(res => res.json())

  const host = randomElement(conf.data.host_server_list) as any

  const live = new KeepLiveWS(import.meta.env.VITE_ROOM, {
    url: `wss://${host.host}:${host.wss_port}/sub`,
    key: conf.data.token,
  })

  live.runWhenConnected(() => {
    console.log(`正在监听 ${import.meta.env.VITE_ROOM}`)
  })

  live.on('DANMU_MSG', async (m) => {
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
