import { describe, expect, test } from 'vitest'
import { EventEmitter } from './eventemitter'

describe('EventEmitter', () => {
  test('Basic test case', () => {
    const emitter = new EventEmitter<{ close: boolean; t1: void }>()
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

  test('Advance test case', () => {
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
})
