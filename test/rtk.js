"use strict";
/* eslint no-unused-vars: 0 */
import bag from "bagofcli";
import referee from "@sinonjs/referee";
import sinon from "sinon";
import RTK from "../lib/rtk.js";
const assert = referee.assert;

describe("rtk - constructor", function () {
  it("should set resources and opts when they are specified", function () {
    const resources = [{ type: "json", path: "package.json" }];
    const rtk = new RTK(resources, { dryRun: true });
    assert.equals(rtk.resources, resources);
    assert.equals(rtk.opts, { dryRun: true });
  });

  it("should default resources and opts when they are not specified", function () {
    const rtk = new RTK();
    assert.equals(rtk.resources, {});
    assert.equals(rtk.opts, {});
  });

  it("should initialise release schemes and resource types", function () {
    const rtk = new RTK([]);
    assert.keys(rtk.releaseSchemes, ["rtk"]);
    assert.keys(rtk.resourceTypes, [
      "hcl",
      "json",
      "makefile",
      "text",
      "toml",
      "xml",
      "yaml",
      "keep-a-changelog",
    ]);
  });
});

describe("rtk - release", function () {
  beforeEach(function () {
    this.resources = [
      { type: "someresourcetype", path: "somefile1" },
      { type: "someresourcetype", path: "somefile2" },
    ];
    this.opts = { dryRun: false };
    this.calls = [];
    const calls = this.calls;

    // Fake release scheme, records constructor args and calls to each step
    function FakeReleaseScheme(
      versionSchemeName,
      scmSchemeName,
      preReleaseVersion,
      opts,
    ) {
      calls.push([
        "new",
        versionSchemeName,
        scmSchemeName,
        preReleaseVersion,
        opts,
      ]);
    }
    ["pre", "release", "post"].forEach(function (step) {
      FakeReleaseScheme.prototype[step] = function (resources, opts, cb) {
        calls.push([step, resources, opts]);
        cb(null, step);
      };
    });

    this.rtk = new RTK(this.resources, this.opts);
    this.rtk.releaseSchemes = { rtk: FakeReleaseScheme };
    this.getVersion = sinon.stub();
    this.isReadyForRelease = sinon.stub().callsArgWith(1, null, true);
    this.rtk.resourceTypes = {
      someresourcetype: {
        getVersion: this.getVersion,
        isReadyForRelease: this.isReadyForRelease,
      },
    };
    sinon.stub(bag, "logStepHeading");
    sinon.stub(bag, "logStepItemSuccess");
    sinon.stub(bag, "logStepItemWarning");
  });

  afterEach(function () {
    sinon.restore();
  });

  it("should get version from first resource then execute pre, release, and post steps when schemes are not specified", function (done) {
    const self = this;
    this.getVersion.callsArgWith(1, null, "1.2.3-pre.0");
    this.rtk.release(undefined, undefined, undefined, function (err, results) {
      assert.isNull(err);
      assert.equals(results, ["1.2.3-pre.0", "pre", "release", "post"]);
      assert.equals(self.isReadyForRelease.callCount, 2);
      assert.same(self.isReadyForRelease.firstCall.args[0], self.resources[0]);
      assert.same(self.isReadyForRelease.secondCall.args[0], self.resources[1]);
      assert.equals(bag.logStepItemSuccess.callCount, 2);
      assert.equals(
        bag.logStepItemSuccess.firstCall.args[0],
        "someresourcetype resource located at somefile1 is ready for release",
      );
      assert.equals(self.getVersion.callCount, 1);
      assert.same(self.getVersion.firstCall.args[0], self.resources[0]);
      assert.equals(self.calls, [
        ["new", "semver", "git", "1.2.3-pre.0", self.opts],
        ["pre", self.resources, self.opts],
        ["release", self.resources, self.opts],
        ["post", self.resources, self.opts],
      ]);
      done();
    });
  });

  it("should pass specified scheme names to release scheme", function (done) {
    const self = this;
    this.getVersion.callsArgWith(1, null, "1.2.3-pre.0");
    this.rtk.release(
      "rtk",
      "someversionscheme",
      "somescmscheme",
      function (err) {
        assert.isNull(err);
        assert.equals(self.calls[0], [
          "new",
          "someversionscheme",
          "somescmscheme",
          "1.2.3-pre.0",
          self.opts,
        ]);
        done();
      },
    );
  });

  it("should pass error to callback and skip release steps when version cannot be retrieved", function (done) {
    const self = this;
    this.getVersion.callsArgWith(1, new Error("someerror"));
    this.rtk.release("rtk", "semver", "git", function (err) {
      assert.equals(err.message, "someerror");
      assert.equals(self.calls, []);
      done();
    });
  });

  it("should pass error to callback and skip release steps when a resource is not ready for release", function (done) {
    const self = this;
    this.isReadyForRelease.onSecondCall().callsArgWith(1, null, false);
    this.rtk.release("rtk", "semver", "git", function (err) {
      assert.equals(
        err.message,
        "Release failed because not all resources are ready for release",
      );
      assert.equals(self.isReadyForRelease.callCount, 2);
      assert.equals(self.getVersion.callCount, 0);
      assert.equals(self.calls, []);
      assert.equals(bag.logStepItemWarning.callCount, 1);
      assert.equals(
        bag.logStepItemWarning.firstCall.args[0],
        "someresourcetype resource located at somefile2 is not ready for release",
      );
      done();
    });
  });

  it("should pass error to callback and skip release steps when a resource cannot be checked for release", function (done) {
    const self = this;
    this.isReadyForRelease
      .onFirstCall()
      .callsArgWith(1, new Error("someerror"));
    this.rtk.release("rtk", "semver", "git", function (err) {
      assert.equals(err.message, "someerror");
      assert.equals(self.isReadyForRelease.callCount, 1);
      assert.equals(self.getVersion.callCount, 0);
      assert.equals(self.calls, []);
      done();
    });
  });

  it("should label log messages when dry run is enabled", function (done) {
    this.rtk.opts = { dryRun: true };
    this.getVersion.callsArgWith(1, null, "1.2.3-pre.0");
    this.rtk.release("rtk", "semver", "git", function (err) {
      assert.isNull(err);
      assert.equals(bag.logStepHeading.firstCall.args[1], {
        labels: ["dry run"],
      });
      done();
    });
  });
});
