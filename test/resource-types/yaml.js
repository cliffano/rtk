"use strict";
/* eslint no-unused-vars: 0 */
import assert from "assert";
import esmock from "esmock";
import fs from "fs";
import resourceType from "../../lib/resource-types/yaml.js";
import sinon from "sinon";

describe("yaml", function () {
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
    it("should only set version but not modify yaml file when dry run is enabled", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "version",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8")
        .returns('version: "0.0.0"');
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: true }, cb);
    });
    it("should set version and modify yaml file when dry run is disabled", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "version",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8")
        .returns('version: "0.0.0"');
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "someplaybook.yaml",
          "---\nversion: 1.2.3\n",
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
    it("should set property under array sub-property", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "versions[1].minor",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8")
        .returns(
          "---\nversions:\n  - major: 1\n    minor: 2\n    patch: 3\n  - major: 8\n    minor: 9\n    patch: 0\n",
        );
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "someplaybook.yaml",
          "---\nversions:\n  - major: 1\n    minor: 2\n    patch: 3\n  - major: 8\n    minor: 9\n    patch: 0\n",
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion(9, resource, { dryRun: false }, cb);
    });
    it("should not double up document separator YAML header when it already exists", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "version",
        },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8")
        .returns('---\nversion: "0.0.0"');
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "someplaybook.yaml",
          "---\nversion: 1.2.3\n",
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
    it("should not prepend document separator YAML header when dumped YAML already has it", async function () {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "version",
        },
      };
      // js-yaml dump doesn't emit a header, so mock it to cover the case
      // where a YAML library does
      const mockResourceType = await esmock(
        "../../lib/resource-types/yaml.js",
        {
          "js-yaml": {
            load: () => ({ version: "0.0.0" }),
            dump: () => "---\nversion: 1.2.3\n",
          },
        },
      );
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8")
        .returns('version: "0.0.0"');
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "someplaybook.yaml",
          "---\nversion: 1.2.3\n",
          sinon.match.func,
        )
        .callsArgWith(2, null);
      await new Promise((resolve, reject) => {
        mockResourceType.setReleaseVersion(
          "1.2.3",
          resource,
          { dryRun: false },
          (err) => (err ? reject(err) : resolve()),
        );
      });
    });
  });

  describe("getVersion", function () {
    it("should get version from resource property", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "version",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, 'version: "0.0.0"');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "0.0.0");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it("should get property under an array array sub-property", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: {
          property: "versions[1].minor",
        },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
        .callsArgWith(
          2,
          null,
          "---\nversions:\n  - major: 1\n    minor: 2\n    patch: 3\n  - major: 8\n    minor: 9\n    patch: 0\n",
        );
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, 9);
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

  describe("isReadyForRelease", function () {
    it("should pass error without reading the file when params.property is not configured", function (done) {
      const resource = { path: "someplaybook.yaml", type: "yaml" };
      this.mockFs.expects("readFile").never();
      function cb(err, result) {
        assert.equal(
          err.message,
          "YAML resource someplaybook.yaml has no params.property configured",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when property has no value", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: { property: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "version:");
      function cb(err, result) {
        assert.equal(
          err.message,
          "Property version has no value in YAML resource someplaybook.yaml",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should be ready for release when property exists", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: { property: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, 'version: "0.0.0"');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when property does not exist", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: { property: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "name: someplaybook");
      function cb(err, result) {
        assert.equal(
          err.message,
          "Property version does not exist in YAML resource someplaybook.yaml",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when yaml file cannot be parsed", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: { property: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "version: [0.0.0");
      function cb(err, result) {
        assert.ok(
          err.message.startsWith(
            "Failed to parse YAML resource someplaybook.yaml. Error: ",
          ),
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when file cannot be read", function (done) {
      const resource = {
        path: "someplaybook.yaml",
        type: "yaml",
        params: { property: "version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("someplaybook.yaml", "UTF-8", sinon.match.func)
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
