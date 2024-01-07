import NodeEventEmitter from 'node:events'
import EventEmitter3 from 'eventemitter3'
import { describe } from 'vitest'
import { EventEmitter } from './eventemitter'

describe('emit', () => {
  const times = 100

  it('nodeJs', () => {
    const emitter = new NodeEventEmitter()

    emitter.on('t1', () => {})

    for (let i = 0; i < times; i++)
      emitter.emit('t1')
  })

  it('eventemitter3', () => {
    const emitter = new EventEmitter3()

    emitter.on('t1', () => {})

    for (let i = 0; i < times; i++)
      emitter.emit('t1')
  })

  it('eventemitter', () => {
    const emitter = new EventEmitter<{ t1: void }>()

    emitter.on('t1', () => {})

    for (let i = 0; i < times; i++)
      emitter.emit('t1')
  })
})
