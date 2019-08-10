const fetch = require('node-fetch')
const config = require('./config')
const qs = require('querystring')

class TrackerAPI {
  constructor(token) {
    this.token = token
  }

  _headers(headers) {
    return {
      'X-TrackerToken': this.token,
      ...headers,
    }
  }

  async stories(projectId, query = {}) {
    return fetch(
      `https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories?${qs.stringify(
        query
      )}`,
      {
        headers: this._headers(),
      }
    ).then(res =>
      res
        .json()
        .then(response => ({ status: res.status, ok: res.ok, response }))
    )
  }

  async updateStory(projectId, storyId, update) {
    return fetch(
      `https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories?${qs.stringify(
        query
      )}`,
      {
        headers: this._headers({
          'content-type': 'application/json'
        }),
        body: JSON.stringify(update)
      }
    ).then(res =>
      res
        .json()
        .then(response => ({ status: res.status, ok: res.ok, response }))
    )
  }
}

module.exports = new TrackerAPI(config.apiToken)
