"use strict";
/* eslint no-unused-vars: 0 */
import RTK from '../../lib/release-schemes/rtk.js';
import referee from '@sinonjs/referee';
const assert = referee.assert;

describe('rtk', function() {

  describe('default rtk release scheme', function() {
    beforeEach(function (done) {
      this.rtk = new RTK('semver', 'git', '0.0.0', {});
      done();
    });
    it('should initialise version schemes', function (done) {
      assert.keys(this.rtk.versionSchemes, ['semver']);
      done();
    });
    it('should initialise scm schemes', function (done) {
      assert.keys(this.rtk.scmSchemes, ['git']);
      done();
    });
    it('should initialise resource types', function (done) {
      assert.keys(this.rtk.resourceTypes, ['json', 'makefile', 'text', 'toml', 'yaml', 'keep-a-changelog']);
      done();
    });
    it('should initialise version scheme', function (done) {
      assert.isObject(this.rtk.versionScheme);
      done();
    });
    it('should initialise scm scheme', function (done) {
      assert.isObject(this.rtk.scmScheme);
      done();
    });
    it('should not have label', function (done) {
      assert.equals(this.rtk.logOpts, {});
      done();
    });
  });

  describe('default rtk release scheme', function() {
    beforeEach(function (done) {
      this.rtk = new RTK('semver', 'git', '0.0.0', { dryRun: true });
      done();
    });
    it('should not have label', function (done) {
      assert.equals(this.rtk.logOpts.labels[0], 'dry run');
      done();
    });
  });
});