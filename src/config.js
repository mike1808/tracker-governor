// @flow

import assert from 'assert'
import dotenv from 'dotenv'

dotenv.config()

type Config = {|
  dev: boolean,
  apiToken: string,
  port: number,
|}

assert(process.env.TG_API_TOKEN, 'TG_API_TOKEN is required')

const config: Config = {
  dev: process.env.NODE_ENV === 'development',
  apiToken: process.env.TG_API_TOKEN || '',
  port: +process.env.PORT || 3000,
}

export default config
