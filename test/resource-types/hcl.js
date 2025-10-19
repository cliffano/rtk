"use strict";
/* eslint no-unused-vars: 0 */
import assert from 'assert';
import bag from 'bagofcli';
import fs from 'fs';
import resourceType from '../../lib/resource-types/hcl.js';
import sinon from 'sinon';

describe('hcl', function() {

  beforeEach(function (done) {
    this.mockBag = sinon.mock(bag);
    this.mockFs = sinon.mock(fs);
    done();
  });
  afterEach(function (done) {
    this.mockBag.verify();
    this.mockFs.verify();
    sinon.restore();
    done();
  });

  describe('setVersion', function() {
    it('should only set version but not modify hcl file when dry run is enabled', function(done) {
      const resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFileSync').never();
      this.mockFs.expects('writeFile').never();
      function cb(err, result) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: true }, cb);
    });
    it('should set call hcledit via execaSync when dry run is disabled', function(done) {
      const resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'variable.tags.default.version'
        }
      };
      this.mockFs.expects('readFileSync').never();
      this.mockFs.expects('writeFile').never();
      this.mockBag
        .expects('exec')
        .once()
        .withArgs('hcledit attribute set variable.tags.default.version 1.2.3 -f variables.tf -u', false, sinon.match.func)
        .callsArgWith(2, null, 'somestdout', 'somestderr', { exitCode: 0 });
      function cb(err) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
    it('should set array property under a section', function(done) {
      const resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'package.versions[1]'
        }
      };
      this.mockFs.expects('readFileSync').never();
      this.mockFs.expects('writeFile').never();
      this.mockBag
        .expects('exec')
        .once()
        .withArgs('hcledit attribute set package.versions[1] 1.2.3 -f variables.tf -u', false, sinon.match.func)
        .callsArgWith(2, null, 'somestdout', 'somestderr', { exitCode: 0 });
      function cb(err) {
        assert.equal(err, null);
        done();
      }
      resourceType.setReleaseVersion('1.2.3', resource, { dryRun: false }, cb);
    });
  });

  describe('getVersion', function() {
    it('should get version from resource property', function(done) {
      const resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'version'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('variables.tf', 'UTF-8', sinon.match.func).callsArgWith(2, null, 'version = "0.0.0"');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it('should get array property as a subproperty', function(done) {
      const resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'package.versions[1]'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('variables.tf', 'UTF-8', sinon.match.func).callsArgWith(2, null, 'package = { versions = ["9.9.9", "0.0.0", "8.8.8"] }');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
    it('should get array property under a resource', function(done) {
      const resource = {
        path: 'variables.tf',
        type: 'hcl',
        params: {
          property: 'resource.something.somename[0].package.versions[1]'
        }
      };
      this.mockFs.expects('readFile').once().withExactArgs('variables.tf', 'UTF-8', sinon.match.func).callsArgWith(2, null, 'resource "something" "somename" { package = { versions = ["9.9.9", "0.0.0", "8.8.8"] }}');
      function cb(err, result) {
        assert.equal(err, null);
        assert.equal(result, '0.0.0');
        done();
      }
      resourceType.getVersion(resource, cb);
    });
  });

});
