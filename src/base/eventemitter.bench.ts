/* eslint-disable unused-imports/no-unused-vars */
import NodeEventEmitter from 'node:events'
import EventEmitter3 from 'eventemitter3'
import { bench, describe } from 'vitest'
import { EventEmitter } from './eventemitter'

describe('emit', () => {
  const times = 1000000
  const emitter = new NodeEventEmitter()
  const emitter3 = new EventEmitter3()
  const typeemitter = new EventEmitter<{ t1: void }>()

  bench('nodeJs', () => {
    let i = 0
    emitter.on('t1', () => {
      i++
    })

    for (let i = 0; i < times; i++)
      emitter.emit('t1')
  })

  bench('eventemitter3', () => {
    let i = 0
    emitter3.on('t1', () => {
      i++
    })

    for (let i = 0; i < times; i++)
      emitter3.emit('t1')
  })

  bench('eventemitter', () => {
    let i = 0
    typeemitter.on('t1', () => {
      i++
    })

    for (let i = 0; i < times; i++)
      typeemitter.emit('t1')
  })
})
