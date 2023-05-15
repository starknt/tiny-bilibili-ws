import type { Message } from 'tiny-bilibili-ws'
import { KeepLiveTCP, getLongRoomId } from 'tiny-bilibili-ws'

const res = await getLongRoomId(13233348)

const live = new KeepLiveTCP(res.data.room_id)

// live.onlyListener(['DANMU_MSG'])

live.on('DANMU_MSG', (message: Message<any>) => { // 有弹幕会被触发
  console.log(message)
})

live.on('SEND_GIFT', (message: Message<any>) => { // 有礼物, 但不会被触发
  console.log(message)
})

console.log(await live.getOnline())
