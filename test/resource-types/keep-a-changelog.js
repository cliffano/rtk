"use strict";
/* eslint no-unused-vars: 0 */
import assert from "assert";
import fs from "fs";
import resourceType from "../../lib/resource-types/keep-a-changelog.js";
import sinon from "sinon";

describe("keep-a-changelog", function () {
  beforeEach(function (done) {
    this.mockFs = sinon.mock(fs);
    done();
  });
  afterEach(function (done) {
    this.mockFs.verify();
    sinon.restore();
    done();
  });

  describe("setReleaseVersion", function () {
    it("should only set version but not modify changelog file when dry run is enabled", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

## Unreleased
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8")
        .returns(changelogContent);
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion(
        "1.2.3",
        resource,
        { dryRun: true, tagFormat: "{version}" },
        cb,
      );
    });

    it("should set version and modify changelog file when dry run is disabled", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog
All notable changes to this project will be documented in this file.

## Unreleased
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      const currentDate = new Date().toISOString().split("T")[0];
      const updatedChangelogContent = `# Changelog
All notable changes to this project will be documented in this file.

## 1.2.3 - ${currentDate}
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8")
        .returns(changelogContent);
      this.mockFs
        .expects("writeFile")
        .once()
        .withArgs("SOMECHANGELOG.md", updatedChangelogContent, sinon.match.func)
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion(
        "1.2.3",
        resource,
        { dryRun: false, tagFormat: "{version}" },
        cb,
      );
    });

    it("should format compare link tags using tag format when changelog has compare links", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog

## Unreleased

## 1.0.0 - 2023-06-15

## 0.0.0 - 2023-01-01

[Unreleased]: https://github.com/someorg/somerepo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/someorg/somerepo/compare/v0.0.0...v1.0.0
[0.0.0]: https://github.com/someorg/somerepo/releases/tag/v0.0.0
`;
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8")
        .returns(changelogContent);
      this.mockFs
        .expects("writeFile")
        .once()
        .withArgs(
          "SOMECHANGELOG.md",
          sinon.match(
            "[1.2.3]: https://github.com/someorg/somerepo/compare/v1.0.0...v1.2.3",
          ),
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion(
        "1.2.3",
        resource,
        { dryRun: false, tagFormat: "v{version}" },
        cb,
      );
    });
  });

  describe("setPostReleaseVersion", function () {
    it("should only add new release but not modify changelog file when dry run is enabled", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

## 1.2.3 - 2023-06-15
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8")
        .returns(changelogContent);
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setPostReleaseVersion(
        "1.2.4",
        resource,
        { dryRun: true, tagFormat: "{version}" },
        cb,
      );
    });

    it("should add new release and modify changelog file when dry run is disabled", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog
All notable changes to this project will be documented in this file.

## 1.2.3 - 2023-06-15
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      const updatedChangelogContent = `# Changelog
All notable changes to this project will be documented in this file.

## Unreleased

## 1.2.3 - 2023-06-15
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8")
        .returns(changelogContent);
      this.mockFs
        .expects("writeFile")
        .once()
        .withArgs("SOMECHANGELOG.md", updatedChangelogContent, sinon.match.func)
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setPostReleaseVersion(
        "Unreleased",
        resource,
        { dryRun: false, tagFormat: "{version}" },
        cb,
      );
    });

    it("should format compare link tags using tag format when changelog has compare links", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog

## 1.0.0 - 2023-06-15

## 0.0.0 - 2023-01-01

[1.0.0]: https://github.com/someorg/somerepo/compare/v0.0.0...v1.0.0
[0.0.0]: https://github.com/someorg/somerepo/releases/tag/v0.0.0
`;
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8")
        .returns(changelogContent);
      this.mockFs
        .expects("writeFile")
        .once()
        .withArgs(
          "SOMECHANGELOG.md",
          sinon.match(
            "[Unreleased]: https://github.com/someorg/somerepo/compare/v1.0.0...HEAD",
          ),
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setPostReleaseVersion(
        "1.0.1-pre.0",
        resource,
        { dryRun: false, tagFormat: "v{version}" },
        cb,
      );
    });
  });

  describe("getVersion", function () {
    it("should get version from latest release when it has a version number", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

## 1.2.3 - 2023-06-15
### Added
- Some new feature

### Changed
- Updated something

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, changelogContent);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "1.2.3");
        done();
      }
      resourceType.getVersion(resource, cb);
    });

    it("should get version from previous release suffix when latest release is Unreleased", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog

All notable changes to this project will be documented in this file.

## Unreleased
### Added
- Some new feature

### Changed
- Updated something

## 1.2.3 - 2023-06-15
### Added
- Previous feature

## 0.0.0 - 2023-01-01
### Added
- Initial release
`;
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, changelogContent);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "1.2.3");
        done();
      }
      resourceType.getVersion(resource, cb);
    });

    it("should default to 0.0.0 when no version is found", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const changelogContent = `# Changelog
All notable changes to this project will be documented in this file.

## Unreleased
### Added
- Some new feature
`;
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, changelogContent);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "0.0.0");
        done();
      }
      resourceType.getVersion(resource, cb);
    });

    it("should handle parse error and throw", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const invalidChangelogContent = `# Inva lid Changelog

This is not a valid keep-a-changelog format.

### Some Invalid Section
`;
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, invalidChangelogContent);
      function cb(err, result) {
        // This callback should not be called
        // However, if it is called, then assert fail will actually throw an error
        assert.fail("Should have thrown an error");
      }
      try {
        resourceType.getVersion(resource, cb);
      } catch (err) {
        assert.ok(err);
        console.dir(err.message);
        assert.ok(
          err.message.includes(
            "Failed to parse changelog. Please fix the changelog following the keep a changelog format https://keepachangelog.com . Error: Parse error in the line 5: Unexpected content",
          ),
        );
        done();
      }
    });

    it("should handle file read error and pass it to callback", function (done) {
      const resource = {
        path: "SOMECHANGELOG.md",
        type: "keep-a-changelog",
      };
      const err = new Error("File not found");
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(2, err);
      function cb(_err, result) {
        assert.equal(_err, err);
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

  describe("isReadyForRelease", function () {
    it("should be ready for release when Unreleased section has changes", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          `# Changelog

## Unreleased
### Added
- Some new feature

## 1.2.3 - 2023-06-15
### Added
- Previous feature
`,
        );
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should be ready for release when bracketed Unreleased section has changes", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          `# Changelog

## [Unreleased]
### Added
- Some new feature

## [1.2.3] - 2023-06-15
### Added
- Previous feature

[Unreleased]: https://github.com/someorg/somerepo/compare/v1.2.3...HEAD
[1.2.3]: https://github.com/someorg/somerepo/releases/tag/v1.2.3
`,
        );
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when Unreleased section is empty", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          `# Changelog

## Unreleased

## 1.2.3 - 2023-06-15
### Added
- Previous feature
`,
        );
      function cb(err, result) {
        assert.equal(
          err.message,
          "Unreleased section in keep-a-changelog resource SOMECHANGELOG.md has no changes",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when changelog has no Unreleased section", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          `# Changelog

## 1.2.3 - 2023-06-15
### Added
- Previous feature
`,
        );
      function cb(err, result) {
        assert.equal(
          err.message,
          "keep-a-changelog resource SOMECHANGELOG.md has no Unreleased section",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when changelog has no release", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          `# Changelog

`,
        );
      function cb(err, result) {
        assert.equal(
          err.message,
          "keep-a-changelog resource SOMECHANGELOG.md has no Unreleased section",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when changelog cannot be parsed", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          `# Changelog

## Some invalid release title
`,
        );
      function cb(err, result) {
        assert.ok(
          err.message.startsWith(
            "Failed to parse changelog. Please fix the changelog following the keep a changelog format https://keepachangelog.com . Error: ",
          ),
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when file cannot be read", function (done) {
      const resource = { path: "SOMECHANGELOG.md", type: "keep-a-changelog" };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("SOMECHANGELOG.md", "UTF-8", sinon.match.func)
        .callsArgWith(2, new Error("someerror"));
      function cb(err, result) {
        assert.equal(err.message, "someerror");
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
  });
});
