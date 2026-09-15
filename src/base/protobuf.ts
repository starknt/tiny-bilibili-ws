export interface ProtobufField {
  number: number
  wireType: number
  value: number | Uint8Array
}

const textDecoder = new TextDecoder()

export function decodeBase64(value: string): Uint8Array {
  const binary = atob(value)
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

function readVarint(buffer: Uint8Array, offset: number): [number, number] {
  let value = 0
  let multiplier = 1

  while (offset < buffer.length) {
    const byte = buffer[offset++]
    value += (byte & 0x7F) * multiplier
    if ((byte & 0x80) === 0)
      return [value, offset]
    multiplier *= 128
  }

  throw new Error('Invalid protobuf varint')
}

export function decodeProtobufFields(buffer: Uint8Array): ProtobufField[] {
  const fields: ProtobufField[] = []
  let offset = 0

  while (offset < buffer.length) {
    let tag: number
    ;[tag, offset] = readVarint(buffer, offset)
    const number = Math.floor(tag / 8)
    const wireType = tag & 7

    if (number === 0)
      throw new Error('Invalid protobuf field number')

    if (wireType === 0) {
      let value: number
      ;[value, offset] = readVarint(buffer, offset)
      fields.push({ number, wireType, value })
    }
    else if (wireType === 1) {
      if (offset + 8 > buffer.length)
        throw new Error('Invalid protobuf fixed64 field')
      offset += 8
    }
    else if (wireType === 2) {
      let length: number
      ;[length, offset] = readVarint(buffer, offset)
      const end = offset + length
      if (end > buffer.length)
        throw new Error('Invalid protobuf length-delimited field')
      fields.push({ number, wireType, value: buffer.subarray(offset, end) })
      offset = end
    }
    else if (wireType === 5) {
      if (offset + 4 > buffer.length)
        throw new Error('Invalid protobuf fixed32 field')
      offset += 4
    }
    else {
      throw new Error(`Unsupported protobuf wire type: ${wireType}`)
    }
  }

  return fields
}

export function getProtobufVarint(fields: ProtobufField[], number: number): number {
  const value = fields.find(field => field.number === number && field.wireType === 0)?.value
  return typeof value === 'number' ? value : 0
}

export function getProtobufBytes(fields: ProtobufField[], number: number): Uint8Array | undefined {
  const value = fields.find(field => field.number === number && field.wireType === 2)?.value
  return value instanceof Uint8Array ? value : undefined
}

export function getProtobufString(fields: ProtobufField[], number: number): string {
  const value = getProtobufBytes(fields, number)
  return value ? textDecoder.decode(value) : ''
}
