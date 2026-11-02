"use strict";
/* eslint no-unused-vars: 0 */
import assert from "assert";
import fs from "fs";
import resourceType from "../../lib/resource-types/makefile.js";
import sinon from "sinon";

describe("makefile", function () {
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
    it("should only set version but not modify makefile when dry run is enabled", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: {
          variable: "version",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("somemakefile", "UTF-8")
        .returns("version ?= 0.0.0");
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: true }, cb);
    });
    it("should set version and modify makefile when dry run is disabled", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: {
          variable: "version",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("somemakefile", "UTF-8")
        .returns("version ?= 0.0.0");
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs("somemakefile", "version ?= 1.2.3", sinon.match.func)
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
  });

  describe("getVersion", function () {
    it("should get version from resource variable", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: {
          variable: "version",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somemakefile", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "version ?= 0.0.0");
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "0.0.0");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

  describe("isReadyForRelease", function () {
    it("should pass error without reading the file when params.variable is not configured", function (done) {
      const resource = { path: "somemakefile", type: "makefile" };
      this.mockFs.expects("readFile").never();
      function cb(err, result) {
        assert.equal(
          err.message,
          "Makefile resource somemakefile has no params.variable configured",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when variable has no value", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: { variable: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somemakefile", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "version ?=");
      function cb(err, result) {
        assert.equal(
          err.message,
          "Variable version has no value in Makefile resource somemakefile",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should be ready for release when variable exists", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: { variable: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somemakefile", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "version ?= 0.0.0");
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when variable does not exist", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: { variable: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somemakefile", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "name ?= somemakefile");
      function cb(err, result) {
        assert.equal(
          err.message,
          "Variable version does not exist in Makefile resource somemakefile",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when file cannot be read", function (done) {
      const resource = {
        path: "somemakefile",
        type: "makefile",
        params: { variable: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("somemakefile", "UTF-8", sinon.match.func)
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
