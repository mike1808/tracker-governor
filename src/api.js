// @flow

import fetch from 'node-fetch'
import qs from 'querystring'
import { inspect } from 'util'
import config from './config'

export type StoryState =
  | 'accepted'
  | 'delivered'
  | 'finished'
  | 'started'
  | 'rejected'
  | 'planned'
  | 'unstarted'
  | 'unscheduled'

export type Story = {|
  id: number,
  project_id: number,
  name: string,
  description: string,
  story_type: 'feature' | 'bug' | 'chore' | 'release',
  kind: 'story',
  current_state: StoryState,
  estimate?: number,
  accepted_at: string,
  'deadline?': string,
  projected_completion?: string,
  points_accepted?: number,
  points_total?: number,
  points_total?: number,
  created_at: string,
  updated_at: string,
  requested_by_id: number,
  url: string,
  owner_ids: number[],
  labels: string[],
  owned_by_id: number,
|}

export type Activity = {|
  kind: string,
  guid: string,
  project_version: string,
  message: string,
  highlight: string,
  changes: {}[],
  primary_resources: {}[],
  secondary_resources: {}[],
  project_id: number,
  perform_by_id: number,
  occurred_at: string,
|}

type Response<Body> = {|
  ok: boolean,
  status: number,
  response: Body,
|}

function fetchDryRun(url, options) {
  console.log(`fetching ${url} with options: ${inspect(options)}`)

  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
}

class TrackerAPI {
  token: string

  constructor(token: string) {
    this.token = token
  }

  _headers(headers: {} = {}) {
    return {
      'X-TrackerToken': this.token,
      ...headers,
    }
  }

  async stories(projectId: number, query: {} = {}): Promise<Response<Story[]>> {
    return fetch(
      `https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories?${qs.stringify(
        query
      )}`,
      {
        headers: this._headers(),
      }
    ).then(res =>
      res.json().then((response: Story[]) => ({
        status: res.status,
        ok: res.ok,
        response,
      }))
    )
  }

  async storiesById(
    projectId: number,
    ids: number[]
  ): Promise<Response<Story[]>> {
    return fetch(
      `https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories/bulk?${qs.stringify(
        {
          ids: ids.join(','),
        }
      )}`,
      {
        headers: this._headers(),
      }
    ).then(res =>
      res.json().then((response: Story[]) => ({
        status: res.status,
        ok: res.ok,
        response,
      }))
    )
  }

  async updateStory(
    projectId: number,
    storyId: number,
    update: $Shape<Story>
  ): Promise<Response<Story>> {
    return (config.dev ? fetchDryRun : fetch)(
      `https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories/${storyId}`,
      {
        method: 'put',
        headers: this._headers({
          'content-type': 'application/json',
        }),
        body: JSON.stringify(update),
      }
    ).then(res =>
      res
        .json()
        // $FlowFixMe ignore
        .then(response => ({ status: res.status, ok: res.ok, response }))
    )
  }
  async postComment(
    projectId: number,
    storyId: number,
    comment: string
  ): Promise<Response<void>> {
    return (config.dev ? fetchDryRun : fetch)(
      `https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories/${storyId}/comments`,
      {
        method: 'post',
        headers: this._headers({
          'content-type': 'application/json',
        }),
        body: JSON.stringify({
          text: comment,
        }),
      }
    ).then(res =>
      res
        .json()
        // $FlowFixMe ignore
        .then(response => ({ status: res.status, ok: res.ok, response }))
    )
  }
}

export default new TrackerAPI(config.apiToken)
