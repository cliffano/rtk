"use strict";
/* eslint no-unused-vars: 0 */
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
    this.rtk.resourceTypes = {
      someresourcetype: { getVersion: this.getVersion },
    };
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
});
