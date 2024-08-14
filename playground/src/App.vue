<script setup lang="ts">
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import { onMounted, ref } from 'vue'

const status = ref<'connecting' | 'connected' | 'disconnected'>('connecting')
const danmu = ref<any[]>([])

function randomElement<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

onMounted(async () => {
  const room = await fetch(`/apilive/room/v1/Room/mobileRoomInit?id=${import.meta.env.VITE_ROOM}`)
    .then(res => res.json())
  const conf = await fetch(`/apilive/room/v1/Danmu/getConf?room_id=${room.data.room_id}&platform=pc&player=web`)
    .then(res => res.json())
  const fingerprint = await fetch(`/api/x/frontend/finger/spi`)
    .then(res => res.json())

  const host = randomElement(conf.data.host_server_list) as any

  const live = new KeepLiveWS(import.meta.env.VITE_ROOM, {
    url: `wss://${host.host}:${host.wss_port}/sub`,
    key: conf.data.token,
    // 非必要，如果你获取不到弹幕，可以尝试使用这个
    buvid: fingerprint.data.b_3,
  })

  live.runWhenConnected(() => {
    status.value = 'connected'
    console.log(`正在监听 ${import.meta.env.VITE_ROOM}`)
  })

  live.on('DANMU_MSG', async (m) => {
    danmu.value.push(m)
  })

  live.on('close', () => {
    status.value = 'disconnected'
  })
})

function mapStatus(status: 'connecting' | 'connected' | 'disconnected') {
  return {
    connecting: '连接中',
    connected: '已连接',
    disconnected: '已断开',
  }[status]
}
</script>

<template>
  <div>
    <div>
      状态: {{ mapStatus(status) }}
    </div>
    <p>
      弹幕:
    </p>
    <div v-for="m in danmu" :key="m">
      {{ JSON.stringify(m.data) }}
    </div>
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
