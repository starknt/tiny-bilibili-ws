import { describe, expect, it } from 'vitest'
import { EventEmitter } from './eventemitter'

describe('eventEmitter', () => {
  it('basic test case', () => {
    const emitter = new EventEmitter<{ close: boolean, t1: void }>()
    let emitHit = 0

    emitter.on('t1', () => {
      emitHit += 1
    })

    expect(emitHit).eq(0)
    expect(emitter.listenerCount('t1')).eq(1)

    emitter.emit('t1')

    expect(emitHit).eq(1)
    expect(emitter.listenerCount('t1')).eq(1)

    emitter.on('t1', () => {
      emitHit += 1
    })

    emitter.emit('t1')

    expect(emitHit).eq(3)
    expect(emitter.listenerCount('t1')).eq(2)

    emitter.removeAllListeners('t1')

    expect(emitHit).eq(3)
    expect(emitter.listenerCount('t1')).eq(0)
  })

  it('advance test case', () => {
    const emitter = new EventEmitter()
    let emitHit = 0
    const f = () => {
      emitHit += 1
    }

    emitter.addListener('t1', () => {
      emitHit += 1
    })

    emitter.addListener('t2', f)

    emitter.emit('t1')

    expect(emitHit).eq(1)
    expect(emitter.listenerCount('t1')).eq(1)
    expect(emitter.listenerCount('t2')).eq(1)
    expect(emitter.listenerCount()).eq(2)
    emitter.removeListener('t1', f)
    expect(emitter.listenerCount('t1')).eq(1)
    expect(emitter.listenerCount('t2')).eq(1)
    expect(emitter.listenerCount()).eq(2)
    emitter.removeListener('t2', f)
    expect(emitter.listenerCount('t1')).eq(1)
    expect(emitter.listenerCount('t2')).eq(0)
    expect(emitter.listenerCount()).eq(1)
  })

  it('advance test case(2)', () => {
    const emitter = new EventEmitter()
    let emitHit = 0
    const f = () => {
      emitHit += 1
    }

    emitter.addListener('hit', f)

    for (let i = 0; i < 1000; i++) {
      emitter.emit('hit')
    }

    expect(emitHit).eq(1000)
  })
})
