#!/usr/bin/env node

const program = require('commander')
const sync = require('../src/sync')

program
  .version('0.0.1')
  .command('sync')
  .description('sync state of public and private stories')
  .option('-u, --public-project-id <id>', 'Project ID of the public project')
  .option('-r, --private-project-id <id>', 'Project ID of the private project')
  .option('-d, --dry-run', 'Don\'t perform any changes, print actions')
  .action(function(cmd) {
    sync(cmd.publicProjectId, cmd.privateProjectId, { dryRun: cmd.dryRun})
  })

program.parse(process.argv)
