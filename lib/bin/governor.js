#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _assert = _interopRequireDefault(require("assert"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _chalk = _interopRequireDefault(require("chalk"));

var sync = _interopRequireWildcard(require("../sync"));

var _server = _interopRequireDefault(require("../server"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version('0.0.1');

_commander.default.command('sync').description('sync state of public and private stories').option('-u, --public-project-id <id>', 'Project ID of the public project').option('-r, --private-project-id <id>', 'Project ID of the private project').option('-d, --dry-run', 'Don\'t perform any changes, print actions').option('-y, --yes', 'Automatic yes to prompts').option('-s, --silent', 'Use with --yes to silently change all stories').option('-n, --no-comments', 'Don\'t post comments about updated state').action(function (cmd) {
  (0, _assert.default)(cmd.publicProjectId, 'Public project ID is required');
  (0, _assert.default)(cmd.privateProjectId, 'Private project ID is required');
  sync.getOutOfSyncStories(cmd.publicProjectId, cmd.privateProjectId).then(outOfSyncStories => {
    if (!cmd.silent) {
      sync.printStories(outOfSyncStories);
    }

    return (cmd.yes ? Promise.resolve(outOfSyncStories) : promptStoriesToChange(outOfSyncStories)).then(storiesToChange => {
      if (cmd.dryRun) {
        return;
      }

      return sync.syncPublicStoriesState(cmd.publicProjectId, storiesToChange);
    }).then(updatedStories => {
      if (!cmd.noComments) {
        sync.commentAboutSyncedState(cmd.publicProjectId, updatedStories);
      }
    });
  });
});

_commander.default.command('server').description('start server to listen for project activity and sync stories state').option('-u, --public-project-id <id>', 'Project ID of the public project').option('-r, --private-project-id <id>', 'Project ID of the private project').action(function (cmd) {
  (0, _assert.default)(cmd.publicProjectId, 'Public project ID is required');
  (0, _assert.default)(cmd.privateProjectId, 'Private project ID is required');
  (0, _server.default)(cmd.publicProjectId, cmd.privateProjectId).then(port => {
    console.log(`Server started on port: ${port}`);
  }).catch(console.error.bind(console));
});

_commander.default.parse(process.argv);

function promptStoriesToChange(outOfSyncStories) {
  return _inquirer.default.prompt(outOfSyncStories.map(story => ({
    type: 'expand',
    message: `Change ${_chalk.default.blue(story.name)} state from ${_chalk.default.red(story.currentState)} to ${_chalk.default.green(story.actualState)}?`,
    default: 'change',
    name: story.publicId,
    choices: [{
      key: 'y',
      name: 'Change',
      value: 'change'
    }, {
      key: 'a',
      name: 'Change this one and all next',
      value: 'change_all'
    }, {
      key: 'n',
      name: 'Don\'t change',
      value: 'dont'
    }, {
      key: 'd',
      name: 'Don\'t change this and all next',
      value: 'dont_all'
    }, {
      key: 'q',
      name: 'Quit',
      value: 'quit'
    }],
    when: answers => Object.values(answers).every(a => a !== 'quit' && a !== 'change_all' && a !== 'dont_all')
  }))).then(answers => {
    const quit = Object.values(answers).some(a => a === 'quit');

    if (quit) {
      return [];
    }

    const changeAll = Object.values(answers).some(a => a === 'change_all');
    return changeAll ? outOfSyncStories : outOfSyncStories.filter(story => answers[story.publicId] === 'change');
  });
}