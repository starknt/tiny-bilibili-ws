import path from 'node:path'
import fs from 'node:fs'
import * as dotenv from 'dotenv'
import { KeepLiveTCP, getLongRoomId, toMessageData } from 'tiny-bilibili-ws'

dotenv.config({ path: path.resolve(process.cwd(), './playground/.env.local') })

const referenceDirectory = path.resolve(process.cwd(), './reference')

const { data } = await getLongRoomId(process.env.VITE_ROOM as any)

const tcp = new KeepLiveTCP(data.room_id)

tcp.runWhenConnected(() => {
  console.log('当前监听的直播间: ', data.room_id)
})

tcp.on('msg', (msg) => {
  if (!fs.existsSync(path.join(referenceDirectory, `${msg.data.cmd}.json5`))) {
    fs.writeFile(path.join(referenceDirectory, `${msg.data.cmd}.json5`), JSON.stringify(msg.data), (err) => {
      if (err)
        console.error(err)
    })
  }
})

// tcp.on('heartbeat', o => console.error('当前人气: ', o))
tcp.on('WATCHED_CHANGE', w => console.error(w.data.data.num, '人看过直播'))
tcp.on('DANMU_MSG', (danmu) => {
  console.log(toMessageData(danmu))
})
tcp.on('error', console.error)
tcp.on('close', console.error)
