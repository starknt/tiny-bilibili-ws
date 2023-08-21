import path from 'node:path'
import * as dotenv from 'dotenv'
import { KeepLiveTCP, getLongRoomId } from 'tiny-bilibili-ws'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const res = await getLongRoomId(process.env.VITE_ROOM as any)

const live = new KeepLiveTCP(res.data.room_id)

live.on('open', () => console.log('连接成功'))

live.on('close', () => console.log('断开连接'))

live.on('SEND_GIFT', (message) => { // 有礼物, 但不会被触发
  console.log(message)
})

live.on('DANMU_MSG', console.log)

live.getOnline()
  .then(console.log)
  .catch(console.error)
