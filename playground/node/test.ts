import path from 'node:path'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { KeepLiveWS } from 'tiny-bilibili-ws'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const live = new KeepLiveWS(process.env.VITE_ROOM as any, {
  // uid: 32140469,
  // buvid: '1517DD0A-0A72-7039-2EE2-DC76CFC2408709872infoc',
  // key: 'zfYifs1uI1RrPpyGY07Zdlbcd2Y_riAWqn-ISq4oI9phE1Vg8ZqmqBQQyGBpcER6DU5vfQqgqKISu0SP_P3zS0gmrqDM7EDMfGR44PlnaSlJoIB3-hu0kx_P_XTaJLLDM3YQ91XthTADaY7GnQLgpfvN5tFJWATFCLZB_YjKQX_O8TrGHlyUDYg=',
})

live.on('open', () => console.log('连接成功'))
live.on('close', () => console.log('断开连接'))

live.on('SEND_GIFT', (message) => { // 有礼物, 但不会被触发
  console.log(message)
})

live.on('DANMU_MSG', console.log)

live.getOnline()
  .then(console.log)
  .catch(console.error)
