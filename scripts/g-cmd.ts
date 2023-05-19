import path from 'node:path'
import fs from 'node:fs'
import * as dotenv from 'dotenv'
import { KeepLiveTCP, getLongRoomId } from 'tiny-bilibili-ws'

dotenv.config({ path: path.resolve(process.cwd(), './playground/.env.local') })

const referenceDirectory = path.resolve(process.cwd(), './reference')

const { data } = await getLongRoomId(process.env.VITE_ROOM as any)

const tcp = new KeepLiveTCP(data.room_id, { stub: true })

tcp.on('msg', (msg) => {
  if (!fs.existsSync(path.join(referenceDirectory, `${msg.data.cmd}.json5`))) {
    fs.writeFile(path.join(referenceDirectory, `${msg.data.cmd}.json5`), JSON.stringify(msg.data), (err) => {
      if (err)
        console.error(err)
    })
  }
})
