# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Released]

## [2.0.0] - August 25, 2020

### Added

- Pull template from GitHub repository [remote-templates.js](/lib/remote-templates.js)
- Connection to REST API to pull templates from Cloud blob storage on DO
- New command-line Requirements: curl

### Modified

- Replaced CI/CD from Travis CI to Github Actions

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