"use strict";
/* eslint no-unused-vars: 0 */
import assert from "assert";
import fs from "fs";
import resourceType from "../../lib/resource-types/xml.js";
import sinon from "sinon";

const POM = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <!-- P A R E N T -->
    <parent>
        <groupId>com.someorg</groupId>
        <artifactId>someparent</artifactId>
        <version>1.0.0</version>
        <relativePath />
    </parent>
    <artifactId>someartifact</artifactId>
    <version>1.2.3-pre.0</version>
    <dependencies>
        <dependency>
            <artifactId>somedependency</artifactId>
            <version>4.5.6</version>
        </dependency>
    </dependencies>
</project>
`;

describe("xml", function () {
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
    it("should only set version but not modify xml file when dry run is enabled", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("pom.xml", "UTF-8")
        .returns(POM);
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: true }, cb);
    });
    it("should only replace the element text and keep the rest of xml file as-is when dry run is disabled", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("pom.xml", "UTF-8")
        .returns(POM);
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "pom.xml",
          POM.replace(
            "<version>1.2.3-pre.0</version>",
            "<version>1.2.3</version>",
          ),
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
    it("should set version on nested element", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.parent.version" },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("pom.xml", "UTF-8")
        .returns(POM);
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "pom.xml",
          POM.replace(
            "<version>1.0.0</version>",
            "<version>1.2.4-pre.0</version>",
          ),
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setPostReleaseVersion(
        "1.2.4-pre.0",
        resource,
        { dryRun: false },
        cb,
      );
    });
    it("should keep whitespace around the element text", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("pom.xml", "UTF-8")
        .returns("<project><version>\n  1.2.3-pre.0\n</version></project>");
      this.mockFs
        .expects("writeFile")
        .once()
        .withExactArgs(
          "pom.xml",
          "<project><version>\n  1.2.3\n</version></project>",
          sinon.match.func,
        )
        .callsArgWith(2, null);
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
    it("should pass error when element does not exist", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.someelement" },
      };
      this.mockFs
        .expects("readFileSync")
        .once()
        .withExactArgs("pom.xml", "UTF-8")
        .returns(POM);
      this.mockFs.expects("writeFile").never();
      function cb(err, result) {
        assert.equal(
          err.message,
          "Property project.someelement does not exist in XML resource pom.xml",
        );
        done();
      }
      resourceType.setReleaseVersion("1.2.3", resource, { dryRun: false }, cb);
    });
  });

  describe("getVersion", function () {
    it("should get version from resource element", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, POM);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "1.2.3-pre.0");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it("should get version from nested resource element", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.parent.version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, POM);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, "1.0.0");
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it("should not get version from element which has child elements", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.parent" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, POM);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, undefined);
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

  describe("isReadyForRelease", function () {
    it("should pass error without reading the file when params.property is not configured", function (done) {
      const resource = { path: "pom.xml", type: "xml" };
      this.mockFs.expects("readFile").never();
      function cb(err, result) {
        assert.equal(
          err.message,
          "XML resource pom.xml has no params.property configured",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when property has no value", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "<project><version> </version></project>");
      function cb(err, result) {
        assert.equal(
          err.message,
          "Property project.version has no value in XML resource pom.xml",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should be ready for release when element exists", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, POM);
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, true);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when element does not exist", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.someelement" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, POM);
      function cb(err, result) {
        assert.equal(
          err.message,
          "Property project.someelement does not exist in XML resource pom.xml",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when element is self-closing", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.parent.relativePath" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, POM);
      function cb(err, result) {
        assert.equal(
          err.message,
          "Property project.parent.relativePath does not exist in XML resource pom.xml",
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when xml file cannot be parsed", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
        .callsArgWith(2, null, "<project><version>1.2.3</project>");
      function cb(err, result) {
        assert.ok(
          err.message.startsWith(
            "Failed to parse XML resource pom.xml. Error: Unexpected close tag",
          ),
        );
        assert.equal(result, undefined);
        done();
      }
      resourceType.isReadyForRelease(resource, cb);
    });
    it("should pass error when file cannot be read", function (done) {
      const resource = {
        path: "pom.xml",
        type: "xml",
        params: { property: "project.version" },
      };
      this.mockFs
        .expects("readFile")
        .once()
        .withExactArgs("pom.xml", "UTF-8", sinon.match.func)
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
