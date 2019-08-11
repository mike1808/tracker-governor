"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOutOfSyncStories = getOutOfSyncStories;
exports.printStories = printStories;
exports.syncPublicStoriesState = syncPublicStoriesState;
exports.commentAboutSyncedState = commentAboutSyncedState;

var _assert = _interopRequireDefault(require("assert"));

var _chalk = _interopRequireDefault(require("chalk"));

var _api = _interopRequireDefault(require("./api"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getOutOfSyncStories(publicProjectId, privateProjectId) {
  const publicStoriesResponse = await _api.default.stories(publicProjectId, {
    filter: 'Pivotal Only'
  });
  (0, _assert.default)(publicStoriesResponse.ok, `Cannot fetch public stories: ${JSON.stringify(publicStoriesResponse.response)}`);
  const publicStories = publicStoriesResponse.response.filter(story => story.name.match(/Pivotal Only/)).map(story => ({
    id: story.id,
    type: story.story_type,
    state: story.current_state,
    url: story.url,
    privateId: parsePrivateId(story)
  })).filter(story => story.privateId);
  const privateStoriesResponse = await _api.default.storiesById(privateProjectId, // $FlowFixMe ignore as we are filtering publicStories
  publicStories.map(({
    privateId
  }) => privateId));
  (0, _assert.default)(privateStoriesResponse.ok, `Cannot fetch private stories: ${JSON.stringify(privateStoriesResponse.response)}`);
  return getUnsyncedStories(publicStories, privateStoriesResponse.response);
}

function printStories(stories) {
  stories.forEach(story => {
    console.log(`${_chalk.default.blue(story.name)}
    should be ${_chalk.default.red(story.actualState)} but it is ${_chalk.default.green(story.currentState)}
    public: [#${story.publicId}](${story.publicUrl})
    private: [#${story.privateId}](${story.privateUrl})
    `);
  });
}

async function syncPublicStoriesState(projectId, stories) {
  const response = await Promise.all(stories.map(story => _api.default.updateStory(projectId, story.publicId, {
    current_state: story.actualState
  })));
  return response.map(({
    ok
  }, index) => {
    if (!ok) {
      console.error(`Could not update story: ${stories[index].publicUrl}`);
      return;
    }

    return stories[index];
  }).filter(Boolean);
}

async function commentAboutSyncedState(projectId, stories) {
  return await Promise.all(stories.map(story => _api.default.postComment(projectId, story.publicId, `*Tracker Governor* updated story state from ` + `**${story.currentState}** to **${story.actualState}** to match the private story #${story.privateId}. `)));
  return response.map(({
    ok
  }, index) => {
    if (!ok) {
      console.error(`Could not update story: ${stories[index].publicUrl}`);
      return;
    }

    return stories[index];
  }).filter(Boolean);
}

function parsePrivateId(story) {
  const tokens = story.name.match(/#(\d+)/);

  if (!tokens) {
    return console.error(`Invalid story name: ${story.name}`);
  }

  return Number(tokens[1]);
}

function getUnsyncedStories(publicStories, privateStories) {
  const privateStoryToPubicStory = new Map();
  publicStories.forEach(story => {
    privateStoryToPubicStory.set(story.privateId, story);
  });
  return privateStories.filter(story => {
    const publicStory = privateStoryToPubicStory.get(story.id);
    return publicStory && publicStory.state !== story.current_state;
  }).map(privateStory => {
    const publicStory = privateStoryToPubicStory.get(privateStory.id);
    if (!publicStory) return null;
    return {
      publicId: publicStory.id,
      privateId: privateStory.id,
      name: privateStory.name,
      currentState: publicStory.state,
      publicUrl: publicStory.url,
      privateUrl: privateStory.url,
      actualState: privateStory.current_state
    };
  }).filter(Boolean);
}