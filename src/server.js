// @flow

import express from 'express'
import { promisify, inspect } from 'util'
import config from './config'
import type { Activity, StoryState } from './api'
import {
  fetchPrivateStoriesFromPublicProject,
  getStoryUrl,
  commentAboutSyncedState,
} from './common'
import { syncPublicStoriesState, printStories } from './sync'
import type { PrivateStoryInPublicProject, StoryAggregated } from './common'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.end()
})

app.post('/', async (req, res) => {
  res.end()

  console.log('Received activity')
  console.log(inspect(req.body, { colors: true, depth: null }))

  if (
    !needToProcess(
      req.body,
      app.get('storiesToTrack'),
      app.get('projects').private
    )
  ) {
    console.log('Not processing')
    return
  }

  console.log('Processing...')

  const story = getAggregatedState(req.body, app.get('privateIdToPublicId'))

  console.log('Will update to', inspect(story, { colors: true }))

  printStories([story])

  const response = await syncPublicStoriesState(app.get('projects').public, [
    story,
  ])

  if (response.length && response[0]) {
    console.log('Successfully updated')
    await commentAboutSyncedState(app.get('projects').public, [story])
  } else {
    console.log('Cannot updated')
  }
})

export default async function(
  publicProjectId: number,
  privateProjectId: number
) {
  app.set('projects', {
    public: publicProjectId,
    private: privateProjectId,
  })

  const privateStoriesInPublicProject: PrivateStoryInPublicProject = await fetchPrivateStoriesFromPublicProject(
    publicProjectId
  )
  const privateIdToPublicId = new Map()
  privateStoriesInPublicProject.forEach(story => {
    privateIdToPublicId.set(story.privateId, story.id)
  })

  app.set('storiesToTrack', privateStoriesInPublicProject)
  app.set('privateIdToPublicId', privateIdToPublicId)

  await promisify(app.listen.bind(app))(config.port)

  return config.port
}

function needToProcess(
  activity: Activity,
  stories: PrivateStoryInPublicProject[],
  privateProjectId: number
) {
  const storyIds = stories.map(story => story.privateId)

  return (
    true &&
    activity.project.id === privateProjectId &&
    activity.kind === 'story_update_activity' &&
    activity.primary_resources.length &&
    activity.primary_resources[0].kind === 'story' &&
    storyIds.includes(activity.primary_resources[0].id) &&
    activity.changes.length &&
    activity.changes[0].new_values.current_state != null
  )
}

function getAggregatedState(
  activity: Activity,
  privateIdToPublicId: Map<number, number>
): StoryAggregated {
  const privateStory = activity.primary_resources[0]
  const publicId = privateIdToPublicId.get(privateStory.id)

  return {
    privateId: privateStory.id,
    publicId,
    name: privateStory.name,
    currentState: activity.changes[0].original_values.current_state,
    actualState: activity.changes[0].new_values.current_state,
    privateUrl: privateStory.url,
    publicUrl: getStoryUrl(publicId),
  }
}
