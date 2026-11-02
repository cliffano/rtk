"use strict";
/* eslint no-unused-vars: 0 */
import bag from "bagofcli";
import RTK from "../../lib/release-schemes/rtk.js";
import referee from "@sinonjs/referee";
import sinon from "sinon";
const assert = referee.assert;

/**
 * Create release scheme with stubbed resource type and SCM scheme, and with
 * bagofcli logging silenced.
 *
 * @param {Object} opts - release settings
 * @return {Object} test fixture with rtk, resourceType, and scmScheme
 */
function _createFixture(opts) {
  sinon.stub(bag, "logStepHeading");
  sinon.stub(bag, "logStepItemSuccess");
  const rtk = new RTK("semver", "git", "1.2.3-pre.0", opts);
  const resourceType = {
    setReleaseVersion: sinon.stub().callsArgWith(3, null),
    setPostReleaseVersion: sinon.stub().callsArgWith(3, null),
  };
  const scmScheme = {
    saveChanges: sinon.stub().callsArgWith(2, null),
    addVersion: sinon.stub().callsArgWith(1, null),
  };
  rtk.resourceTypes = { someresourcetype: resourceType };
  rtk.scmScheme = scmScheme;
  return { rtk: rtk, resourceType: resourceType, scmScheme: scmScheme };
}

describe("rtk", function () {
  describe("default rtk release scheme", function () {
    beforeEach(function (done) {
      this.rtk = new RTK("semver", "git", "0.0.0", {});
      done();
    });
    it("should initialise version schemes", function (done) {
      assert.keys(this.rtk.versionSchemes, ["semver"]);
      done();
    });
    it("should initialise scm schemes", function (done) {
      assert.keys(this.rtk.scmSchemes, ["git"]);
      done();
    });
    it("should initialise resource types", function (done) {
      assert.keys(this.rtk.resourceTypes, [
        "hcl",
        "json",
        "makefile",
        "text",
        "toml",
        "xml",
        "yaml",
        "keep-a-changelog",
      ]);
      done();
    });
    it("should initialise version scheme", function (done) {
      assert.isObject(this.rtk.versionScheme);
      done();
    });
    it("should initialise scm scheme", function (done) {
      assert.isObject(this.rtk.scmScheme);
      done();
    });
    it("should not have label", function (done) {
      assert.equals(this.rtk.logOpts, {});
      done();
    });
  });

  describe("default rtk release scheme", function () {
    beforeEach(function (done) {
      this.rtk = new RTK("semver", "git", "0.0.0", { dryRun: true });
      done();
    });
    it("should not have label", function (done) {
      assert.equals(this.rtk.logOpts.labels[0], "dry run");
      done();
    });
  });

  describe("rtk release scheme with unspecified schemes", function () {
    it("should default to semver version scheme and git scm scheme", function () {
      const rtk = new RTK(undefined, undefined, "1.2.3-pre.0", {});
      assert.equals(rtk.versionScheme.getReleaseVersion(), "1.3.0");
      assert.same(rtk.scmScheme, rtk.scmSchemes.git);
    });
  });
});

describe("release-schemes/rtk - pre", function () {
  beforeEach(function () {
    this.resources = [
      { type: "someresourcetype", path: "somefile1" },
      { type: "someresourcetype", path: "somefile2" },
    ];
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should set release version on all resources and commit the changes when dry run is disabled", function (done) {
    const self = this;
    const opts = { dryRun: false };
    const f = _createFixture(opts);
    f.rtk.pre(this.resources, opts, function (err) {
      assert.isNull(err);
      assert.equals(f.resourceType.setReleaseVersion.callCount, 2);
      assert.equals(
        f.resourceType.setReleaseVersion.firstCall.args[0],
        "1.3.0",
      );
      assert.same(
        f.resourceType.setReleaseVersion.secondCall.args[1],
        self.resources[1],
      );
      assert.equals(f.scmScheme.saveChanges.callCount, 1);
      assert.equals(
        f.scmScheme.saveChanges.firstCall.args[0],
        "Release version 1.3.0",
      );
      assert.equals(f.scmScheme.saveChanges.firstCall.args[1], [
        "somefile1",
        "somefile2",
      ]);
      done();
    });
  });

  it("should set release version but not commit the changes when dry run is enabled", function (done) {
    const opts = { dryRun: true };
    const f = _createFixture(opts);
    f.rtk.pre(this.resources, opts, function (err) {
      assert.isNull(err);
      assert.equals(f.resourceType.setReleaseVersion.callCount, 2);
      assert.equals(f.scmScheme.saveChanges.callCount, 0);
      done();
    });
  });

  it("should use resource release value and format when they are specified", function (done) {
    const opts = { dryRun: true };
    const f = _createFixture(opts);
    const resources = [
      {
        type: "someresourcetype",
        path: "somefile1",
        params: { release_value: "9.9.9", release_format: "v{version}" },
      },
      {
        type: "someresourcetype",
        path: "somefile2",
        params: { release_format: "release-{version}" },
      },
    ];
    f.rtk.pre(resources, opts, function (err) {
      assert.equals(
        f.resourceType.setReleaseVersion.firstCall.args[0],
        "v9.9.9",
      );
      assert.equals(
        f.resourceType.setReleaseVersion.secondCall.args[0],
        "release-1.3.0",
      );
      done();
    });
  });

  it("should pass error to callback when commit fails", function (done) {
    const opts = { dryRun: false };
    const f = _createFixture(opts);
    f.scmScheme.saveChanges.callsArgWith(2, new Error("someerror"));
    f.rtk.pre(this.resources, opts, function (err) {
      assert.equals(err.message, "someerror");
      done();
    });
  });
});

