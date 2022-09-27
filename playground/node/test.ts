import type { ListenerEvents, Message } from 'tiny-bilibili-ws'
import { KeepLiveTCP, getLongRoomId } from 'tiny-bilibili-ws'

const res = await getLongRoomId(650)

const tcp = new KeepLiveTCP(res.data.room_id)

tcp.addListener<ListenerEvents>('DANMU_MSG', (e: Message<any>) => {
  console.log(e.data)
})
