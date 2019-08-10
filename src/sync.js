const api = require('./api')
const config = require('./config')
const invariant = require('invariant')
const chalk = require('chalk')

async function sync(publicProjectId, privateProjectId, {dryRun = false} = {}) {
  const publicStoriesResponse = await api.stories(publicProjectId, {
    filter: 'Pivotal Only',
  })

  invariant(
    publicStoriesResponse.ok,
    `Cannot fetch public stories: ${JSON.stringify(
      publicStoriesResponse.response
    )}`
  )

  const publicStories = publicStoriesResponse.response
    .filter(story => story.name.match(/Pivotal Only/))
    .map(story => ({
      id: story.id,
      kind: story.kind,
      state: story.current_state,
      privateId: parsePrivateId(story),
    }))

  const privateStoriesResponse = await api.stories(privateProjectId, {
    filter: `id:${publicStories.map(({privateId}) => privateId).join(',')}`,
  })

  invariant(
    privateStoriesResponse.ok,
    `Cannot fetch private stories: ${JSON.stringify(
      privateStoriesResponse.response
    )}`
  )

  const outOfSyncPublicStories = getUnsyncedStories(
    publicStories,
    privateStoriesResponse.response
  )

  printUnsyncedStories(outOfSyncPublicStories);
}

function parsePrivateId(story) {
  const tokens = story.name.match(/#(\d+)/)

  if (!tokens) {
    invariant(`Invalid story name: ${story.name}`)
  }

  return Number(tokens[1])
}

function getUnsyncedStories(publicStories, privateStories) {
  const privateStoryToPubicStory = new Map()
  publicStories.forEach(story => {
    privateStoryToPubicStory.set(story.privateId, story)
  })

  return privateStories.filter(
    story => privateStoryToPubicStory.has(story.id) && privateStoryToPubicStory.get(story.id).state !== story.current_state
  ).map(privateStory => {
    const publicStory = privateStoryToPubicStory.get(privateStory.id)
    return {
      publicId: publicStory.id,
      privateId: privateStory.id,
      name: privateStory.name,
      currentState: publicStory.state,
      actualState: privateStory.current_state,
    }
  })
}

function printUnsyncedStories(stories) {
  stories.forEach(story => {
    console.log(`story: ${chalk.blue(story.name)}
    Public Projecy
    should be ${chalk.red(story.actualState)} but it is ${chalk.green(story.currentState)}`)
  })
}

module.exports = sync
