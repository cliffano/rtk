# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Add resource-level version formatting #6
- Add node 15 and 16 to CI workflow
- Add upgrade-deps workflow
- Add release-major, release-minor, release-patch workflows
- Add publish workflow

## 2.1.0 - 2021-07-17
### Added
- Add array property support for yaml and json resource types

## 2.0.0 - 2020-07-08
### Changed
- Change module type to ESM
- Set min node engine to >= 13.0.0
- Replace lint type from jshint to eslint
- Replace coverage from buster-istanbul to c8
- Replace doc type from dox-foundation to jsdoc
- Replace Travis CI with GH Actions

## 1.1.0 - 2020-06-19
### Added
- Add tag format support

## 1.0.0 - 2020-01-30
### Added
- Add new config properties `resources.params.release_value` and `resources.params.post_release_value`
- Add support for custom release and post-release increment types

### Changed
- Change default post release version to use patch increment (minor increment was previously used)

## 0.2.0 - 2019-05-12
### Added
- Add yaml resource type
- Add makefile resource type

## 0.1.0 - 2019-03-07
### Added
- Add git SCM scheme

### Fixed
- Fix release steps execution sequence
- Fix changelog links removal following a release

## 0.0.1 - 2019-02-13
### Added
- Initial version
