export interface IWebSocket {
  send(data: Uint8Array): void
  close(): void
}

export interface ISocket {
  write(data: Uint8Array): void
  end(): void
}
