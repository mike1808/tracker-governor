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
