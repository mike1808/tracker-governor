// @flow

import assert from 'assert'
import chalk from 'chalk'

import api from './api'
import type { Story, StoryState } from './api'

type StoryAggregated = {|
  publicId: number,
  privateId: number,
  name: string,
  currentState: StoryState,
  actualState: StoryState,
  publicUrl: string,
  privateUrl: string,
|}

export async function getOutOfSyncStories(
  publicProjectId: number,
  privateProjectId: number
) {
  const publicStoriesResponse: {
    ok: boolean,
    response: Story[],
  } = await api.stories(publicProjectId, {
    filter: 'Pivotal Only',
  })

  assert(
    publicStoriesResponse.ok,
    `Cannot fetch public stories: ${JSON.stringify(
      publicStoriesResponse.response
    )}`
  )

  const publicStories = publicStoriesResponse.response
    .filter(story => story.name.match(/Pivotal Only/))
    .map(story => ({
      id: story.id,
      type: story.story_type,
      state: story.current_state,
      url: story.url,
      privateId: parsePrivateId(story),
    }))
    .filter(story => story.privateId)

  const privateStoriesResponse: {
    ok: boolean,
    response: Story[],
  } = await api.storiesById(
    privateProjectId,
    // $FlowFixMe ignore as we are filtering publicStories
    publicStories.map(({ privateId }) => privateId)
  )

  assert(
    privateStoriesResponse.ok,
    `Cannot fetch private stories: ${JSON.stringify(
      privateStoriesResponse.response
    )}`
  )

  return getUnsyncedStories(publicStories, privateStoriesResponse.response)
}

export function printStories(stories: StoryAggregated[]) {
  stories.forEach(story => {
    console.log(`${chalk.blue(story.name)}
    should be ${chalk.red(story.actualState)} but it is ${chalk.green(
      story.currentState
    )}
    public: [#${story.publicId}](${story.publicUrl})
    private: [#${story.privateId}](${story.privateUrl})
    `)
  })
}

export async function syncPublicStoriesState(
  projectId: number,
  stories: StoryAggregated[]
) {
  const response = await Promise.all(
    stories.map(story =>
      api.updateStory(projectId, story.publicId, {
        current_state: story.actualState,
      })
    )
  )

  return response
    .map(({ ok }, index) => {
      if (!ok) {
        console.error(`Could not update story: ${stories[index].publicUrl}`)
        return
      }

      return stories[index]
    })
    .filter(Boolean)
}

export async function commentAboutSyncedState(
  projectId: number,
  stories: StoryAggregated[]
) {
  return await Promise.all(
    stories.map(story =>
      api.postComment(
        projectId,
        story.publicId,
        `*Tracker Governor* updated story state from ` +
          `**${story.currentState}** to **${story.actualState}** to match the private story #${story.privateId}. `
      )
    )
  )

  return response
    .map(({ ok }, index) => {
      if (!ok) {
        console.error(`Could not update story: ${stories[index].publicUrl}`)
        return
      }

      return stories[index]
    })
    .filter(Boolean)
}

function parsePrivateId(story): ?number {
  const tokens = story.name.match(/#(\d+)/)

  if (!tokens) {
    return console.error(`Invalid story name: ${story.name}`)
  }

  return Number(tokens[1])
}

function getUnsyncedStories(publicStories, privateStories): StoryAggregated[] {
  const privateStoryToPubicStory = new Map()

  publicStories.forEach(story => {
    privateStoryToPubicStory.set(story.privateId, story)
  })

  return privateStories
    .filter(story => {
      const publicStory = privateStoryToPubicStory.get(story.id)
      return publicStory && publicStory.state !== story.current_state
    })
    .map(privateStory => {
      const publicStory = privateStoryToPubicStory.get(privateStory.id)

      if (!publicStory) return null

      return {
        publicId: publicStory.id,
        privateId: privateStory.id,
        name: privateStory.name,
        currentState: publicStory.state,
        publicUrl: publicStory.url,
        privateUrl: privateStory.url,
        actualState: privateStory.current_state,
      }
    })
    .filter(Boolean)
}
