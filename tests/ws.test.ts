import { KeepLiveWS } from 'tiny-bilibili-ws'
import { beforeEach, describe, expect, it } from 'vitest'

describe('ws', () => {
  let ws: KeepLiveWS

  beforeEach(() => {
    ws = new KeepLiveWS(6)
  })

  it('basic test case', async () => {
    expect(await ws.getOnline()).toBeGreaterThanOrEqual(0)
  })
})
