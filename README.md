# Pivotal Tracker Governor

Your governor to help you sync stories between your private and public board.

## Installation

```bash
npm install -g tracker-governor
```

## Usage

Find your [Tracker API Token](https://www.pivotaltracker.com/help/articles/api_token/) and export it to `TG_API_TOKEN` 
environment variable.

```bash
export TG_API_TOKEN=<your token>
```

### sync 

`sync` command synchronizes the story state between Public and Private projects

```bash
tracker-governor sync --help

Usage: sync [options]

sync state of public and private stories

Options:
  -u, --public-project-id <id>   Project ID of the public project
  -r, --private-project-id <id>  Project ID of the private project
  -d, --dry-run                  Don't perform any changes, print actions
  -y, --yes                      Automatic yes to prompts
  -s, --silent                   Use with --yes to silently change all stories
  -h, --help                     output usage information
```

## server

`server` commands starts the server which listens to new activity in the private project and wil update the state of the
public stories when the state of the private story is updated.

You have to add webhook URL of the server where the `tracker-governor server` is run to your [Private project settings](https://www.pivotaltracker.com/help/articles/changing_project_settings/).

```bash
tracker-governor server --help
Usage: server [options]

start server to listen for project activity and sync stories state

Options:
  -u, --public-project-id <id>   Project ID of the public project
  -r, --private-project-id <id>  Project ID of the private project
  -h, --help                     output usage information
```
