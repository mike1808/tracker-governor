#!/usr/bin/env node
"use strict";

var _commander = _interopRequireDefault(require("commander"));

var _assert = _interopRequireDefault(require("assert"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _chalk = _interopRequireDefault(require("chalk"));

var _sync = require("../sync");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_commander.default.version('0.0.1').command('sync').description('sync state of public and private stories').option('-u, --public-project-id <id>', 'Project ID of the public project').option('-r, --private-project-id <id>', 'Project ID of the private project').option('-d, --dry-run', 'Don\'t perform any changes, print actions').option('-y, --yes', 'Automatic yes to prompts').option('-s, --silent', 'Use with --yes to silently change all stories').action(function (cmd) {
  (0, _assert.default)(cmd.publicProjectId, 'Public project ID is required');
  (0, _assert.default)(cmd.privateProjectId, 'Private project ID is required');
  (0, _sync.getOutOfSyncStories)(cmd.publicProjectId, cmd.privateProjectId).then(outOfSyncStories => {
    if (!cmd.silent) {
      (0, _sync.printStories)(outOfSyncStories);
    }

    return (cmd.yes ? Promise.resolve(outOfSyncStories) : promptStoriesToChange(outOfSyncStories)).then(storiesToChange => {
      if (cmd.dryRun) {
        return;
      }

      return (0, _sync.syncPublicStoriesState)(cmd.publicProjectId, storiesToChange);
    });
  });
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