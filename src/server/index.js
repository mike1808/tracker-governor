// @flow

import express from 'express'
import { promisify, inspect } from 'util'
import config from '../config'
import type { Activity } from '../api'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  console.log(inspect(req.body, { colors: true, depth: null }))
  res.end()
})

app.post('/', (req, res) => {
  console.log(inspect(req.body, { colors: true, depth: null }))
  res.end()
})

export default function(publicProjectId: number, privateProjectId: number) {
  app.set('projects', {
    public: publicProjectId,
    private: privateProjectId,
  })

  return promisify(app.listen.bind(app))(config.port)
    .then(() => config.port)
}
