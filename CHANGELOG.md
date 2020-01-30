# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- Add new config properties `resources.params.release_value` and `resources.params.post_release_value`

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
