"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _express = _interopRequireDefault(require("express"));

var _util = require("util");

var _config = _interopRequireDefault(require("./config"));

var _common = require("./common");

var _sync = require("./sync");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();
app.use(_express.default.json());
app.use(_express.default.urlencoded({
  extended: true
}));
app.get('/', (req, res) => {
  res.end();
});
app.post('/', async (req, res) => {
  res.end();
  console.log('Received activity');
  console.log((0, _util.inspect)(req.body, {
    colors: true,
    depth: null
  }));

  if (!needToProcess(req.body, app.get('storiesToTrack'), app.get('projects').private)) {
    console.log('Not processing');
    return;
  }

  console.log('Processing...');
  const story = getAggregatedState(req.body, app.get('privateIdToPublicId'));
  console.log('Will update to', (0, _util.inspect)(story, {
    colors: true
  }));
  (0, _sync.printStories)([story]);
  const response = await (0, _sync.syncPublicStoriesState)(app.get('projects').public, [story]);

  if (response.length && response[0]) {
    console.log('Successfully updated');
    await (0, _common.commentAboutSyncedState)(app.get('projects').public, [story]);
  } else {
    console.log('Cannot updated');
  }
});

async function _default(publicProjectId, privateProjectId) {
  app.set('projects', {
    public: publicProjectId,
    private: privateProjectId
  });
  const privateStoriesInPublicProject = await (0, _common.fetchPrivateStoriesFromPublicProject)(publicProjectId);
  const privateIdToPublicId = new Map();
  privateStoriesInPublicProject.forEach(story => {
    privateIdToPublicId.set(story.privateId, story.id);
  });
  app.set('storiesToTrack', privateStoriesInPublicProject);
  app.set('privateIdToPublicId', privateIdToPublicId);
  await (0, _util.promisify)(app.listen.bind(app))(_config.default.port);
  return _config.default.port;
}

function needToProcess(activity, stories, privateProjectId) {
  const storyIds = stories.map(story => story.privateId);
  return true && activity.project.id === privateProjectId && activity.kind === 'story_update_activity' && activity.primary_resources.length && activity.primary_resources[0].kind === 'story' && storyIds.includes(activity.primary_resources[0].id) && activity.changes.length && activity.changes[0].new_values.current_state != null;
}

function getAggregatedState(activity, privateIdToPublicId) {
  const privateStory = activity.primary_resources[0];
  const publicId = privateIdToPublicId.get(privateStory.id);
  return {
    privateId: privateStory.id,
    publicId,
    name: privateStory.name,
    currentState: activity.changes[0].original_values.current_state,
    actualState: activity.changes[0].new_values.current_state,
    privateUrl: privateStory.url,
    publicUrl: (0, _common.getStoryUrl)(publicId)
  };
}