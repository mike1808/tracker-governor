"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchPrivateStoriesFromPublicProject = fetchPrivateStoriesFromPublicProject;
exports.commentAboutSyncedState = commentAboutSyncedState;
exports.getStoryUrl = getStoryUrl;

var _api = _interopRequireDefault(require("./api"));

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function fetchPrivateStoriesFromPublicProject(publicProjectId) {
  const publicStoriesResponse = await _api.default.stories(publicProjectId, {
    filter: 'Pivotal Only'
  });
  (0, _assert.default)(publicStoriesResponse.ok, `Cannot fetch public stories: ${JSON.stringify(publicStoriesResponse.response)}`);
  return publicStoriesResponse.response.filter(story => story.name.match(/Pivotal Only/)).map(story => ({
    id: story.id,
    state: story.current_state,
    url: story.url,
    privateId: parsePrivateId(story)
  })).filter(story => story.privateId);
}

function parsePrivateId(story) {
  const tokens = story.name.match(/#(\d+)/);

  if (!tokens) {
    return console.error(`Invalid story name: ${story.name}`);
  }

  return Number(tokens[1]);
}

async function commentAboutSyncedState(projectId, stories) {
  return await Promise.all(stories.map(story => _api.default.postComment(projectId, story.publicId, `*Tracker Governor* updated story state from ` + `**${story.currentState}** to **${story.actualState}** to match the private story #${story.privateId}. `)));
}

function getStoryUrl(id) {
  return `https://www.pivotaltracker.com/story/show/${id}`;
}