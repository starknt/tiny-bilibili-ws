import path from 'node:path'
import * as dotenv from 'dotenv'
import { KeepLiveTCP, getLongRoomId } from '../dist/index.mjs'

dotenv.config({ path: path.resolve(process.cwd(), './playground/.env.local') })

const argv = process.argv.slice(2)[0]
const room = Number.isNaN(Number(argv)) ? process.env.VITE_ROOM : argv
const { data } = await getLongRoomId(room)

const tcp = new KeepLiveTCP(data.room_id)

tcp.runWhenConnected(() => {
  console.log('当前监听的直播间: ', data.room_id)
})

tcp.on('DANMU_MSG', ({ data }) => {
  console.log(data)
})
tcp.on('error', console.error)
tcp.on('close', (e) => {
  console.log('退出直播间', e)
})
