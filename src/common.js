import type { Story, StoryState } from './api'
import api from './api'
import assert from 'assert'

export type StoryAggregated = {|
  publicId: number,
  privateId: number,
  name: string,
  currentState: StoryState,
  actualState: StoryState,
  publicUrl: string,
  privateUrl: string,
|}

export type PrivateStoryInPublicProject = {|
  id: number,
  privateId: number,
  state: StoryState,
  url: string,
|}

export async function fetchPrivateStoriesFromPublicProject(
  publicProjectId: number
): Promise<PrivateStoryInPublicProject[]> {
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

  return publicStoriesResponse.response
    .filter(story => story.name.match(/Pivotal Only/))
    .map(story => ({
      id: story.id,
      state: story.current_state,
      url: story.url,
      privateId: parsePrivateId(story),
    }))
    .filter(story => story.privateId)
}

function parsePrivateId(story): ?number {
  const tokens = story.name.match(/#(\d+)/)

  if (!tokens) {
    return console.error(`Invalid story name: ${story.name}`)
  }

  return Number(tokens[1])
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
}

export function getStoryUrl(id: number) {
  return `https://www.pivotaltracker.com/story/show/${id}`
}
