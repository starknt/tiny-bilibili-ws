import path from 'node:path'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { KeepLiveWS, toMessageData } from 'tiny-bilibili-ws'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const live = new KeepLiveWS(process.env.VITE_ROOM as any, {
  uid: Number(process.env.VITE_UID!),
  headers: {
    Cookie: process.env.VITE_COOKIE!,
  },
  stub: true,
})

live.on('DANMU_MSG', m => console.log(toMessageData(m).info[1]))

live.getOnline()
  .then(console.log)
  .catch(console.error)
