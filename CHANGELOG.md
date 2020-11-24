# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.1.1] - November 2020

### Added

- Bypass option for using remote templates from cloud storage
- useCloud option added to local user config so users can update whether they want to use cloud resources by default (default true)
- Fix for repo templating through selected or new github project repo

### Modified

- Implemented fix for gitbuilder failing on project init when run from path that has spaces.

## [Released]

## [2.1.1] - September 20, 2020

### Added

- Dockerfile for safe running of gitbuilder if user does not wish to install on their own system or does not have node installed already
- Instructions to run in container environment (safe mode)

## [2.1.0] - September 6, 2020

### Added

- Instructions for adding remote templates through templates API
- API Information section to README

### Modified

- README to reflect current and future changes expected for the project

### Removed

- unzipper dependency (unused)

## [2.0.0] - September 2, 2020

### Added

- Pull template from GitHub repository ([remote-templates.js](/lib/remote-templates.js))
- Connection to REST API to pull templates from Cloud blob storage on DO (K8s Storage)

### Modified

- Replaced CI/CD from Travis CI to Github Actions
- Replaced old template selection for build-in to use cloud retrieved templates (K8s Storage)
- Refactored some method names to be more descriptive

### Removed

- Local templates repository from project (should greatly reduce file size)

## [1.1.2] - August 21, 2020

### Added

- Option to disable use of template when creating a project
- Option to disable remote publishing of the locally created git repository

### Modified

- Added CHANGELOG link to README file
- Command output configuration

## [1.1.1] - July 25, 2020

### Removed

- All DS_Store files leftover before adding to .gitignore

## [1.0.2] - July 23, 2020

- Renamed gitbuilder-io package => gitbuilder for easier use/readability

## [1.0.1] - July 22, 2020

### Added

- Command configuration to package.json
- Github issues templates
- Required command dependencies check for PATH of user system

### Changed

- Tagging strategy inside CI/CD

### Removed

- None

## [Unreleased]

## [1.0.0] - July 21, 2020

### Added

- Initial release

### Changed

- None

### Removed

- None