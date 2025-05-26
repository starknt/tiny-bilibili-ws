import https from 'node:https'
import { URL } from 'node:url'

export interface HttpRequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  data?: Record<string, any> | string
  timeout?: number
}

export interface HttpResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
}

// 封装 HTTPS 请求
export function httpRequest<T = any>(options: HttpRequestOptions): Promise<HttpResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = new URL(options.url)
    const method = options.method || 'GET'

    const requestOptions = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...options.headers,
      },
      timeout: options.timeout || 10000,
    }

    const req = https.request(requestOptions, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        let parsedData
        try {
          parsedData = JSON.parse(data)
        }
        catch {
          parsedData = data
        }

        const headers: Record<string, string> = {}
        Object.entries(res.headers).forEach(([key, value]) => {
          if (key && value) {
            headers[key] = Array.isArray(value) ? value.join(', ') : value
          }
        })

        resolve({
          data: parsedData,
          status: res.statusCode || 0,
          headers,
        })
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    req.on('timeout', () => {
      req.destroy()
      reject(new Error(`请求超时: ${options.url}`))
    })

    if (options.data && method !== 'GET') {
      const postData = typeof options.data === 'string'
        ? options.data
        : JSON.stringify(options.data)
      req.write(postData)
    }

    req.end()
  })
}
