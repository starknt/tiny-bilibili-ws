<script setup lang="ts">
import { KeepLiveWS } from 'tiny-bilibili-ws/browser'
import type { ListenerEvents, Message } from 'tiny-bilibili-ws'
import { onMounted } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

onMounted(async () => {
  const live = new KeepLiveWS(545068)

  live.on<ListenerEvents>('WELCOME_GUARD', (message: Message<any>) => { // 有弹幕会被触发
    console.log(message)
  })

  live.on<ListenerEvents>('WELCOME', (message: Message<any>) => { // 有弹幕会被触发
    console.log(message)
  })

  live.on<ListenerEvents>('SUPER_CHAT_MESSAGE', (message: Message<any>) => { // 有弹幕会被触发
    console.log(message)
  })
})
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo">
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo">
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" />
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