describe("release-schemes/rtk - release", function () {
  afterEach(function () {
    sinon.restore();
  });

  it("should add formatted release version tag when dry run is disabled", function (done) {
    const opts = { dryRun: false, tagFormat: "v{version}" };
    const f = _createFixture(opts);
    f.rtk.release([], opts, function (err) {
      assert.isNull(err);
      assert.equals(f.scmScheme.addVersion.callCount, 1);
      assert.equals(f.scmScheme.addVersion.firstCall.args[0], "v1.3.0");
      done();
    });
  });

  it("should not add release version tag when dry run is enabled", function (done) {
    const opts = { dryRun: true, tagFormat: "{version}" };
    const f = _createFixture(opts);
    f.rtk.release([], opts, function (err) {
      assert.isNull(err);
      assert.equals(f.scmScheme.addVersion.callCount, 0);
      done();
    });
  });
});

describe("release-schemes/rtk - post", function () {
  beforeEach(function () {
    this.resources = [
      { type: "someresourcetype", path: "somefile1" },
      { type: "someresourcetype", path: "somefile2" },
    ];
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should set post-release version on all resources and commit the changes when dry run is disabled", function (done) {
    const opts = { dryRun: false };
    const f = _createFixture(opts);
    f.rtk.post(this.resources, opts, function (err) {
      assert.isNull(err);
      assert.equals(f.resourceType.setPostReleaseVersion.callCount, 2);
      assert.equals(
        f.resourceType.setPostReleaseVersion.firstCall.args[0],
        "1.3.1-pre.0",
      );
      assert.equals(f.scmScheme.saveChanges.callCount, 1);
      assert.equals(
        f.scmScheme.saveChanges.firstCall.args[0],
        "Bump up to next pre-release version 1.3.1-pre.0",
      );
      assert.equals(f.scmScheme.saveChanges.firstCall.args[1], [
        "somefile1",
        "somefile2",
      ]);
      done();
    });
  });

  it("should set post-release version but not commit the changes when dry run is enabled", function (done) {
    const opts = { dryRun: true };
    const f = _createFixture(opts);
    f.rtk.post(this.resources, opts, function (err) {
      assert.isNull(err);
      assert.equals(f.resourceType.setPostReleaseVersion.callCount, 2);
      assert.equals(f.scmScheme.saveChanges.callCount, 0);
      done();
    });
  });

  it("should use resource post-release value when it is specified", function (done) {
    const opts = { dryRun: true };
    const f = _createFixture(opts);
    const resources = [
      {
        type: "someresourcetype",
        path: "somefile1",
        params: { post_release_value: "9.9.9-SNAPSHOT" },
      },
    ];
    f.rtk.post(resources, opts, function (err) {
      assert.equals(
        f.resourceType.setPostReleaseVersion.firstCall.args[0],
        "9.9.9-SNAPSHOT",
      );
      done();
    });
  });

  it("should pass error to callback when commit fails", function (done) {
    const opts = { dryRun: false };
    const f = _createFixture(opts);
    f.scmScheme.saveChanges.callsArgWith(2, new Error("someerror"));
    f.rtk.post(this.resources, opts, function (err) {
      assert.equals(err.message, "someerror");
      done();
    });
  });
});
