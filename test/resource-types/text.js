"use strict";
/* eslint no-unused-vars: 0 */
/* eslint no-useless-escape: 0 */
import assert from "assert";
import fs from "fs";
import resourceType from "../../lib/resource-types/text.js";
import sinon from "sinon";

describe("text", function () {
  beforeEach(function (done) {
    this.mockFs = sinon.mock(fs);
    done();
  });
  afterEach(function (done) {
    this.mockFs.verify();
    sinon.restore();
    done();
  });

  describe("setVersion", function () {
    it("should only set version but not modify text file when dry run is enabled", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("somefile.txt", "UTF-8")
        .returns(' version = "0.0.0" ');
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: true }, cb);
    });
    it("should set version and modify text file when dry run is disabled", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("somefile.txt", "UTF-8")
        .returns(' version = "0.0.0" ');
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs("somefile.txt", ' version = "1.2.3" ', sinon.match.func)
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
    it("should set version and modify text file when there are multiple matches", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("somefile.txt", "UTF-8")
        .returns(' version1 = "0.0.0", version2 = "1.1.1-beta" ');
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "somefile.txt",
          ' version1 = "1.2.3", version2 = "1.2.3" ',
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
  });

  describe("getVersion", function () {
    it("should get version from text resource", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "0.0.0" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "0.0.0");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it("should get first regex match as version from text resource when there are multiple matches", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "9.8.7" \n side_version = "1.2.3" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "9.8.7");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it("should get version from text resource when the version includes a pre release", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "1.1.1-pre.2" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "1.1.1-pre.2");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

  describe("isReadyForRelease", function () {
    it("should pass error without reading the file when params.regex is not configured", function (done) {
      const resource = { path: "somefile.txt", type: "text" };
      this.mockFs.expects("readFile").never();
      function cb(err, result) {
        assert.equal(
          err.message,
          "text resource somefile.txt has no params.regex configured",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when regex matches an empty version", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: { regex: "\\d*" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "main" ');
      function cb(err, result) {
        assert.equal(
          err.message,
          "Regex \\d* matches an empty version in text resource somefile.txt",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when regex is invalid", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: { regex: "(\\d+" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "0.0.0" ');
      function cb(err, result) {
        assert.ok(
          err.message.startsWith(
            "Invalid regex (\\d+ for text resource somefile.txt. Error: Invalid regular expression",
          ),
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should be ready for release when regex matches", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "0.0.0" ');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when regex does not match", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, ' version = "main" ');
      function cb(err, result) {
        assert.equal(
          err.message,
          "Regex (\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))? does not match any version in text resource somefile.txt",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when file cannot be read", function (done) {
      const resource = {
        path: "somefile.txt",
        type: "text",
        params: {
          regex:
            "(\\d+)\\.(\\d+)\\.(\\d+)(?:-([0-9A-Za-z-]+(?:.[0-9A-Za-z-]+)*))?",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somefile.txt", "UTF-8", sinon.match.func)
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
