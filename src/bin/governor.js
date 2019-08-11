#!/usr/bin/env node

// @flow

import program from 'commander'
import assert from 'assert'
import inquirer from 'inquirer'
import chalk from 'chalk'
import * as sync from '../sync'
import server from '../server'

program
  .version('0.0.1')

program
  .command('sync')
  .description('sync state of public and private stories')
  .option('-u, --public-project-id <id>', 'Project ID of the public project')
  .option('-r, --private-project-id <id>', 'Project ID of the private project')
  .option('-d, --dry-run', 'Don\'t perform any changes, print actions')
  .option('-y, --yes', 'Automatic yes to prompts')
  .option('-s, --silent', 'Use with --yes to silently change all stories')
  .option('-n, --no-comments', 'Don\'t post comments about updated state')
  .action(function(cmd) {
    assert(cmd.publicProjectId, 'Public project ID is required')
    assert(cmd.privateProjectId, 'Private project ID is required')

    sync.getOutOfSyncStories(cmd.publicProjectId, cmd.privateProjectId)
      .then(outOfSyncStories => {
        if (!cmd.silent) {
          sync.printStories(outOfSyncStories)
        }

        return (cmd.yes ? Promise.resolve(outOfSyncStories) : promptStoriesToChange(outOfSyncStories))
          .then(storiesToChange => {
            if (cmd.dryRun) {
              return;
            }

            return sync.syncPublicStoriesState(cmd.publicProjectId, storiesToChange);
          })
          .then((updatedStories) => {
            if (!cmd.noComments) {
              sync.commentAboutSyncedState(cmd.publicProjectId, updatedStories)
            }
          })
      })
  })

program
  .command('server')
  .description('start server to listen for project activity and sync stories state')
  .option('-u, --public-project-id <id>', 'Project ID of the public project')
  .option('-r, --private-project-id <id>', 'Project ID of the private project')
  .action(function(cmd) {
    assert(cmd.publicProjectId, 'Public project ID is required')
    assert(cmd.privateProjectId, 'Private project ID is required')

    server(cmd.publicProjectId, cmd.privateProjectId)
      .then((port) => {
        console.log(`Server started on port: ${port}`)
      })
      .catch(console.error.bind(console))
  })


program.parse(process.argv)

function promptStoriesToChange(outOfSyncStories) {
  return inquirer
    .prompt(
      outOfSyncStories.map(story => ({
        type: 'expand',
        message: `Change ${chalk.blue(story.name)} state from ${chalk.red(story.currentState)} to ${chalk.green(story.actualState)}?`,
        default: 'change',
        name: story.publicId,
        choices: [
          {
            key: 'y',
            name: 'Change',
            value: 'change',
          },
          {
            key: 'a',
            name: 'Change this one and all next',
            value: 'change_all',
          },
          {
            key: 'n',
            name: 'Don\'t change',
            value: 'dont',
          },
          {
            key: 'd',
            name: 'Don\'t change this and all next',
            value: 'dont_all',
          },
          {
            key: 'q',
            name: 'Quit',
            value: 'quit',
          },
        ],
        when: answers => Object.values(answers).every(a => a !== 'quit' && a !== 'change_all' && a !== 'dont_all'),
      })),
    )
    .then((answers) => {
      const quit = Object.values(answers).some(a => a === 'quit')

      if (quit) {
        return [];
      }

      const changeAll = Object.values(answers).some(a => a === 'change_all')

      return changeAll
        ? outOfSyncStories
        : outOfSyncStories.filter((story) => answers[story.publicId] === 'change')
    })
}
