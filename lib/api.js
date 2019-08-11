"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _querystring = _interopRequireDefault(require("querystring"));

var _util = require("util");

var _config = _interopRequireDefault(require("./config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function fetchDryRun(url, options) {
  console.log(`fetching ${url} with options: ${(0, _util.inspect)(options)}`);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({})
  });
}

class TrackerAPI {
  constructor(token) {
    this.token = token;
  }

  _headers(headers = {}) {
    return {
      'X-TrackerToken': this.token,
      ...headers
    };
  }

  async stories(projectId, query = {}) {
    return (0, _nodeFetch.default)(`https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories?${_querystring.default.stringify(query)}`, {
      headers: this._headers()
    }).then(res => res.json().then(response => ({
      status: res.status,
      ok: res.ok,
      response
    })));
  }

  async storiesById(projectId, ids) {
    return (0, _nodeFetch.default)(`https://www.pivotaltracker.com/services/v5/projects/${projectId}/stories/bulk?${_querystring.default.stringify({
      ids: ids.join(',')
    })}`, {
      headers: this._headers()
    }).then(res => res.json().then(response => ({
      status: res.status,
      ok: res.ok,
      response
    })));
  }

  async updateStory(projectId, storyId, update) {
    return (_config.default.dev ? fetchDryRun : _nodeFetch.default)(`https://www.pivotdaltracker.com/services/v5/projects/${projectId}/stories/${storyId}`, {
      method: 'put',
      headers: this._headers({
        'content-type': 'application/json'
      }),
      body: JSON.stringify(update)
    }).then(res => res.json() // $FlowFixMe ignore
    .then(response => ({
      status: res.status,
      ok: res.ok,
      response
    })));
  }

}

var _default = new TrackerAPI(_config.default.apiToken);

exports.default = _default;