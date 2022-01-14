"use strict"
import assert from 'assert';
import versionScheme from '../../lib/version-schemes/semver.js';

describe('semver', function() {

  describe('default release increment type and default post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0');
      done();
    });
    it('should increment minor version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '1.3.0');
      done();
    });
    it('should increment patch version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '1.3.1-pre.0');
      done();
    });
  });

  describe('minor release increment type and patch post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0', 'minor', 'patch');
      done();
    });
    it('should increment minor version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '1.3.0');
      done();
    });
    it('should increment patch version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '1.3.1-pre.0');
      done();
    });
  });

  describe('major release increment type and patch post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0', 'major', 'patch');
      done();
    });
    it('should increment major version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '2.0.0');
      done();
    });
    it('should increment patch version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '2.0.1-pre.0');
      done();
    });
  });

  describe('major release increment type and minor post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0', 'major', 'minor');
      done();
    });
    it('should increment major version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '2.0.0');
      done();
    });
    it('should increment minor version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '2.1.0-pre.0');
      done();
    });
  });

  describe('minor release increment type and patch post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0', 'minor', 'patch');
      done();
    });
    it('should increment minor version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '1.3.0');
      done();
    });
    it('should increment patch version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '1.3.1-pre.0');
      done();
    });
  });

  describe('minor release increment type and minor post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0', 'minor', 'minor');
      done();
    });
    it('should increment minor version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '1.3.0');
      done();
    });
    it('should increment minor version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '1.4.0-pre.0');
      done();
    });
  });

  describe('patch release increment type and patch post release increment type', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0-pre.0', 'patch', 'patch');
      done();
    });
    it('should increment minor version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '1.2.0');
      done();
    });
    it('should increment patch version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '1.2.1-pre.0');
      done();
    });
  });

  describe('default release increment type and default post release increment type with non-prerelease version', function() {
    beforeEach(function (done) {
      this.versionScheme = new versionScheme('1.2.0');
      done();
    });
    it('should increment minor version for release version', function(done) {
      assert.equal(this.versionScheme.getReleaseVersion(), '1.3.0');
      done();
    });
    it('should increment patch version for post release version', function(done) {
      assert.equal(this.versionScheme.getPostReleaseVersion(), '1.3.1-pre.0');
      done();
    });
  });
});
