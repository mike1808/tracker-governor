"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOutOfSyncStories = getOutOfSyncStories;
exports.printStories = printStories;
exports.syncPublicStoriesState = syncPublicStoriesState;
Object.defineProperty(exports, "commentAboutSyncedState", {
  enumerable: true,
  get: function () {
    return _common.commentAboutSyncedState;
  }
});

var _assert = _interopRequireDefault(require("assert"));

var _chalk = _interopRequireDefault(require("chalk"));

var _api = _interopRequireDefault(require("./api"));

var _common = require("./common");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function getOutOfSyncStories(publicProjectId, privateProjectId) {
  const publicStories = await (0, _common.fetchPrivateStoriesFromPublicProject)(publicProjectId);
  const privateStoriesResponse = await _api.default.storiesById(privateProjectId, // $FlowFixMe ignore as we are filtering publicStories
  publicStories.map(({
    privateId
  }) => privateId));
  (0, _assert.default)(privateStoriesResponse.ok, `Cannot fetch private stories: ${JSON.stringify(privateStoriesResponse.response)}`);
  return getUnsyncedStories(publicStories, privateStoriesResponse.response);
}

function printStories(stories) {
  if (stories.length) {
    stories.forEach(story => {
      console.log(`${_chalk.default.blue(story.name)}
    should be ${_chalk.default.red(story.actualState)} but it is ${_chalk.default.green(story.currentState)}
    public: [#${story.publicId}](${story.publicUrl})
    private: [#${story.privateId}](${story.privateUrl})
    `);
    });
  } else {
    console.log(`🙌 Nice! Your tracker is in sync!`);
  }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zeW5jLmpzIl0sIm5hbWVzIjpbImdldE91dE9mU3luY1N0b3JpZXMiLCJwdWJsaWNQcm9qZWN0SWQiLCJwcml2YXRlUHJvamVjdElkIiwicHVibGljU3RvcmllcyIsInByaXZhdGVTdG9yaWVzUmVzcG9uc2UiLCJhcGkiLCJzdG9yaWVzQnlJZCIsIm1hcCIsInByaXZhdGVJZCIsIm9rIiwiSlNPTiIsInN0cmluZ2lmeSIsInJlc3BvbnNlIiwiZ2V0VW5zeW5jZWRTdG9yaWVzIiwicHJpbnRTdG9yaWVzIiwic3RvcmllcyIsImxlbmd0aCIsImZvckVhY2giLCJzdG9yeSIsImNvbnNvbGUiLCJsb2ciLCJjaGFsayIsImJsdWUiLCJuYW1lIiwicmVkIiwiYWN0dWFsU3RhdGUiLCJncmVlbiIsImN1cnJlbnRTdGF0ZSIsInB1YmxpY0lkIiwicHVibGljVXJsIiwicHJpdmF0ZVVybCIsInN5bmNQdWJsaWNTdG9yaWVzU3RhdGUiLCJwcm9qZWN0SWQiLCJQcm9taXNlIiwiYWxsIiwidXBkYXRlU3RvcnkiLCJjdXJyZW50X3N0YXRlIiwiaW5kZXgiLCJlcnJvciIsImZpbHRlciIsIkJvb2xlYW4iLCJwcml2YXRlU3RvcmllcyIsInByaXZhdGVTdG9yeVRvUHViaWNTdG9yeSIsIk1hcCIsInNldCIsInB1YmxpY1N0b3J5IiwiZ2V0IiwiaWQiLCJzdGF0ZSIsInByaXZhdGVTdG9yeSIsInVybCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBRUE7O0FBQ0E7O0FBRUE7O0FBRUE7Ozs7QUFHTyxlQUFlQSxtQkFBZixDQUNMQyxlQURLLEVBRUxDLGdCQUZLLEVBR0w7QUFDQSxRQUFNQyxhQUFhLEdBQUcsTUFBTSxrREFBcUNGLGVBQXJDLENBQTVCO0FBRUEsUUFBTUcsc0JBR0wsR0FBRyxNQUFNQyxhQUFJQyxXQUFKLENBQ1JKLGdCQURRLEVBRVI7QUFDQUMsRUFBQUEsYUFBYSxDQUFDSSxHQUFkLENBQWtCLENBQUM7QUFBRUMsSUFBQUE7QUFBRixH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RUFBRXlDLFlBQVksQ0FBQ0YsRUFGbkI7QUFHTHhCLE1BQUFBLElBQUksRUFBRTBCLFlBQVksQ0FBQzFCLElBSGQ7QUFJTEksTUFBQUEsWUFBWSxFQUFFa0IsV0FBVyxDQUFDRyxLQUpyQjtBQUtMbkIsTUFBQUEsU0FBUyxFQUFFZ0IsV0FBVyxDQUFDSyxHQUxsQjtBQU1McEIsTUFBQUEsVUFBVSxFQUFFbUIsWUFBWSxDQUFDQyxHQU5wQjtBQU9MekIsTUFBQUEsV0FBVyxFQUFFd0IsWUFBWSxDQUFDYjtBQVByQixLQUFQO0FBU0QsR0FuQkksRUFvQkpHLE1BcEJJLENBb0JHQyxPQXBCSCxDQUFQO0FBcUJEIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnXG5cbmltcG9ydCBhcGkgZnJvbSAnLi9hcGknXG5pbXBvcnQgdHlwZSB7IFN0b3J5LCBTdG9yeVN0YXRlIH0gZnJvbSAnLi9hcGknXG5pbXBvcnQgeyBmZXRjaFByaXZhdGVTdG9yaWVzRnJvbVB1YmxpY1Byb2plY3QgfSBmcm9tICcuL2NvbW1vbidcbmltcG9ydCB0eXBlIHsgU3RvcnlBZ2dyZWdhdGVkIH0gZnJvbSAnLi9jb21tb24nXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRPdXRPZlN5bmNTdG9yaWVzKFxuICBwdWJsaWNQcm9qZWN0SWQ6IG51bWJlcixcbiAgcHJpdmF0ZVByb2plY3RJZDogbnVtYmVyXG4pIHtcbiAgY29uc3QgcHVibGljU3RvcmllcyA9IGF3YWl0IGZldGNoUHJpdmF0ZVN0b3JpZXNGcm9tUHVibGljUHJvamVjdChwdWJsaWNQcm9qZWN0SWQpXG5cbiAgY29uc3QgcHJpdmF0ZVN0b3JpZXNSZXNwb25zZToge1xuICAgIG9rOiBib29sZWFuLFxuICAgIHJlc3BvbnNlOiBTdG9yeVtdLFxuICB9ID0gYXdhaXQgYXBpLnN0b3JpZXNCeUlkKFxuICAgIHByaXZhdGVQcm9qZWN0SWQsXG4gICAgLy8gJEZsb3dGaXhNZSBpZ25vcmUgYXMgd2UgYXJlIGZpbHRlcmluZyBwdWJsaWNTdG9yaWVzXG4gICAgcHVibGljU3Rvcmllcy5tYXAoKHsgcHJpdmF0ZUlkIH0pID0+IHByaXZhdGVJZClcbiAgKVxuXG4gIGFzc2VydChcbiAgICBwcml2YXRlU3Rvcmllc1Jlc3BvbnNlLm9rLFxuICAgIGBDYW5ub3QgZmV0Y2ggcHJpdmF0ZSBzdG9yaWVzOiAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgcHJpdmF0ZVN0b3JpZXNSZXNwb25zZS5yZXNwb25zZVxuICAgICl9YFxuICApXG5cbiAgcmV0dXJuIGdldFVuc3luY2VkU3RvcmllcyhwdWJsaWNTdG9yaWVzLCBwcml2YXRlU3Rvcmllc1Jlc3BvbnNlLnJlc3BvbnNlKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRTdG9yaWVzKHN0b3JpZXM6IFN0b3J5QWdncmVnYXRlZFtdKSB7XG4gIGlmIChzdG9yaWVzLmxlbmd0aCkge1xuICAgIHN0b3JpZXMuZm9yRWFjaChzdG9yeSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhgJHtjaGFsay5ibHVlKHN0b3J5Lm5hbWUpfVxuICAgIHNob3VsZCBiZSAke2NoYWxrLnJlZChzdG9yeS5hY3R1YWxTdGF0ZSl9IGJ1dCBpdCBpcyAke2NoYWxrLmdyZWVuKFxuICAgICAgICBzdG9yeS5jdXJyZW50U3RhdGVcbiAgICAgICl9XG4gICAgcHVibGljOiBbIyR7c3RvcnkucHVibGljSWR9XSgke3N0b3J5LnB1YmxpY1VybH0pXG4gICAgcHJpdmF0ZTogWyMke3N0b3J5LnByaXZhdGVJZH1dKCR7c3RvcnkucHJpdmF0ZVVybH0pXG4gICAgYClcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUubG9nKGDwn5mMIE5pY2UhIFlvdXIgdHJhY2tlciBpcyBpbiBzeW5jIWApXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN5bmNQdWJsaWNTdG9yaWVzU3RhdGUoXG4gIHByb2plY3RJZDogbnVtYmVyLFxuICBzdG9yaWVzOiBTdG9yeUFnZ3JlZ2F0ZWRbXVxuKTogUHJvbWlzZTxTdG9yeUFnZ3JlZ2F0ZWRbXT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgIHN0b3JpZXMubWFwKHN0b3J5ID0+XG4gICAgICBhcGkudXBkYXRlU3RvcnkocHJvamVjdElkLCBzdG9yeS5wdWJsaWNJZCwge1xuICAgICAgICBjdXJyZW50X3N0YXRlOiBzdG9yeS5hY3R1YWxTdGF0ZSxcbiAgICAgIH0pXG4gICAgKVxuICApXG5cbiAgcmV0dXJuIHJlc3BvbnNlXG4gICAgLm1hcCgoeyBvayB9LCBpbmRleCkgPT4ge1xuICAgICAgaWYgKCFvaykge1xuICAgICAgICBjb25zb2xlLmVycm9yKGBDb3VsZCBub3QgdXBkYXRlIHN0b3J5OiAke3N0b3JpZXNbaW5kZXhdLnB1YmxpY1VybH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHN0b3JpZXNbaW5kZXhdXG4gICAgfSlcbiAgICAuZmlsdGVyKEJvb2xlYW4pXG59XG5cbmV4cG9ydCB7IGNvbW1lbnRBYm91dFN5bmNlZFN0YXRlIH0gZnJvbSAnLi9jb21tb24nXG5cbmZ1bmN0aW9uIGdldFVuc3luY2VkU3RvcmllcyhwdWJsaWNTdG9yaWVzLCBwcml2YXRlU3Rvcmllcyk6IFN0b3J5QWdncmVnYXRlZFtdIHtcbiAgY29uc3QgcHJpdmF0ZVN0b3J5VG9QdWJpY1N0b3J5ID0gbmV3IE1hcCgpXG5cbiAgcHVibGljU3Rvcmllcy5mb3JFYWNoKHN0b3J5ID0+IHtcbiAgICBwcml2YXRlU3RvcnlUb1B1YmljU3Rvcnkuc2V0KHN0b3J5LnByaXZhdGVJZCwgc3RvcnkpXG4gIH0pXG5cbiAgcmV0dXJuIHByaXZhdGVTdG9yaWVzXG4gICAgLmZpbHRlcihzdG9yeSA9PiB7XG4gICAgICBjb25zdCBwdWJsaWNTdG9yeSA9IHByaXZhdGVTdG9yeVRvUHViaWNTdG9yeS5nZXQoc3RvcnkuaWQpXG4gICAgICByZXR1cm4gcHVibGljU3RvcnkgJiYgcHVibGljU3Rvcnkuc3RhdGUgIT09IHN0b3J5LmN1cnJlbnRfc3RhdGVcbiAgICB9KVxuICAgIC5tYXAocHJpdmF0ZVN0b3J5ID0+IHtcbiAgICAgIGNvbnN0IHB1YmxpY1N0b3J5ID0gcHJpdmF0ZVN0b3J5VG9QdWJpY1N0b3J5LmdldChwcml2YXRlU3RvcnkuaWQpXG5cbiAgICAgIGlmICghcHVibGljU3RvcnkpIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHB1YmxpY0lkOiBwdWJsaWNTdG9yeS5pZCxcbiAgICAgICAgcHJpdmF0ZUlkOiBwcml2YXRlU3RvcnkuaWQsXG4gICAgICAgIG5hbWU6IHByaXZhdGVTdG9yeS5uYW1lLFxuICAgICAgICBjdXJyZW50U3RhdGU6IHB1YmxpY1N0b3J5LnN0YXRlLFxuICAgICAgICBwdWJsaWNVcmw6IHB1YmxpY1N0b3J5LnVybCxcbiAgICAgICAgcHJpdmF0ZVVybDogcHJpdmF0ZVN0b3J5LnVybCxcbiAgICAgICAgYWN0dWFsU3RhdGU6IHByaXZhdGVTdG9yeS5jdXJyZW50X3N0YXRlLFxuICAgICAgfVxuICAgIH0pXG4gICAgLmZpbHRlcihCb29sZWFuKVxufVxuIl19