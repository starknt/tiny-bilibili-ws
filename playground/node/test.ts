import path from 'node:path'
import * as dotenv from 'dotenv'
import { KeepLiveTCP, getLongRoomId } from 'tiny-bilibili-ws'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const res = await getLongRoomId(process.env.VITE_ROOM as any)

console.log(res)

const live = new KeepLiveTCP(res.data.room_id)

live.on('DANMU_MSG', (message) => { // 有弹幕会被触发
  console.log(message)
})

live.on('error', console.log)

// live.on('SEND_GIFT', (message) => { // 有礼物, 但不会被触发
//   console.log(message)
// })

live.getOnline().then(console.log).catch(console.error)
