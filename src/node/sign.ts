import crypto from 'node:crypto'
import { getWbiKeys } from './api'

const mixinKeyEncTab = [
  46,
  47,
  18,
  2,
  53,
  8,
  23,
  32,
  15,
  50,
  10,
  31,
  58,
  3,
  45,
  35,
  27,
  43,
  5,
  49,
  33,
  9,
  42,
  19,
  29,
  28,
  14,
  39,
  12,
  38,
  41,
  13,
  37,
  48,
  7,
  16,
  24,
  55,
  40,
  61,
  26,
  17,
  0,
  1,
  60,
  51,
  30,
  4,
  22,
  25,
  54,
  21,
  56,
  59,
  6,
  63,
  57,
  62,
  11,
  36,
  20,
  34,
  44,
  52,
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
function getMixinKey(orig: string): string {
  let temp = ''
  mixinKeyEncTab.forEach((n) => {
    temp += orig[n]
  })
  return temp.slice(0, 32)
}

export function md5(data: string): string {
  const md5Hash = crypto.createHash('md5')
  md5Hash.update(data)
  return md5Hash.digest('hex')
}

interface ParamsObject {
  [key: string]: string | number | boolean
}

// 为请求参数进行 wbi 签名
export function encWbi(params: ParamsObject, img_key: string, sub_key: string): string {
  const mixin_key = getMixinKey(img_key + sub_key)
  const curr_time = Math.round(Date.now() / 1000)
  const chr_filter = /[!'()*]/g
  const query: string[] = []
  Object.assign(params, { wts: curr_time }) // 添加 wts 字段
  // 按照 key 重排参数
  Object.keys(params)
    .sort()
    .forEach((key) => {
      query.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(
          // 过滤 value 中的 "!'()*" 字符
          params[key].toString().replace(chr_filter, ''),
        )}`,
      )
    })
  const queryString = query.join('&')
  const wbi_sign = md5(queryString + mixin_key) // 计算 w_rid
  return `${queryString}&w_rid=${wbi_sign}`
}

// 签名
export async function WbiSign(params: ParamsObject): Promise<string> {
  const wbi_keys = await getWbiKeys()
  return encWbi(params, wbi_keys.img_key, wbi_keys.sub_key)
}
